using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using PortfolioAI.Api.Core.Services;
using Xunit;

namespace PortfolioAI.Tests;

public class JsonPublicSlugRepositoryTests : IDisposable
{
    private readonly string _testStorageDir;
    private readonly JsonPublicSlugRepository _slugRepository;

    public JsonPublicSlugRepositoryTests()
    {
        _testStorageDir = Path.Combine(Path.GetTempPath(), "portfolio_slug_test_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_testStorageDir);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Storage:Root", _testStorageDir }
            })
            .Build();

        var env = new MockWebHostEnvironment { ContentRootPath = _testStorageDir };
        var storageService = new JsonFileStorageService(config, env, NullLogger<JsonFileStorageService>.Instance);
        _slugRepository = new JsonPublicSlugRepository(storageService, NullLogger<JsonPublicSlugRepository>.Instance);
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
        catch { /* cleanup */ }
    }

    [Fact]
    public async Task RegisterSlug_ShouldSaveAndRetrieveUserId()
    {
        var slug = "sudhir-raj";
        var userId = "10823492384923";

        var isAvailable = await _slugRepository.IsSlugAvailableAsync(slug, userId);
        Assert.True(isAvailable);

        var registered = await _slugRepository.RegisterSlugAsync(slug, userId);
        Assert.True(registered);

        var resolvedUserId = await _slugRepository.GetUserIdBySlugAsync(slug);
        Assert.Equal(userId, resolvedUserId);
    }

    [Fact]
    public async Task RegisterSlug_WithReservedWord_ShouldBeRejected()
    {
        var userId = "10823492384923";
        var isAvailable = await _slugRepository.IsSlugAvailableAsync("api", userId);
        Assert.False(isAvailable);

        var registered = await _slugRepository.RegisterSlugAsync("admin", userId);
        Assert.False(registered);
    }

    [Fact]
    public async Task RegisterSlug_DuplicateForOtherUser_ShouldBeRejected()
    {
        var slug = "tech-lead";
        await _slugRepository.RegisterSlugAsync(slug, "user-1");

        var availableForUser2 = await _slugRepository.IsSlugAvailableAsync(slug, "user-2");
        Assert.False(availableForUser2);

        var registeredUser2 = await _slugRepository.RegisterSlugAsync(slug, "user-2");
        Assert.False(registeredUser2);
    }

    [Fact]
    public async Task ReleaseSlug_ShouldMakeSlugAvailableAgain()
    {
        var slug = "designer-portfolio";
        var userId = "user-abc";

        await _slugRepository.RegisterSlugAsync(slug, userId);
        var released = await _slugRepository.ReleaseSlugAsync(slug, userId);
        Assert.True(released);

        var available = await _slugRepository.IsSlugAvailableAsync(slug, "other-user");
        Assert.True(available);
    }
}
