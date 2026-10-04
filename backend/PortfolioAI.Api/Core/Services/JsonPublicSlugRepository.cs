using System.Text.RegularExpressions;
using PortfolioAI.Api.Core.Interfaces;

namespace PortfolioAI.Api.Core.Services;

public partial class JsonPublicSlugRepository(IFileStorageService fileStorage, ILogger<JsonPublicSlugRepository> logger) : IPublicSlugRepository
{
    private const string SlugsFilePath = "public/slugs.json";

    private static readonly HashSet<string> ReservedSlugs = new(StringComparer.OrdinalIgnoreCase)
    {
        "api", "auth", "admin", "administrator", "root", "settings", "portfolio",
        "dashboard", "u", "public", "login", "signin", "signup", "register",
        "logout", "assets", "static", "help", "about", "contact", "pricing",
        "terms", "privacy", "null", "undefined", "true", "false", "test", "demo"
    };

    [GeneratedRegex("^[a-z0-9]+(-[a-z0-9]+)*$", RegexOptions.CultureInvariant)]
    private static partial Regex SlugRegex();

    public async Task<string?> GetUserIdBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var cleanSlug = slug.Trim().ToLowerInvariant();
        var index = await GetSlugsIndexAsync(cancellationToken);
        return index.TryGetValue(cleanSlug, out var userId) ? userId : null;
    }

    public async Task<string?> GetSlugByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var index = await GetSlugsIndexAsync(cancellationToken);
        return index.FirstOrDefault(pair => string.Equals(pair.Value, userId, StringComparison.OrdinalIgnoreCase)).Key;
    }

    public async Task<bool> IsSlugAvailableAsync(string slug, string currentUserId, CancellationToken cancellationToken = default)
    {
        var cleanSlug = slug.Trim().ToLowerInvariant();
        if (!IsValidSlugFormat(cleanSlug) || ReservedSlugs.Contains(cleanSlug))
        {
            return false;
        }

        var index = await GetSlugsIndexAsync(cancellationToken);
        if (!index.TryGetValue(cleanSlug, out var ownerId))
        {
            return true;
        }

        return string.Equals(ownerId, currentUserId, StringComparison.OrdinalIgnoreCase);
    }

    public async Task<bool> RegisterSlugAsync(string slug, string userId, CancellationToken cancellationToken = default)
    {
        var cleanSlug = slug.Trim().ToLowerInvariant();
        if (!IsValidSlugFormat(cleanSlug) || ReservedSlugs.Contains(cleanSlug))
        {
            logger.LogWarning("Attempted to register invalid or reserved slug {Slug}", cleanSlug);
            return false;
        }

        var index = await GetSlugsIndexAsync(cancellationToken);

        // Check if taken by another user
        if (index.TryGetValue(cleanSlug, out var existingOwner) &&
            !string.Equals(existingOwner, userId, StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Slug {Slug} is already registered to user {Owner}", cleanSlug, existingOwner);
            return false;
        }

        // Remove any old slug assigned to this user
        var oldSlugs = index.Where(kv => string.Equals(kv.Value, userId, StringComparison.OrdinalIgnoreCase))
                            .Select(kv => kv.Key)
                            .ToList();
        foreach (var old in oldSlugs)
        {
            index.Remove(old);
        }

        index[cleanSlug] = userId;
        await fileStorage.WriteJsonAsync(SlugsFilePath, index, createBackup: true, cancellationToken);
        logger.LogInformation("Slug {Slug} successfully registered for user {UserId}", cleanSlug, userId);
        return true;
    }

    public async Task<bool> ReleaseSlugAsync(string slug, string userId, CancellationToken cancellationToken = default)
    {
        var cleanSlug = slug.Trim().ToLowerInvariant();
        var index = await GetSlugsIndexAsync(cancellationToken);

        if (index.TryGetValue(cleanSlug, out var owner) &&
            string.Equals(owner, userId, StringComparison.OrdinalIgnoreCase))
        {
            index.Remove(cleanSlug);
            await fileStorage.WriteJsonAsync(SlugsFilePath, index, createBackup: true, cancellationToken);
            logger.LogInformation("Slug {Slug} released by user {UserId}", cleanSlug, userId);
            return true;
        }

        return false;
    }

    private static bool IsValidSlugFormat(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug) || slug.Length < 3 || slug.Length > 50)
        {
            return false;
        }

        return SlugRegex().IsMatch(slug);
    }

    private async Task<Dictionary<string, string>> GetSlugsIndexAsync(CancellationToken cancellationToken)
    {
        var index = await fileStorage.ReadJsonAsync<Dictionary<string, string>>(SlugsFilePath, cancellationToken);
        return index ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    }
}
