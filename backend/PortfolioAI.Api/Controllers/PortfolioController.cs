using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioAI.Api.Core.Interfaces;
using PortfolioAI.Api.Core.Models;

namespace PortfolioAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PortfolioController(
    IPortfolioRepository portfolioRepository,
    IPublicSlugRepository slugRepository,
    IUserContext userContext,
    ILogger<PortfolioController> logger) : ControllerBase
{
    public record PublishRequest(string Slug);

    [HttpGet]
    public async Task<ActionResult<ApiResponse<Portfolio>>> GetPortfolio(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        return Ok(ApiResponse<Portfolio>.Ok(portfolio));
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<Portfolio>>> UpdatePortfolio([FromBody] Portfolio portfolio, CancellationToken cancellationToken)
    {
        var saved = await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<Portfolio>.Ok(saved, "Portfolio saved successfully."));
    }

    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<Profile>>> GetProfile(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        return Ok(ApiResponse<Profile>.Ok(portfolio.Profile));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<Profile>>> UpdateProfile([FromBody] Profile profile, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.UpdateProfileAsync(userContext.UserId, profile, cancellationToken);
        return Ok(ApiResponse<Profile>.Ok(portfolio.Profile, "Profile updated successfully."));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<Summary>>> GetSummary(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        return Ok(ApiResponse<Summary>.Ok(portfolio.Summary));
    }

    [HttpPut("summary")]
    public async Task<ActionResult<ApiResponse<Summary>>> UpdateSummary([FromBody] Summary summary, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.UpdateSummaryAsync(userContext.UserId, summary, cancellationToken);
        return Ok(ApiResponse<Summary>.Ok(portfolio.Summary, "Summary updated successfully."));
    }

    [HttpGet("experience")]
    public async Task<ActionResult<ApiResponse<List<ExperienceItem>>>> GetExperience(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        return Ok(ApiResponse<List<ExperienceItem>>.Ok(portfolio.Experience));
    }

    [HttpPost("experience")]
    public async Task<ActionResult<ApiResponse<ExperienceItem>>> AddExperience([FromBody] ExperienceItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        if (string.IsNullOrWhiteSpace(item.Id))
        {
            item.Id = Guid.NewGuid().ToString("N");
        }
        portfolio.Experience.Add(item);
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<ExperienceItem>.Ok(item, "Experience item added."));
    }

    [HttpPut("experience/{id}")]
    public async Task<ActionResult<ApiResponse<ExperienceItem>>> UpdateExperience(string id, [FromBody] ExperienceItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var index = portfolio.Experience.FindIndex(e => e.Id == id);
        if (index < 0)
        {
            return NotFound(ApiResponse.Fail("Experience item not found.", "NOT_FOUND"));
        }

        item.Id = id;
        portfolio.Experience[index] = item;
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<ExperienceItem>.Ok(item, "Experience item updated."));
    }

    [HttpDelete("experience/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteExperience(string id, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var removed = portfolio.Experience.RemoveAll(e => e.Id == id);
        if (removed == 0)
        {
            return NotFound(ApiResponse.Fail("Experience item not found.", "NOT_FOUND"));
        }

        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse.SuccessResult("Experience item deleted."));
    }

    [HttpGet("projects")]
    public async Task<ActionResult<ApiResponse<List<ProjectItem>>>> GetProjects(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        return Ok(ApiResponse<List<ProjectItem>>.Ok(portfolio.Projects));
    }

    [HttpPost("projects")]
    public async Task<ActionResult<ApiResponse<ProjectItem>>> AddProject([FromBody] ProjectItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        if (string.IsNullOrWhiteSpace(item.Id))
        {
            item.Id = Guid.NewGuid().ToString("N");
        }
        portfolio.Projects.Add(item);
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<ProjectItem>.Ok(item, "Project added."));
    }

    [HttpPut("projects/{id}")]
    public async Task<ActionResult<ApiResponse<ProjectItem>>> UpdateProject(string id, [FromBody] ProjectItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var index = portfolio.Projects.FindIndex(p => p.Id == id);
        if (index < 0)
        {
            return NotFound(ApiResponse.Fail("Project not found.", "NOT_FOUND"));
        }

        item.Id = id;
        portfolio.Projects[index] = item;
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<ProjectItem>.Ok(item, "Project updated."));
    }

    [HttpDelete("projects/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteProject(string id, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var removed = portfolio.Projects.RemoveAll(p => p.Id == id);
        if (removed == 0)
        {
            return NotFound(ApiResponse.Fail("Project not found.", "NOT_FOUND"));
        }

        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse.SuccessResult("Project deleted."));
    }

    [HttpGet("skills")]
    public async Task<ActionResult<ApiResponse<List<SkillItem>>>> GetSkills(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        return Ok(ApiResponse<List<SkillItem>>.Ok(portfolio.Skills));
    }

    [HttpPost("skills")]
    public async Task<ActionResult<ApiResponse<SkillItem>>> AddSkill([FromBody] SkillItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        if (string.IsNullOrWhiteSpace(item.Id))
        {
            item.Id = Guid.NewGuid().ToString("N");
        }
        portfolio.Skills.Add(item);
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<SkillItem>.Ok(item, "Skill added."));
    }

    [HttpPut("skills/{id}")]
    public async Task<ActionResult<ApiResponse<SkillItem>>> UpdateSkill(string id, [FromBody] SkillItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var index = portfolio.Skills.FindIndex(s => s.Id == id);
        if (index < 0)
        {
            return NotFound(ApiResponse.Fail("Skill not found.", "NOT_FOUND"));
        }

        item.Id = id;
        portfolio.Skills[index] = item;
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<SkillItem>.Ok(item, "Skill updated."));
    }

    [HttpDelete("skills/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteSkill(string id, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var removed = portfolio.Skills.RemoveAll(s => s.Id == id);
        if (removed == 0)
        {
            return NotFound(ApiResponse.Fail("Skill not found.", "NOT_FOUND"));
        }

        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse.SuccessResult("Skill deleted."));
    }

    [HttpGet("education")]
    public async Task<ActionResult<ApiResponse<List<EducationItem>>>> GetEducation(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        return Ok(ApiResponse<List<EducationItem>>.Ok(portfolio.Education));
    }

    [HttpPost("education")]
    public async Task<ActionResult<ApiResponse<EducationItem>>> AddEducation([FromBody] EducationItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        if (string.IsNullOrWhiteSpace(item.Id))
        {
            item.Id = Guid.NewGuid().ToString("N");
        }
        portfolio.Education.Add(item);
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<EducationItem>.Ok(item, "Education added."));
    }

    [HttpPut("education/{id}")]
    public async Task<ActionResult<ApiResponse<EducationItem>>> UpdateEducation(string id, [FromBody] EducationItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var index = portfolio.Education.FindIndex(e => e.Id == id);
        if (index < 0)
        {
            return NotFound(ApiResponse.Fail("Education record not found.", "NOT_FOUND"));
        }

        item.Id = id;
        portfolio.Education[index] = item;
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<EducationItem>.Ok(item, "Education updated."));
    }

    [HttpDelete("education/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteEducation(string id, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var removed = portfolio.Education.RemoveAll(e => e.Id == id);
        if (removed == 0)
        {
            return NotFound(ApiResponse.Fail("Education record not found.", "NOT_FOUND"));
        }

        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse.SuccessResult("Education record deleted."));
    }

    [HttpGet("certifications")]
    public async Task<ActionResult<ApiResponse<List<CertificationItem>>>> GetCertifications(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        return Ok(ApiResponse<List<CertificationItem>>.Ok(portfolio.Certifications));
    }

    [HttpPost("certifications")]
    public async Task<ActionResult<ApiResponse<CertificationItem>>> AddCertification([FromBody] CertificationItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        if (string.IsNullOrWhiteSpace(item.Id))
        {
            item.Id = Guid.NewGuid().ToString("N");
        }
        portfolio.Certifications.Add(item);
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<CertificationItem>.Ok(item, "Certification added."));
    }

    [HttpPut("certifications/{id}")]
    public async Task<ActionResult<ApiResponse<CertificationItem>>> UpdateCertification(string id, [FromBody] CertificationItem item, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var index = portfolio.Certifications.FindIndex(c => c.Id == id);
        if (index < 0)
        {
            return NotFound(ApiResponse.Fail("Certification not found.", "NOT_FOUND"));
        }

        item.Id = id;
        portfolio.Certifications[index] = item;
        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse<CertificationItem>.Ok(item, "Certification updated."));
    }

    [HttpDelete("certifications/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteCertification(string id, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        var removed = portfolio.Certifications.RemoveAll(c => c.Id == id);
        if (removed == 0)
        {
            return NotFound(ApiResponse.Fail("Certification not found.", "NOT_FOUND"));
        }

        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        return Ok(ApiResponse.SuccessResult("Certification deleted."));
    }

    [HttpPut("theme")]
    public async Task<ActionResult<ApiResponse<ThemeConfig>>> UpdateTheme([FromBody] ThemeConfig theme, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.UpdateThemeAsync(userContext.UserId, theme, cancellationToken);
        return Ok(ApiResponse<ThemeConfig>.Ok(portfolio.Theme, "Theme configuration updated."));
    }

    [HttpPut("sections")]
    public async Task<ActionResult<ApiResponse<SectionsConfig>>> UpdateSections([FromBody] SectionsConfig sections, CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.UpdateSectionsAsync(userContext.UserId, sections, cancellationToken);
        return Ok(ApiResponse<SectionsConfig>.Ok(portfolio.Sections, "Section configuration updated."));
    }

    [HttpPost("publish")]
    public async Task<ActionResult<ApiResponse<PublicationConfig>>> Publish([FromBody] PublishRequest request, CancellationToken cancellationToken)
    {
        var cleanSlug = request.Slug.Trim().ToLowerInvariant();
        var available = await slugRepository.IsSlugAvailableAsync(cleanSlug, userContext.UserId, cancellationToken);
        if (!available)
        {
            return BadRequest(ApiResponse.Fail("This custom URL slug is invalid or already taken by another user.", "SLUG_UNAVAILABLE"));
        }

        var registered = await slugRepository.RegisterSlugAsync(cleanSlug, userContext.UserId, cancellationToken);
        if (!registered)
        {
            return BadRequest(ApiResponse.Fail("Unable to register this URL slug.", "SLUG_REGISTRATION_FAILED"));
        }

        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        portfolio.Publication.IsPublished = true;
        portfolio.Publication.Slug = cleanSlug;
        portfolio.Publication.PublishedAtUtc = DateTime.UtcNow;

        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        logger.LogInformation("Portfolio published for user {UserId} with slug {Slug}", userContext.UserId, cleanSlug);

        return Ok(ApiResponse<PublicationConfig>.Ok(portfolio.Publication, "Portfolio successfully published."));
    }

    [HttpPost("unpublish")]
    public async Task<ActionResult<ApiResponse<PublicationConfig>>> Unpublish(CancellationToken cancellationToken)
    {
        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
        if (!string.IsNullOrWhiteSpace(portfolio.Publication.Slug))
        {
            await slugRepository.ReleaseSlugAsync(portfolio.Publication.Slug, userContext.UserId, cancellationToken);
        }

        portfolio.Publication.IsPublished = false;
        portfolio.Publication.PublishedAtUtc = null;

        await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        logger.LogInformation("Portfolio unpublished for user {UserId}", userContext.UserId);

        return Ok(ApiResponse<PublicationConfig>.Ok(portfolio.Publication, "Portfolio unpublished."));
    }
}
