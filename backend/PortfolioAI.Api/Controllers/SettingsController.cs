using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioAI.Api.Core.Interfaces;
using PortfolioAI.Api.Core.Models;

namespace PortfolioAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController(
    IFileStorageService fileStorage,
    IPublicSlugRepository slugRepository,
    IUserContext userContext,
    ILogger<SettingsController> logger) : ControllerBase
{
    private static string GetSettingsPath(string userId) => Path.Combine("users", userId, "settings.json");

    [HttpGet]
    public async Task<ActionResult<ApiResponse<UserSettings>>> GetSettings(CancellationToken cancellationToken)
    {
        var path = GetSettingsPath(userContext.UserId);
        var settings = await fileStorage.ReadJsonAsync<UserSettings>(path, cancellationToken) ?? new UserSettings();
        return Ok(ApiResponse<UserSettings>.Ok(settings));
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<UserSettings>>> UpdateSettings([FromBody] UserSettings settings, CancellationToken cancellationToken)
    {
        settings.UpdatedAtUtc = DateTime.UtcNow;
        var path = GetSettingsPath(userContext.UserId);
        await fileStorage.WriteJsonAsync(path, settings, createBackup: false, cancellationToken);
        return Ok(ApiResponse<UserSettings>.Ok(settings, "Settings updated."));
    }

    [HttpDelete("delete-account")]
    public async Task<ActionResult<ApiResponse>> DeleteAccount(CancellationToken cancellationToken)
    {
        var userId = userContext.UserId;

        // 1. Release any registered public slug
        var existingSlug = await slugRepository.GetSlugByUserIdAsync(userId, cancellationToken);
        if (!string.IsNullOrWhiteSpace(existingSlug))
        {
            await slugRepository.ReleaseSlugAsync(existingSlug, userId, cancellationToken);
        }

        // 2. Permanently delete the user's storage directory (/storage/users/{userId}/)
        var userDirectoryRelative = Path.Combine("users", userId);
        var deleted = await fileStorage.DeleteDirectoryAsync(userDirectoryRelative);

        logger.LogWarning("Account and all associated files deleted for user {UserId}. Result: {Deleted}", userId, deleted);
        return Ok(ApiResponse.SuccessResult("Account and all personal data permanently deleted."));
    }
}
