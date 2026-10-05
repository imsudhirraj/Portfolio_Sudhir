using System.Text;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.DocumentLayoutAnalysis.WordExtractor;

namespace PortfolioAI.Api.Core.Services;

public class ScannedDocumentException(string message) : Exception(message);

public class DocumentTextExtractor(ILogger<DocumentTextExtractor> logger)
{
    public string ExtractText(Stream stream, string? extension)
    {
        // 1. Buffer incoming stream to a seekable MemoryStream to prevent position or concurrency conflicts
        using var memoryStream = new MemoryStream();
        if (stream.CanSeek)
        {
            stream.Seek(0, SeekOrigin.Begin);
        }
        stream.CopyTo(memoryStream);
        memoryStream.Position = 0;

        // 2. Resolve extension. If extension is missing, infer from magic bytes
        var ext = (extension ?? string.Empty).Trim().ToLowerInvariant();
        if (!string.IsNullOrEmpty(ext) && !ext.StartsWith('.'))
        {
            ext = "." + ext;
        }

        if (string.IsNullOrWhiteSpace(ext))
        {
            ext = InferExtensionFromStream(memoryStream);
            memoryStream.Position = 0;
        }

        try
        {
            return ext switch
            {
                ".pdf" => ExtractFromPdf(memoryStream),
                ".docx" => ExtractFromDocx(memoryStream),
                ".txt" or ".text" => ExtractFromTxt(memoryStream),
                _ => throw new NotSupportedException($"Unsupported file format '{extension}'. Supported formats: .pdf, .docx, .txt")
            };
        }
        catch (Exception ex) when (ex is not NotSupportedException && ex is not ScannedDocumentException)
        {
            logger.LogError(ex, "Failed to extract text from {Extension} document", ext);
            throw new InvalidOperationException($"Unable to parse document contents from {ext} file: {ex.Message}", ex);
        }
    }

    private static string InferExtensionFromStream(MemoryStream stream)
    {
        if (stream.Length < 4) return ".txt";
        var header = new byte[4];
        var read = stream.Read(header, 0, 4);
        stream.Position = 0;

        if (read >= 4)
        {
            // %PDF
            if (header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46)
                return ".pdf";
            // PK..
            if (header[0] == 0x50 && header[1] == 0x4B && header[2] == 0x03 && header[3] == 0x04)
                return ".docx";
        }
        return ".txt";
    }

    private string ExtractFromPdf(MemoryStream stream)
    {
        stream.Position = 0;
        using var pdfDocument = PdfDocument.Open(stream);
        var sb = new StringBuilder();
        var totalPages = pdfDocument.NumberOfPages;
        var hasAnyImages = false;

        for (var pageNum = 1; pageNum <= totalPages; pageNum++)
        {
            var page = pdfDocument.GetPage(pageNum);
            var pageText = ExtractPageText(page);

            if (!string.IsNullOrWhiteSpace(pageText))
            {
                sb.AppendLine(pageText);
                sb.AppendLine();
            }

            if (!hasAnyImages)
            {
                try
                {
                    if (page.GetImages().Any())
                    {
                        hasAnyImages = true;
                    }
                }
                catch
                {
                    // Ignore image inspection errors
                }
            }
        }

        var result = sb.ToString().Trim();

        // If no text was extracted, or text is sparse (<60 chars) and contains images, flag as scanned document
        if (string.IsNullOrWhiteSpace(result) || (result.Length < 60 && hasAnyImages))
        {
            if (hasAnyImages)
            {
                throw new ScannedDocumentException("The uploaded PDF appears to be a scanned image or photo without selectable text. Please upload a PDF or DOCX file with selectable text, or use the 'Paste Resume Text' option.");
            }

            throw new InvalidOperationException("The uploaded PDF does not contain any readable text. Please ensure the document is not password-protected or empty.");
        }

        return result;
    }

