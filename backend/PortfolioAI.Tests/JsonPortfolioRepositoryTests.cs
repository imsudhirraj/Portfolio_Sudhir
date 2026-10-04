using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using PortfolioAI.Api.Core.Models;
using PortfolioAI.Api.Core.Services;
using Xunit;

namespace PortfolioAI.Tests;

public class JsonPortfolioRepositoryTests : IDisposable
{
    private readonly string _testStorageDir;
    private readonly JsonFileStorageService _fileStorage;
    private readonly JsonPortfolioRepository _portfolioRepo;

    public JsonPortfolioRepositoryTests()
    {
        _testStorageDir = Path.Combine(Path.GetTempPath(), "PortfolioAI_RepoTests_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_testStorageDir);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Storage:Root", _testStorageDir }
            })
            .Build();

        var env = new MockWebHostEnvironment { ContentRootPath = _testStorageDir };
        _fileStorage = new JsonFileStorageService(config, env, NullLogger<JsonFileStorageService>.Instance);
        _portfolioRepo = new JsonPortfolioRepository(_fileStorage, NullLogger<JsonPortfolioRepository>.Instance);
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
    public async Task GetOrCreatePortfolioAsync_ForNewUser_CreatesDefaultStarterPortfolio()
    {
        const string userId = "new-google-user-1";

        var portfolio = await _portfolioRepo.GetOrCreatePortfolioAsync(userId);

        Assert.NotNull(portfolio);
        Assert.False(portfolio.Publication.IsPublished);
        Assert.True(portfolio.Sections.Hero);
        Assert.True(portfolio.Sections.Skills);
        Assert.Equal("developer", portfolio.Theme.Name);

        // Verify file persisted on disk via fileStorage
        Assert.True(await _fileStorage.FileExistsAsync($"users/{userId}/portfolio.json"));
    }

    [Fact]
    public async Task SavePortfolioAsync_UpdatesExistingPortfolio()
    {
        const string userId = "existing-user-2";
        var portfolio = await _portfolioRepo.GetOrCreatePortfolioAsync(userId);

        portfolio.Profile.FullName = "Updated Name";
        portfolio.Profile.ProfessionalTitle = "Staff Engineer";
        portfolio.Skills.Add(new SkillItem
        {
            Id = "sk-1",
            Name = "Angular",
            Category = "Frontend",
            Level = "Expert"
        });

        var saved = await _portfolioRepo.SavePortfolioAsync(userId, portfolio);
        Assert.Equal("Updated Name", saved.Profile.FullName);

        // Fetch again and verify updates
        var reloaded = await _portfolioRepo.GetPortfolioAsync(userId);
        Assert.NotNull(reloaded);
        Assert.Equal("Updated Name", reloaded.Profile.FullName);
        Assert.Equal("Staff Engineer", reloaded.Profile.ProfessionalTitle);
        Assert.Contains(reloaded.Skills, s => s.Name == "Angular");
    }

    [Fact]
    public async Task UserIsolation_UserA_CannotAccessOrModify_UserB_Portfolio()
    {
        const string userA = "user-alpha";
        const string userB = "user-beta";

        var portA = await _portfolioRepo.GetOrCreatePortfolioAsync(userA);
        portA.Profile.ProfessionalTitle = "Backend Architect";
        await _portfolioRepo.SavePortfolioAsync(userA, portA);

        var portB = await _portfolioRepo.GetOrCreatePortfolioAsync(userB);
        portB.Profile.ProfessionalTitle = "Design Lead";
        await _portfolioRepo.SavePortfolioAsync(userB, portB);

        var retrievedA = await _portfolioRepo.GetPortfolioAsync(userA);
        var retrievedB = await _portfolioRepo.GetPortfolioAsync(userB);

        Assert.NotNull(retrievedA);
        Assert.NotNull(retrievedB);
        Assert.Equal("Backend Architect", retrievedA.Profile.ProfessionalTitle);
        Assert.Equal("Design Lead", retrievedB.Profile.ProfessionalTitle);
    }

    [Fact]
    public async Task DeletePortfolioAsync_RemovesUserPortfolioFile()
    {
        const string userId = "user-delete-test";
        await _portfolioRepo.GetOrCreatePortfolioAsync(userId);
        Assert.True(await _fileStorage.FileExistsAsync($"users/{userId}/portfolio.json"));

        var deleted = await _portfolioRepo.DeletePortfolioAsync(userId);
        Assert.True(deleted);
        Assert.False(await _fileStorage.FileExistsAsync($"users/{userId}/portfolio.json"));
    }
}
