using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioAI.Api.Core.Interfaces;
using PortfolioAI.Api.Core.Models;

namespace PortfolioAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class PublicController(
    IPublicSlugRepository slugRepository,
    IPortfolioRepository portfolioRepository,
    ILogger<PublicController> logger) : ControllerBase
{
    [HttpGet("{slug}")]
    public async Task<ActionResult<ApiResponse<PublicPortfolioDto>>> GetPublicPortfolio(string slug, CancellationToken cancellationToken)
    {
        var cleanSlug = slug.Trim().ToLowerInvariant();
        logger.LogInformation("Public portfolio requested for slug: {Slug}", cleanSlug);
        var userId = await slugRepository.GetUserIdBySlugAsync(cleanSlug, cancellationToken);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return NotFound(ApiResponse.Fail("Portfolio not found for the requested URL.", "NOT_FOUND"));
        }

        var portfolio = await portfolioRepository.GetPortfolioAsync(userId, cancellationToken);
        if (portfolio == null || !portfolio.Publication.IsPublished)
        {
            return NotFound(ApiResponse.Fail("This portfolio is currently private or unpublished.", "NOT_PUBLISHED"));
        }

        var publicDto = PublicPortfolioDto.FromPortfolio(portfolio, cleanSlug);
        return Ok(ApiResponse<PublicPortfolioDto>.Ok(publicDto));
    }

    [HttpGet("check-slug/{slug}")]
    public async Task<ActionResult<ApiResponse<object>>> CheckSlugAvailability(string slug, [FromQuery] string? currentUserId, CancellationToken cancellationToken)
    {
        var cleanSlug = slug.Trim().ToLowerInvariant();
        var available = await slugRepository.IsSlugAvailableAsync(cleanSlug, currentUserId ?? string.Empty, cancellationToken);

        return Ok(ApiResponse<object>.Ok(new
        {
            slug = cleanSlug,
            available
        }));
    }
}
