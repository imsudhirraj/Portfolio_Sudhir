using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioAI.Api.Core.Interfaces;
using PortfolioAI.Api.Core.Models;

namespace PortfolioAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AiController(
    IResumeAIService resumeAiService,
    IPortfolioRepository portfolioRepository,
    IFileStorageService fileStorage,
    IUserContext userContext,
    ILogger<AiController> logger) : ControllerBase
{
    private static string GetAiAnalysisPath(string userId) => Path.Combine("users", userId, "ai", "latest-analysis.json");

    public record ApplySuggestionsRequest(
        bool ApplyProfile,
        bool ApplySummary,
        List<string>? SelectedSkillIds,
        List<string>? SelectedExperienceIds,
        List<string>? SelectedProjectIds,
        List<string>? SelectedEducationIds,
        List<string>? SelectedCertificationIds
    );

    public record ImproveSummaryRequest(string CurrentSummary, string Tone = "professional");
    public record ImproveProjectRequest(string Description, string Role, List<string> Technologies);
    public record GenerateHeadlineRequest(string FullName, string Role, List<string> TopSkills);

    [HttpGet("latest-analysis")]
    public async Task<ActionResult<ApiResponse<AiAnalysisResult>>> GetLatestAnalysis(CancellationToken cancellationToken)
    {
        var path = GetAiAnalysisPath(userContext.UserId);
        var result = await fileStorage.ReadJsonAsync<AiAnalysisResult>(path, cancellationToken);
        if (result == null)
        {
            return NotFound(ApiResponse.Fail("No AI analysis found. Upload and analyze a resume first.", "NO_ANALYSIS"));
        }

        return Ok(ApiResponse<AiAnalysisResult>.Ok(result));
    }

    [HttpPost("apply-suggestions")]
    public async Task<ActionResult<ApiResponse<Portfolio>>> ApplySuggestions([FromBody] ApplySuggestionsRequest request, CancellationToken cancellationToken)
    {
        var path = GetAiAnalysisPath(userContext.UserId);
        var analysis = await fileStorage.ReadJsonAsync<AiAnalysisResult>(path, cancellationToken);
        if (analysis == null)
        {
            return BadRequest(ApiResponse.Fail("No AI analysis available to apply suggestions from.", "NO_ANALYSIS"));
        }

        var portfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);

        // Apply Profile fields if requested
        if (request.ApplyProfile)
        {
            if (!string.IsNullOrWhiteSpace(analysis.Profile.FullName.Value))
                portfolio.Profile.FullName = analysis.Profile.FullName.Value;

            if (!string.IsNullOrWhiteSpace(analysis.Profile.ProfessionalTitle.Value))
                portfolio.Profile.ProfessionalTitle = analysis.Profile.ProfessionalTitle.Value;

            if (!string.IsNullOrWhiteSpace(analysis.Profile.Email.Value))
                portfolio.Profile.Email = analysis.Profile.Email.Value;

            if (!string.IsNullOrWhiteSpace(analysis.Profile.Phone.Value))
                portfolio.Profile.Phone = analysis.Profile.Phone.Value;

            if (!string.IsNullOrWhiteSpace(analysis.Profile.Location.Value))
                portfolio.Profile.Location = analysis.Profile.Location.Value;

            if (!string.IsNullOrWhiteSpace(analysis.Profile.Linkedin.Value))
                portfolio.Profile.Linkedin = analysis.Profile.Linkedin.Value;

            if (!string.IsNullOrWhiteSpace(analysis.Profile.Github.Value))
                portfolio.Profile.Github = analysis.Profile.Github.Value;

            if (!string.IsNullOrWhiteSpace(analysis.Profile.Website.Value))
                portfolio.Profile.Website = analysis.Profile.Website.Value;
        }

        // Apply Summary if requested
        if (request.ApplySummary && !string.IsNullOrWhiteSpace(analysis.Summary.Content.Value))
        {
            portfolio.Summary.Content = analysis.Summary.Content.Value;
        }

        // Apply selected Skills (avoiding exact duplicates)
        if (request.SelectedSkillIds != null && request.SelectedSkillIds.Count > 0)
        {
            var skillsToAdd = analysis.Skills.Where(s => request.SelectedSkillIds.Contains(s.Id));
            foreach (var s in skillsToAdd)
            {
                if (!portfolio.Skills.Any(existing => string.Equals(existing.Name, s.Name, StringComparison.OrdinalIgnoreCase)))
                {
                    portfolio.Skills.Add(new SkillItem
                    {
                        Name = s.Name,
                        Category = s.Category,
                        Level = s.Level
                    });
                }
            }
        }

        // Apply selected Experience
        if (request.SelectedExperienceIds != null && request.SelectedExperienceIds.Count > 0)
        {
            var expToAdd = analysis.Experience.Where(e => request.SelectedExperienceIds.Contains(e.Id));
            foreach (var e in expToAdd)
            {
                portfolio.Experience.Add(new ExperienceItem
                {
                    Company = e.Company,
                    JobTitle = e.JobTitle,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    IsCurrent = e.IsCurrent,
                    Description = e.Description,
                    Responsibilities = [.. e.Responsibilities],
                    Achievements = [.. e.Achievements],
                    Technologies = [.. e.Technologies]
                });
            }
        }

        // Apply selected Projects
        if (request.SelectedProjectIds != null && request.SelectedProjectIds.Count > 0)
        {
            var projToAdd = analysis.Projects.Where(p => request.SelectedProjectIds.Contains(p.Id));
            foreach (var p in projToAdd)
            {
                portfolio.Projects.Add(new ProjectItem
                {
                    Name = p.Name,
                    Description = p.Description,
                    Role = p.Role,
                    Technologies = [.. p.Technologies],
                    Responsibilities = [.. p.Responsibilities],
                    Achievements = [.. p.Achievements],
                    ProjectUrl = p.ProjectUrl,
                    GithubUrl = p.GithubUrl
                });
            }
        }

        // Apply selected Education
        if (request.SelectedEducationIds != null && request.SelectedEducationIds.Count > 0)
        {
            var eduToAdd = analysis.Education.Where(ed => request.SelectedEducationIds.Contains(ed.Id));
            foreach (var ed in eduToAdd)
            {
                portfolio.Education.Add(new EducationItem
                {
                    Institution = ed.Institution,
                    Degree = ed.Degree,
                    FieldOfStudy = ed.FieldOfStudy,
                    StartDate = ed.StartDate,
                    EndDate = ed.EndDate,
                    Grade = ed.Grade,
                    Activities = ed.Activities
                });
            }
        }

        // Apply selected Certifications
        if (request.SelectedCertificationIds != null && request.SelectedCertificationIds.Count > 0)
        {
            var certToAdd = analysis.Certifications.Where(c => request.SelectedCertificationIds.Contains(c.Id));
            foreach (var c in certToAdd)
            {
                portfolio.Certifications.Add(new CertificationItem
                {
                    Name = c.Name,
                    Issuer = c.Issuer,
                    IssueDate = c.IssueDate,
                    ExpiryDate = c.ExpiryDate,
                    CredentialUrl = c.CredentialUrl,
                    CredentialId = c.CredentialId
                });
            }
        }

        var saved = await portfolioRepository.SavePortfolioAsync(userContext.UserId, portfolio, cancellationToken);
        logger.LogInformation("Successfully merged AI suggestions into user {UserId} portfolio", userContext.UserId);

        return Ok(ApiResponse<Portfolio>.Ok(saved, "AI suggestions successfully applied to portfolio."));
    }

    [HttpPost("improve-summary")]
    public async Task<ActionResult<ApiResponse<string>>> ImproveSummary([FromBody] ImproveSummaryRequest request, CancellationToken cancellationToken)
    {
        var result = await resumeAiService.ImproveSummaryAsync(request.CurrentSummary, request.Tone, cancellationToken);
        return Ok(ApiResponse<string>.Ok(result));
    }

    [HttpPost("improve-project")]
    public async Task<ActionResult<ApiResponse<string>>> ImproveProject([FromBody] ImproveProjectRequest request, CancellationToken cancellationToken)
    {
        var result = await resumeAiService.ImproveProjectDescriptionAsync(request.Description, request.Role, request.Technologies, cancellationToken);
        return Ok(ApiResponse<string>.Ok(result));
    }

    [HttpPost("generate-headline")]
    public async Task<ActionResult<ApiResponse<string>>> GenerateHeadline([FromBody] GenerateHeadlineRequest request, CancellationToken cancellationToken)
    {
        var result = await resumeAiService.GenerateHeadlineAsync(request.FullName, request.Role, request.TopSkills, cancellationToken);
        return Ok(ApiResponse<string>.Ok(result));
    }

    [HttpDelete("analysis")]
    public async Task<ActionResult<ApiResponse>> DeleteAnalysis()
    {
        var path = GetAiAnalysisPath(userContext.UserId);
        var deleted = await fileStorage.DeleteFileAsync(path);
        return Ok(ApiResponse.SuccessResult(deleted ? "AI analysis deleted." : "No analysis found to delete."));
    }
}