    private string ExtractPageText(Page page)
    {
        // Strategy 1: Standard word-based extraction with line & column grouping
        try
        {
            var words = page.GetWords()?.ToList();
            if (words != null && words.Count > 0)
            {
                var textFromWords = GroupWordsIntoLines(words);
                if (!string.IsNullOrWhiteSpace(textFromWords))
                {
                    return textFromWords;
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Word-based extraction failed for page {PageNumber}. Falling back to letter extraction.", page.Number);
        }

        // Strategy 2: Glyph / Letter-based reconstruction directly from raw PDF content stream
        try
        {
            var letters = page.Letters?.Where(l => !string.IsNullOrEmpty(l.Value) && !char.IsControl(l.Value[0])).ToList();
            if (letters != null && letters.Count > 0)
            {
                var textFromLetters = ReconstructLinesFromLetters(letters);
                if (!string.IsNullOrWhiteSpace(textFromLetters))
                {
                    return textFromLetters;
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Letter-based extraction failed for page {PageNumber}.", page.Number);
        }

        // Strategy 3: NearestNeighbourWordExtractor fallback
        try
        {
            var nnExtractor = NearestNeighbourWordExtractor.Instance;
            var nnWords = nnExtractor.GetWords(page.Letters)?.ToList();
            if (nnWords != null && nnWords.Count > 0)
            {
                var textFromNn = GroupWordsIntoLines(nnWords);
                if (!string.IsNullOrWhiteSpace(textFromNn))
                {
                    return textFromNn;
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogDebug(ex, "Nearest-neighbor word extraction failed for page {PageNumber}.", page.Number);
        }

        // Strategy 4: Fallback to page.Text
        try
        {
            var fallback = page.Text;
            if (!string.IsNullOrWhiteSpace(fallback))
            {
                return fallback;
            }
        }
        catch { }

        return string.Empty;
    }

    private static string GroupWordsIntoLines(IReadOnlyList<Word> words)
    {
        if (words.Count == 0) return string.Empty;

        var sortedWords = words
            .OrderByDescending(w => w.BoundingBox.Bottom)
            .ThenBy(w => w.BoundingBox.Left)
            .ToList();

        var sb = new StringBuilder();
        var lineWords = new List<Word>();
        double? currentLineY = null;

        foreach (var word in sortedWords)
        {
            var tolerance = Math.Max(3.0, (double)word.BoundingBox.Height * 0.45);

            if (currentLineY == null)
            {
                currentLineY = word.BoundingBox.Bottom;
                lineWords.Add(word);
            }
            else if (Math.Abs(word.BoundingBox.Bottom - currentLineY.Value) <= tolerance)
            {
                lineWords.Add(word);
            }
            else
            {
                FormatAndAppendLine(lineWords, sb);
                lineWords.Clear();
                lineWords.Add(word);
                currentLineY = word.BoundingBox.Bottom;
            }
        }

        if (lineWords.Count > 0)
        {
            FormatAndAppendLine(lineWords, sb);
        }

        return sb.ToString().Trim();
    }

    private static void FormatAndAppendLine(List<Word> lineWords, StringBuilder sb)
    {
        if (lineWords.Count == 0) return;

        var orderedLine = lineWords.OrderBy(w => w.BoundingBox.Left).ToList();
        var lineBuilder = new StringBuilder();
        Word? prevWord = null;

        foreach (var word in orderedLine)
        {
            if (prevWord != null)
            {
                var gap = word.BoundingBox.Left - prevWord.BoundingBox.Right;
                // If there is a massive horizontal gap (> 45pt), format as column separator so columns don't collide
                if (gap > 45.0)
                {
                    lineBuilder.Append("  |  ");
                }
                else
                {
                    lineBuilder.Append(' ');
                }
            }

            lineBuilder.Append(word.Text);
            prevWord = word;
        }

        var lineText = lineBuilder.ToString().Trim();
        if (!string.IsNullOrWhiteSpace(lineText))
        {
            sb.AppendLine(lineText);
        }
    }

    private static string ReconstructLinesFromLetters(IReadOnlyList<Letter> letters)
    {
        if (letters.Count == 0) return string.Empty;

        var orderedLetters = letters
            .OrderByDescending(l => l.BoundingBox.Bottom)
            .ThenBy(l => l.BoundingBox.Left)
            .ToList();

        var lines = new List<List<Letter>>();
        List<Letter>? currentLine = null;
        double currentLineY = 0;

        foreach (var letter in orderedLetters)
        {
            var letterY = letter.BoundingBox.Bottom;
            var tolerance = Math.Max(3.0, (double)letter.PointSize * 0.45);

            if (currentLine == null || Math.Abs(letterY - currentLineY) > tolerance)
            {
                currentLine = [letter];
                currentLineY = letterY;
                lines.Add(currentLine);
            }
            else
            {
                currentLine.Add(letter);
                currentLineY = (currentLineY * (currentLine.Count - 1) + letterY) / currentLine.Count;
            }
        }

        var sb = new StringBuilder();
        foreach (var line in lines)
        {
            var sortedLineLetters = line.OrderBy(l => l.BoundingBox.Left).ToList();
            if (sortedLineLetters.Count == 0) continue;

            var lineBuilder = new StringBuilder();
            Letter? prevLetter = null;

            foreach (var letter in sortedLineLetters)
            {
                if (prevLetter != null)
                {
                    var gap = letter.BoundingBox.Left - prevLetter.BoundingBox.Right;
                    var avgWidth = (prevLetter.BoundingBox.Width + letter.BoundingBox.Width) / 2.0;
                    var spaceThreshold = Math.Max(1.5, Math.Min(avgWidth * 0.35, (double)letter.PointSize * 0.22));

                    if (gap > 45.0)
                    {
                        lineBuilder.Append("  |  ");
                    }
                    else if (gap > spaceThreshold && !char.IsWhiteSpace(letter.Value[0]))
                    {
                        lineBuilder.Append(' ');
                    }
                }

                lineBuilder.Append(letter.Value);
                prevLetter = letter;
            }

            var lineText = lineBuilder.ToString().Trim();
            if (!string.IsNullOrWhiteSpace(lineText))
            {
                sb.AppendLine(lineText);
            }
        }

        return sb.ToString().Trim();
    }

    private static string ExtractFromDocx(MemoryStream stream)
    {
        stream.Position = 0;
        using var wordDoc = WordprocessingDocument.Open(stream, false);
        var mainPart = wordDoc.MainDocumentPart;
        if (mainPart == null)
        {
            return string.Empty;
        }

        var sb = new StringBuilder();

        // 1. Headers first (captures contact info, header notes)
        foreach (var headerPart in mainPart.HeaderParts)
        {
            ExtractTextFromOpenXmlElement(headerPart.Header, sb);
        }

        // 2. Main document body
        if (mainPart.Document?.Body != null)
        {
            ExtractTextFromBody(mainPart.Document.Body, sb);
        }

        // 3. Footers
        foreach (var footerPart in mainPart.FooterParts)
        {
            ExtractTextFromOpenXmlElement(footerPart.Footer, sb);
        }

        var result = sb.ToString().Trim();
        if (string.IsNullOrWhiteSpace(result))
        {
            throw new InvalidOperationException("The uploaded Word document does not contain any readable text.");
        }

        return result;
    }

    private static void ExtractTextFromBody(Body body, StringBuilder sb)
    {
        foreach (var element in body.Elements())
        {
            if (element is Paragraph p)
            {
                var text = p.InnerText?.Trim();
                if (!string.IsNullOrWhiteSpace(text))
                {
                    sb.AppendLine(text);
                }
            }
            else if (element is Table tbl)
            {
                foreach (var row in tbl.Descendants<TableRow>())
                {
                    var cellTexts = row.Descendants<TableCell>()
                        .Select(c => c.InnerText?.Trim())
                        .Where(t => !string.IsNullOrWhiteSpace(t));

                    var rowLine = string.Join("  |  ", cellTexts);
                    if (!string.IsNullOrWhiteSpace(rowLine))
                    {
                        sb.AppendLine(rowLine);
                    }
                }
            }
            else
            {
                ExtractTextFromOpenXmlElement(element, sb);
            }
        }
    }

    private static void ExtractTextFromOpenXmlElement(OpenXmlElement? root, StringBuilder sb)
    {
        if (root == null) return;

        foreach (var p in root.Descendants<Paragraph>())
        {
            var text = p.InnerText?.Trim();
            if (!string.IsNullOrWhiteSpace(text))
            {
                sb.AppendLine(text);
            }
        }
    }

    private static string ExtractFromTxt(MemoryStream stream)
    {
        stream.Position = 0;
        using var reader = new StreamReader(stream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, bufferSize: 4096, leaveOpen: true);
        var text = reader.ReadToEnd().Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            throw new InvalidOperationException("The uploaded text document is empty.");
        }
        return text;
    }
}
