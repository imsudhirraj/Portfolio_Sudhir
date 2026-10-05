using System.IO.Compression;
using System.Text;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Extensions.Logging.Abstractions;
using PortfolioAI.Api.Core.Services;
using Xunit;

namespace PortfolioAI.Tests;

public class DocumentTextExtractorTests
{
    private readonly DocumentTextExtractor _extractor = new(NullLogger<DocumentTextExtractor>.Instance);

    [Fact]
    public void ExtractText_FromPlainText_Succeeds()
    {
        const string sampleResume = """
            Jane Doe
            Senior Full Stack Engineer
            jane.doe@example.com | +1 555-0199 | San Francisco, CA
            github.com/janedoe | linkedin.com/in/janedoe

            Summary:
            Experienced software architect with 8 years building scalable cloud services in C# and TypeScript.

            Skills:
            C#, ASP.NET Core, Angular, SQL Server, Docker, Kubernetes

            Experience:
            Principal Engineer | CloudScale Inc. (2021 - Present)
            - Spearheaded migration of monolith to microservices.
            """;

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(sampleResume));
        var text = _extractor.ExtractText(stream, ".txt");

        Assert.Contains("Jane Doe", text);
        Assert.Contains("Senior Full Stack Engineer", text);
        Assert.Contains("CloudScale Inc.", text);
    }

    [Fact]
    public void ExtractText_FromPlainTextWithoutExtension_InfersTextFormat()
    {
        const string content = "Sudhir Raj\nSoftware Developer\nASP.NET Core & Angular";
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));

        var text = _extractor.ExtractText(stream, "");

        Assert.Contains("Sudhir Raj", text);
        Assert.Contains("ASP.NET Core", text);
    }

    [Fact]
    public void ExtractText_FromDocxStream_ExtractsBodyAndHeaders()
    {
        using var ms = new MemoryStream();
        using (var wordDoc = WordprocessingDocument.Create(ms, WordprocessingDocumentType.Document, true))
        {
            var mainPart = wordDoc.AddMainDocumentPart();
            mainPart.Document = new Document();
            var body = mainPart.Document.AppendChild(new Body());

            // Add Header
            var headerPart = mainPart.AddNewPart<HeaderPart>();
            headerPart.Header = new Header(
                new Paragraph(new Run(new Text("Header: Sudhir Raj Contact Details - itssudhirraj@gmail.com")))
            );
            var headerId = mainPart.GetIdOfPart(headerPart);

            // Add Paragraphs
            body.AppendChild(new Paragraph(new Run(new Text("Professional Experience:"))));
            body.AppendChild(new Paragraph(new Run(new Text("Software Developer at Wipro Ltd"))));

            // Add Table
            var table = new Table();
            var row = new TableRow();
            row.Append(new TableCell(new Paragraph(new Run(new Text("Skill: C#")))));
            row.Append(new TableCell(new Paragraph(new Run(new Text("Level: Expert")))));
            table.Append(row);
            body.AppendChild(table);

            mainPart.Document.Save();
        }

        ms.Position = 0;
        var extracted = _extractor.ExtractText(ms, ".docx");

        Assert.Contains("Sudhir Raj Contact Details", extracted);
        Assert.Contains("Software Developer at Wipro Ltd", extracted);
        Assert.Contains("Skill: C#", extracted);
    }

    [Fact]
    public void ExtractText_FromExistingUserPdfResume_ExtractsContentAccurately()
    {
        var resumePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "PortfolioAI.Api", "storage", "users", "10823492384923", "resume", "resume.pdf");
        if (!File.Exists(resumePath))
        {
            // If running in alternate test environment, skip gracefully
            return;
        }

        using var stream = File.OpenRead(resumePath);
        var text = _extractor.ExtractText(stream, ".pdf");

        Assert.NotEmpty(text);
        Assert.Contains("Sudhir Raj", text);
        Assert.Contains("Wipro", text);
        Assert.Contains("ASP.NET Core", text);
    }

    [Fact]
    public void ExtractText_FromPdfMagicBytesWithoutExtension_InfersPdf()
    {
        var resumePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "PortfolioAI.Api", "storage", "users", "10823492384923", "resume", "resume.pdf");
        if (!File.Exists(resumePath))
        {
            return;
        }

        using var stream = File.OpenRead(resumePath);
        // Pass empty extension string
        var text = _extractor.ExtractText(stream, string.Empty);

        Assert.NotEmpty(text);
        Assert.Contains("Sudhir Raj", text);
    }

    [Fact]
    public void ExtractText_EmptyStream_ThrowsInvalidOperationException()
    {
        using var stream = new MemoryStream();
        Assert.Throws<InvalidOperationException>(() => _extractor.ExtractText(stream, ".txt"));
    }

    [Fact]
    public void ExtractText_UnsupportedExtension_ThrowsNotSupportedException()
    {
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("Some content"));
        Assert.Throws<NotSupportedException>(() => _extractor.ExtractText(stream, ".exe"));
    }
}
