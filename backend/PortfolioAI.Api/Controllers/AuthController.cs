using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioAI.Api.Core.Interfaces;
using PortfolioAI.Api.Core.Models;
using PortfolioAI.Api.Core.Services;

namespace PortfolioAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    JwtTokenService jwtTokenService,
    IFileStorageService fileStorage,
    IPortfolioRepository portfolioRepository,
    IUserContext userContext,
    IConfiguration configuration,
    IWebHostEnvironment environment,
    ILogger<AuthController> logger) : ControllerBase
{
    public record GoogleLoginRequest(string? IdToken, string? AccessToken);
    public record DevLoginRequest(string? UserId, string? Email, string? Name, string? SecurityPin);
    public record AuthResponse(string Token, string UserId, string Email, string Name, string? Picture, bool IsOwner);

    [HttpGet("config")]
    [AllowAnonymous]
    public ActionResult<ApiResponse<object>> GetAuthConfig()
    {
        var clientId = configuration["Authentication:Google:ClientId"];
        var isConfigured = !string.IsNullOrWhiteSpace(clientId)
            && !clientId.StartsWith("YOUR_")
            && !clientId.Contains("placeholder", StringComparison.OrdinalIgnoreCase);

        return Ok(ApiResponse<object>.Ok(new
        {
            googleClientId = isConfigured ? clientId : null,
            isConfigured
        }, "Auth config retrieved."));
    }

    [HttpPost("google")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> GoogleLogin([FromBody] GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken) && string.IsNullOrWhiteSpace(request.AccessToken))
        {
            return BadRequest(ApiResponse.Fail("Google authentication token is required.", "MISSING_TOKEN"));
        }

        GoogleUserInfo? googleUser = null;
        if (!string.IsNullOrWhiteSpace(request.IdToken))
        {
            googleUser = await jwtTokenService.VerifyGoogleTokenAsync(request.IdToken, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(request.AccessToken))
        {
            googleUser = await jwtTokenService.VerifyGoogleAccessTokenAsync(request.AccessToken, cancellationToken);
        }

        if (googleUser == null)
        {
            return Unauthorized(ApiResponse.Fail("Invalid or expired Google token.", "INVALID_TOKEN"));
        }

        var ownerEmail = configuration["Owner:Email"] ?? "imsudhirraj@gmail.com";
        var isOwner = googleUser.Email.Equals(ownerEmail, StringComparison.OrdinalIgnoreCase) ||
                      googleUser.Email.Equals("itssudhirraj@gmail.com", StringComparison.OrdinalIgnoreCase);

        // Map Owner account to master workspace ID, otherwise use Google Subject ID
        var userId = isOwner ? "10823492384923" : "google_" + googleUser.Sub;

        // Initialize user directory and starter portfolio if new
        fileStorage.GetUserDirectory(userId);
        await portfolioRepository.GetOrCreatePortfolioAsync(userId, googleUser.Name, googleUser.Email, cancellationToken);

        var jwt = jwtTokenService.GenerateToken(userId, googleUser.Email, googleUser.Name, googleUser.Picture);
        var authResult = new AuthResponse(jwt, userId, googleUser.Email, googleUser.Name, googleUser.Picture, isOwner);

        logger.LogInformation("User {UserId} logged in via Google. IsOwner: {IsOwner}", userId, isOwner);
        return Ok(ApiResponse<AuthResponse>.Ok(authResult, "Login successful."));
    }

    [HttpPost("dev-login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> DevLogin([FromBody] DevLoginRequest? request, CancellationToken cancellationToken)
    {
        var rawEmail = request?.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(rawEmail) || !rawEmail.Contains('@'))
        {
            return BadRequest(ApiResponse.Fail("Please provide a valid Google account email.", "INVALID_EMAIL"));
        }

        var ownerEmail = (configuration["Owner:Email"] ?? "imsudhirraj@gmail.com").ToLowerInvariant();
        var isOwner = rawEmail == ownerEmail || rawEmail == "itssudhirraj@gmail.com";
        string userId;
        string name;

        if (isOwner)
        {
            var configuredPin = configuration["Owner:SecurityPin"] ?? "1994";
            var providedPin = request?.SecurityPin?.Trim();

            if (string.IsNullOrWhiteSpace(providedPin) || providedPin != configuredPin)
            {
                return Unauthorized(ApiResponse.Fail("Authentication verification required for this account.", "AUTH_REQUIRED"));
            }

            userId = "10823492384923";
            name = !string.IsNullOrWhiteSpace(request?.Name) ? request.Name.Trim() : "Sudhir Raj";
        }
        else
        {
            // In Production, anonymous email login is disabled to prevent unauthenticated access
            if (!environment.IsDevelopment())
            {
                var devKey = configuration["Dev:SecurityPin"] ?? configuration["Owner:SecurityPin"] ?? "1994";
                if (string.IsNullOrWhiteSpace(request?.SecurityPin) || request?.SecurityPin?.Trim() != devKey)
                {
                    return Unauthorized(ApiResponse.Fail("Direct email access is restricted on this server. Please sign in with Google.", "GOOGLE_AUTH_REQUIRED"));
                }
            }

            // Non-owner users get their own isolated, secure workspace
            userId = "user_" + Math.Abs(rawEmail.GetHashCode());
            name = !string.IsNullOrWhiteSpace(request?.Name) ? request.Name.Trim() : rawEmail.Split('@')[0];
        }

        fileStorage.GetUserDirectory(userId);
        await portfolioRepository.GetOrCreatePortfolioAsync(userId, name, rawEmail, cancellationToken);

        var jwt = jwtTokenService.GenerateToken(userId, rawEmail, name);
        var authResult = new AuthResponse(jwt, userId, rawEmail, name, null, isOwner);

        logger.LogInformation("User {UserId} logged in. IsOwner: {IsOwner}", userId, isOwner);
        return Ok(ApiResponse<AuthResponse>.Ok(authResult, "Login successful."));
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<ApiResponse<object>> GetCurrentUser()
    {
        var result = new
        {
            userContext.UserId,
            userContext.Email,
            userContext.Name
        };

        return Ok(ApiResponse<object>.Ok(result));
    }
}
