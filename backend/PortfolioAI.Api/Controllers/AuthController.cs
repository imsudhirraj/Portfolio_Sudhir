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
    ILogger<AuthController> logger) : ControllerBase
{
    public record GoogleLoginRequest(string IdToken);
    public record DevLoginRequest(string? UserId, string? Email, string? Name);
    public record AuthResponse(string Token, string UserId, string Email, string Name, string? Picture);

    [HttpPost("google")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> GoogleLogin([FromBody] GoogleLoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return BadRequest(ApiResponse.Fail("Google ID Token is required.", "MISSING_TOKEN"));
        }

        var googleUser = await jwtTokenService.VerifyGoogleTokenAsync(request.IdToken, cancellationToken);
        if (googleUser == null)
        {
            return Unauthorized(ApiResponse.Fail("Invalid or expired Google token.", "INVALID_TOKEN"));
        }

        // Initialize user directory and starter portfolio if new
        fileStorage.GetUserDirectory(googleUser.Sub);
        await portfolioRepository.GetOrCreatePortfolioAsync(googleUser.Sub, cancellationToken);

        var jwt = jwtTokenService.GenerateToken(googleUser.Sub, googleUser.Email, googleUser.Name, googleUser.Picture);
        var authResult = new AuthResponse(jwt, googleUser.Sub, googleUser.Email, googleUser.Name, googleUser.Picture);

        logger.LogInformation("User {UserId} logged in via Google.", googleUser.Sub);
        return Ok(ApiResponse<AuthResponse>.Ok(authResult, "Login successful."));
    }

    [HttpPost("dev-login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> DevLogin([FromBody] DevLoginRequest? request, CancellationToken cancellationToken)
    {
        // One-click frictionless development & demonstration login
        var userId = !string.IsNullOrWhiteSpace(request?.UserId) ? request.UserId : "10823492384923";
        var email = !string.IsNullOrWhiteSpace(request?.Email) ? request.Email : "sudhir.raj@example.com";
        var name = !string.IsNullOrWhiteSpace(request?.Name) ? request.Name : "Sudhir Raj";

        fileStorage.GetUserDirectory(userId);
        await portfolioRepository.GetOrCreatePortfolioAsync(userId, cancellationToken);

        var jwt = jwtTokenService.GenerateToken(userId, email, name);
        var authResult = new AuthResponse(jwt, userId, email, name, null);

        logger.LogInformation("User {UserId} logged in via DevLogin.", userId);
        return Ok(ApiResponse<AuthResponse>.Ok(authResult, "Development login successful."));
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
