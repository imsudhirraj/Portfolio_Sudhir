using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using UglyToad.PdfPig;

namespace PortfolioAI.Api.Core.Services;

public class DocumentTextExtractor(ILogger<DocumentTextExtractor> logger)
{
    public string ExtractText(Stream stream, string extension)
    {
        var ext = extension.Trim().ToLowerInvariant();
        if (!ext.StartsWith('.'))
        {
            ext = "." + ext;
        }

        try
        {
            if (ext == ".pdf")
            {
                return ExtractFromPdf(stream);
            }

            if (ext == ".docx")
            {
                return ExtractFromDocx(stream);
            }

            throw new NotSupportedException($"Unsupported file format '{extension}'. Only .pdf and .docx are supported.");
        }
        catch (Exception ex) when (ex is not NotSupportedException)
        {
            logger.LogError(ex, "Failed to extract text from {Extension} document", ext);
            throw new InvalidOperationException($"Unable to parse document contents from {ext} file.", ex);
        }
    }

    private static string ExtractFromPdf(Stream stream)
    {
        stream.Seek(0, SeekOrigin.Begin);
        using var pdfDocument = PdfDocument.Open(stream);
        var sb = new StringBuilder();

        foreach (var page in pdfDocument.GetPages())
        {
            var words = page.GetWords().ToList();
            if (words.Count == 0)
            {
                var fallback = page.Text;
                if (!string.IsNullOrWhiteSpace(fallback))
                {
                    sb.AppendLine(fallback);
                }
                continue;
            }

            // Group words into lines based on vertical proximity (Y descending)
            var sortedWords = words.OrderByDescending(w => w.BoundingBox.Bottom).ThenBy(w => w.BoundingBox.Left).ToList();
            var lineWords = new List<UglyToad.PdfPig.Content.Word>();
            double? currentLineY = null;
            const double yTolerance = 4.0;

            foreach (var word in sortedWords)
            {
                if (currentLineY == null)
                {
                    currentLineY = word.BoundingBox.Bottom;
                    lineWords.Add(word);
                }
                else if (Math.Abs(word.BoundingBox.Bottom - currentLineY.Value) <= yTolerance)
                {
                    lineWords.Add(word);
                }
                else
                {
                    var lineText = string.Join(" ", lineWords.OrderBy(w => w.BoundingBox.Left).Select(w => w.Text));
                    if (!string.IsNullOrWhiteSpace(lineText))
                    {
                        sb.AppendLine(lineText);
                    }

                    lineWords.Clear();
                    lineWords.Add(word);
                    currentLineY = word.BoundingBox.Bottom;
                }
            }

            if (lineWords.Count > 0)
            {
                var lineText = string.Join(" ", lineWords.OrderBy(w => w.BoundingBox.Left).Select(w => w.Text));
                if (!string.IsNullOrWhiteSpace(lineText))
                {
                    sb.AppendLine(lineText);
                }
            }

            sb.AppendLine();
        }

        return sb.ToString().Trim();
    }

    private static string ExtractFromDocx(Stream stream)
    {
        stream.Seek(0, SeekOrigin.Begin);
        using var wordDoc = WordprocessingDocument.Open(stream, false);
        var body = wordDoc.MainDocumentPart?.Document?.Body;

        if (body == null)
        {
            return string.Empty;
        }

        var sb = new StringBuilder();
        foreach (var p in body.Descendants<Paragraph>())
        {
            var text = p.InnerText;
            if (!string.IsNullOrWhiteSpace(text))
            {
                sb.AppendLine(text);
            }
        }

        return sb.ToString().Trim();
    }
}
