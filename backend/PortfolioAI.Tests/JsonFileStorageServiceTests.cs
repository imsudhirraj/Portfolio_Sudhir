using System.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using PortfolioAI.Api.Core.Models;
using PortfolioAI.Api.Core.Services;
using Xunit;

namespace PortfolioAI.Tests;

public class MockWebHostEnvironment : IWebHostEnvironment
{
    public string WebRootPath { get; set; } = string.Empty;
    public Microsoft.Extensions.FileProviders.IFileProvider WebRootFileProvider { get; set; } = null!;
    public string ApplicationName { get; set; } = "PortfolioAI.Tests";
    public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } = null!;
    public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
    public string EnvironmentName { get; set; } = "Development";
}

public class JsonFileStorageServiceTests : IDisposable
{
    private readonly string _testStorageDir;
    private readonly JsonFileStorageService _storageService;

    public JsonFileStorageServiceTests()
    {
        _testStorageDir = Path.Combine(Path.GetTempPath(), "portfolio_test_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_testStorageDir);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Storage:Root", _testStorageDir }
            })
            .Build();

        var env = new MockWebHostEnvironment { ContentRootPath = _testStorageDir };
        _storageService = new JsonFileStorageService(config, env, NullLogger<JsonFileStorageService>.Instance);
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_testStorageDir))
            {
                Directory.Delete(_testStorageDir, recursive: true);
            }
        }
        catch { /* ignore cleanup errors */ }
    }

    [Fact]
    public async Task WriteAndReadJson_ShouldPersistAndRetrieveDataCorrectly()
    {
        var testProfile = new Profile
        {
            FullName = "Sudhir Raj",
            ProfessionalTitle = "Senior Software Architect",
            Email = "test@example.com"
        };

        var relativePath = "users/10823492384923/profile.json";
        await _storageService.WriteJsonAsync(relativePath, testProfile);

        var exists = await _storageService.FileExistsAsync(relativePath);
        Assert.True(exists);

        var read = await _storageService.ReadJsonAsync<Profile>(relativePath);
        Assert.NotNull(read);
        Assert.Equal("Sudhir Raj", read.FullName);
        Assert.Equal("Senior Software Architect", read.ProfessionalTitle);
    }

    [Fact]
    public async Task WriteJson_ShouldCreateBackupWhenFileIsUpdated()
    {
        var relativePath = "users/10823492384923/test.json";
        await _storageService.WriteJsonAsync(relativePath, new { version = 1 });
        await _storageService.WriteJsonAsync(relativePath, new { version = 2 }, createBackup: true);

        var backup1Exists = await _storageService.FileExistsAsync(relativePath + ".backup1");
        Assert.True(backup1Exists);
    }

    [Fact]
    public async Task ReadJson_WithDirectoryTraversalAttempt_ShouldThrowSecurityException()
    {
        var traversalPath = "../../sensitive_file.json";
        await Assert.ThrowsAsync<SecurityException>(() => _storageService.ReadJsonAsync<object>(traversalPath));
    }
}
