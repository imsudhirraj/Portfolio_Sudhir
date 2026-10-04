using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using PortfolioAI.Api.Core.Services;
using Xunit;

namespace PortfolioAI.Tests;

public class FileResumeStorageTests : IDisposable
{
    private readonly string _testStorageDir;
    private readonly JsonFileStorageService _fileStorage;
    private readonly FileResumeStorage _resumeStorage;

    public FileResumeStorageTests()
    {
        _testStorageDir = Path.Combine(Path.GetTempPath(), "PortfolioAI_ResumeTests_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_testStorageDir);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Storage:Root", _testStorageDir }
            })
            .Build();

        var env = new MockWebHostEnvironment { ContentRootPath = _testStorageDir };
        _fileStorage = new JsonFileStorageService(config, env, NullLogger<JsonFileStorageService>.Instance);
        _resumeStorage = new FileResumeStorage(_fileStorage, NullLogger<FileResumeStorage>.Instance);
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_testStorageDir))
            {
                Directory.Delete(_testStorageDir, true);
            }
        }
        catch { }
    }

    [Fact]
    public async Task SaveResumeAsync_WithValidPdfMagicBytes_Succeeds()
    {
        const string userId = "test-user-pdf";
        // PDF Magic bytes: %PDF
        byte[] pdfHeader = Encoding.ASCII.GetBytes("%PDF-1.7\nSample PDF body content");
        using var stream = new MemoryStream(pdfHeader);

        var safeFileName = await _resumeStorage.SaveResumeAsync(userId, stream, "my_resume.pdf");

        Assert.Equal("resume.pdf", safeFileName);
        var info = await _resumeStorage.GetResumeInfoAsync(userId);
        Assert.True(info.Exists);
        Assert.Equal("my_resume.pdf", info.FileName);
    }

    [Fact]
    public async Task SaveResumeAsync_WithValidDocxMagicBytes_Succeeds()
    {
        const string userId = "test-user-docx";
        // DOCX Magic bytes (Zip PK\x03\x04):
        byte[] docxHeader = new byte[] { 0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00 };
        using var stream = new MemoryStream(docxHeader);

        var safeFileName = await _resumeStorage.SaveResumeAsync(userId, stream, "CV_2026.docx");

        Assert.Equal("resume.docx", safeFileName);
        var info = await _resumeStorage.GetResumeInfoAsync(userId);
        Assert.True(info.Exists);
        Assert.Equal("CV_2026.docx", info.FileName);
    }

    [Fact]
    public async Task SaveResumeAsync_WithFakePdfExtension_FailsValidation()
    {
        const string userId = "test-user-fake";
        // Plain text content disguised as a .pdf
        byte[] textContent = Encoding.UTF8.GetBytes("This is malicious text or executable");
        using var stream = new MemoryStream(textContent);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            _resumeStorage.SaveResumeAsync(userId, stream, "fake.pdf"));
    }

    [Fact]
    public async Task SaveResumeAsync_WithDisallowedExtension_FailsValidation()
    {
        const string userId = "test-user-disallowed";
        byte[] exeContent = new byte[] { 0x4D, 0x5A, 0x90, 0x00 };
        using var stream = new MemoryStream(exeContent);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            _resumeStorage.SaveResumeAsync(userId, stream, "malicious.exe"));
    }

    [Fact]
    public async Task DeleteResumeAsync_RemovesResumeFile()
    {
        const string userId = "test-user-del";
        byte[] pdfHeader = Encoding.ASCII.GetBytes("%PDF-1.4\nTest");
        using var stream = new MemoryStream(pdfHeader);

        await _resumeStorage.SaveResumeAsync(userId, stream, "resume.pdf");
        var infoBefore = await _resumeStorage.GetResumeInfoAsync(userId);
        Assert.True(infoBefore.Exists);

        var deleted = await _resumeStorage.DeleteResumeAsync(userId);
        Assert.True(deleted);

        var infoAfter = await _resumeStorage.GetResumeInfoAsync(userId);
        Assert.False(infoAfter.Exists);
    }
}
