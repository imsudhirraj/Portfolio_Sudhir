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
            var text = page.Text;
            if (!string.IsNullOrWhiteSpace(text))
            {
                sb.AppendLine(text);
            }
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
