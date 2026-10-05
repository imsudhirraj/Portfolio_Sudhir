using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioAI.Api.Core.Interfaces;
using PortfolioAI.Api.Core.Models;
using PortfolioAI.Api.Core.Services;

namespace PortfolioAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResumeController(
    IResumeStorage resumeStorage,
    DocumentTextExtractor textExtractor,
    IResumeAIService resumeAiService,
    IPortfolioRepository portfolioRepository,
    IFileStorageService fileStorage,
    IUserContext userContext,
    ILogger<ResumeController> logger) : ControllerBase
{
    private static string GetAiAnalysisPath(string userId) => Path.Combine("users", userId, "ai", "latest-analysis.json");
    private static string GetSettingsPath(string userId) => Path.Combine("users", userId, "settings.json");

    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB
    public async Task<ActionResult<ApiResponse<object>>> UploadResume([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse.Fail("Please select a valid resume file to upload.", "EMPTY_FILE"));
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowed = new[] { ".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".webp" };
        if (!allowed.Contains(ext))
        {
            return BadRequest(ApiResponse.Fail("Supported formats: PDF, DOCX, TXT, and image files (PNG, JPG, WEBP).", "INVALID_FORMAT"));
        }

        await using var stream = file.OpenReadStream();
        var safeFileName = await resumeStorage.SaveResumeAsync(userContext.UserId, stream, file.FileName, cancellationToken);

        var info = await resumeStorage.GetResumeInfoAsync(userContext.UserId);
        return Ok(ApiResponse<object>.Ok(new
        {
            fileName = safeFileName,
            originalName = file.FileName,
            fileSize = file.Length,
            uploadedAt = info.UploadedAtUtc
        }, "Resume uploaded successfully."));
    }

    [HttpPost("analyze")]
    public async Task<ActionResult<ApiResponse<object>>> AnalyzeResume([FromQuery] bool autoBuild = false, CancellationToken cancellationToken = default)
    {
        var resumeData = await resumeStorage.GetResumeAsync(userContext.UserId);
        if (resumeData == null)
        {
            return BadRequest(ApiResponse.Fail("No resume found. Please upload a resume before analyzing.", "NO_RESUME_FOUND"));
        }

        await using var stream = resumeData.Value.Stream;
        var ext = !string.IsNullOrWhiteSpace(resumeData.Value.Extension)
            ? resumeData.Value.Extension
            : Path.GetExtension(resumeData.Value.FileName);

        if (string.IsNullOrWhiteSpace(ext))
        {
            ext = resumeData.Value.ContentType switch
            {
                "application/pdf" => ".pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => ".docx",
                "text/plain" => ".txt",
                "image/png" => ".png",
                "image/jpeg" => ".jpg",
                "image/webp" => ".webp",
                _ => ".pdf"
            };
        }

        // Direct visual analysis for uploaded image files (PNG, JPG, WEBP)
        if (ext is ".png" or ".jpg" or ".jpeg" or ".webp")
        {
            logger.LogInformation("Image resume detected ({Ext}) for user {UserId}. Running visual analysis.", ext, userContext.UserId);
            try
            {
                if (stream.CanSeek)
                {
                    stream.Seek(0, SeekOrigin.Begin);
                }
                var contentType = resumeData.Value.ContentType;
                if (string.IsNullOrWhiteSpace(contentType) || contentType == "application/octet-stream")
                {
                    contentType = ext switch
                    {
                        ".png" => "image/png",
                        ".webp" => "image/webp",
                        _ => "image/jpeg"
                    };
                }
                var visualAnalysis = await resumeAiService.AnalyzeDocumentBytesAsync(stream, contentType, cancellationToken);
                return await SaveAnalysisAndRespondAsync(visualAnalysis, autoBuild, cancellationToken);
            }
            catch (Exception vEx)
            {
                logger.LogWarning(vEx, "Visual document analysis could not be completed on image resume for user {UserId}", userContext.UserId);
                return BadRequest(ApiResponse.Fail(
                    "The uploaded image resume will be extracted using our built-in OCR engine.",
                    "SCANNED_DOCUMENT_NOT_SUPPORTED"));
            }
        }

        string extractedText;
        try
        {
            extractedText = textExtractor.ExtractText(stream, ext);
        }
        catch (ScannedDocumentException sEx)
        {
            logger.LogInformation("Scanned document detected for user {UserId}. Attempting Gemini Vision analysis.", userContext.UserId);
            try
            {
                if (stream.CanSeek)
                {
                    stream.Seek(0, SeekOrigin.Begin);
                }
                var visualAnalysis = await resumeAiService.AnalyzeDocumentBytesAsync(stream, resumeData.Value.ContentType, cancellationToken);
                return await SaveAnalysisAndRespondAsync(visualAnalysis, autoBuild, cancellationToken);
            }
            catch (Exception vEx)
            {
                logger.LogWarning(vEx, "Visual document analysis could not be completed for user {UserId}", userContext.UserId);
                return BadRequest(ApiResponse.Fail(
                    sEx.Message + " (Click the 'Paste Resume Text' tab to paste your details directly).",
                    "SCANNED_DOCUMENT_NOT_SUPPORTED"));
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to extract text from resume for user {UserId}", userContext.UserId);
            return BadRequest(ApiResponse.Fail(
                $"Failed to read document: {ex.Message}. If this document has complex formatting, please copy and paste the text using the 'Paste Resume Text' option.",
                "TEXT_EXTRACTION_FAILED"));
        }

        if (string.IsNullOrWhiteSpace(extractedText))
        {
            return BadRequest(ApiResponse.Fail(
                "Unable to read any text from the uploaded document. If this is a scanned document or image, please upload a document with selectable text or use the 'Paste Resume Text' option.",
                "TEXT_EXTRACTION_FAILED"));
        }

        logger.LogInformation("Extracted {Length} characters from resume for user {UserId}", extractedText.Length, userContext.UserId);

        var analysisResult = await resumeAiService.AnalyzeResumeTextAsync(extractedText, cancellationToken);
        return await SaveAnalysisAndRespondAsync(analysisResult, autoBuild, cancellationToken);
    }

    private async Task<ActionResult<ApiResponse<object>>> SaveAnalysisAndRespondAsync(
        AiAnalysisResult analysisResult,
        bool autoBuild,
        CancellationToken cancellationToken)
    {
        // Save AI analysis result to: /storage/users/{userId}/ai/latest-analysis.json
        var analysisPath = GetAiAnalysisPath(userContext.UserId);
        await fileStorage.WriteJsonAsync(analysisPath, analysisResult, createBackup: false, cancellationToken);

        Portfolio? updatedPortfolio = null;
        if (autoBuild)
        {
            updatedPortfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
            ApplyAnalysisToPortfolio(updatedPortfolio, analysisResult);
            await portfolioRepository.SavePortfolioAsync(userContext.UserId, updatedPortfolio, cancellationToken);
            logger.LogInformation("Auto-built portfolio for user {UserId} from analyzed resume", userContext.UserId);
        }

        // Check user privacy settings for auto-deletion
        var settings = await fileStorage.ReadJsonAsync<UserSettings>(GetSettingsPath(userContext.UserId), cancellationToken);
        if (settings?.AutoDeleteResumeAfterAnalysis == true)
        {
            logger.LogInformation("AutoDeleteResumeAfterAnalysis enabled. Deleting resume for user {UserId}", userContext.UserId);
            await resumeStorage.DeleteResumeAsync(userContext.UserId);
        }

        return Ok(ApiResponse<object>.Ok(new
        {
            analysis = analysisResult,
            portfolio = updatedPortfolio,
            autoBuilt = autoBuild
        }, autoBuild ? "Portfolio successfully built from resume." : "Resume successfully analyzed by AI."));
    }

    [HttpPost("analyze-and-build")]
    public Task<ActionResult<ApiResponse<object>>> AnalyzeAndBuildResume(CancellationToken cancellationToken) =>
        AnalyzeResume(autoBuild: true, cancellationToken);

    public record AnalyzeTextRequest(string Text, bool AutoBuild = false);

    [HttpPost("analyze-text")]
    public async Task<ActionResult<ApiResponse<object>>> AnalyzeText([FromBody] AnalyzeTextRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request?.Text))
        {
            return BadRequest(ApiResponse.Fail("Please provide resume text to analyze.", "EMPTY_TEXT"));
        }

        var extractedText = request.Text.Trim();
        if (extractedText.Length < 30)
        {
            return BadRequest(ApiResponse.Fail("Resume text is too brief (minimum 30 characters). Please paste your complete resume or CV text.", "TEXT_TOO_SHORT"));
        }

        logger.LogInformation("Processing direct text analysis ({Length} chars) for user {UserId}", extractedText.Length, userContext.UserId);

        var analysisResult = await resumeAiService.AnalyzeResumeTextAsync(extractedText, cancellationToken);

        // Save AI analysis result to: /storage/users/{userId}/ai/latest-analysis.json
        var analysisPath = GetAiAnalysisPath(userContext.UserId);
        await fileStorage.WriteJsonAsync(analysisPath, analysisResult, createBackup: false, cancellationToken);

        Portfolio? updatedPortfolio = null;
        if (request.AutoBuild)
        {
            updatedPortfolio = await portfolioRepository.GetOrCreatePortfolioAsync(userContext.UserId, cancellationToken);
            ApplyAnalysisToPortfolio(updatedPortfolio, analysisResult);
            await portfolioRepository.SavePortfolioAsync(userContext.UserId, updatedPortfolio, cancellationToken);
            logger.LogInformation("Auto-built portfolio for user {UserId} from pasted text", userContext.UserId);
        }

        return Ok(ApiResponse<object>.Ok(new
        {
            analysis = analysisResult,
            portfolio = updatedPortfolio,
            autoBuilt = request.AutoBuild
        }, request.AutoBuild ? "Portfolio successfully built from resume text." : "Resume text successfully analyzed by AI."));
    }

    public static void ApplyAnalysisToPortfolio(Portfolio portfolio, AiAnalysisResult analysis)
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

        if (!string.IsNullOrWhiteSpace(analysis.Summary.Content.Value))
        {
            portfolio.Summary.Content = analysis.Summary.Content.Value;
        }

        // Clean out default dummy template data if present
        portfolio.Experience.RemoveAll(e => e.Company == "Tech Innovators Inc.");
        portfolio.Projects.RemoveAll(p => p.Name == "PortfolioAI Platform");
        portfolio.Education.RemoveAll(ed => ed.Institution == "National Institute of Technology");
        portfolio.Certifications.RemoveAll(c => c.Name == "AWS Certified Solutions Architect - Associate");

        // If real skills were extracted, replace default placeholder skills
        if (analysis.Skills.Count > 0)
        {
            var isOnlyStarterSkills = portfolio.Skills.All(s =>
                s.Name is "TypeScript" or "C# / .NET" or "Cloud Architecture" or
                "C# / .NET 9" or "ASP.NET Core Web API" or "Angular & TypeScript" or
                "Microservices Architecture" or "PostgreSQL & SQL Server" or
                "Docker & Kubernetes" or "AWS / Azure Cloud" or "LLM & AI Integration");

            if (isOnlyStarterSkills)
            {
                portfolio.Skills.Clear();
            }

            foreach (var s in analysis.Skills)
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
            portfolio.Sections.Skills = true;
        }

        // If real experience was extracted, add all roles
        if (analysis.Experience.Count > 0)
        {
            foreach (var e in analysis.Experience)
            {
                if (!portfolio.Experience.Any(existing => string.Equals(existing.Company, e.Company, StringComparison.OrdinalIgnoreCase) && string.Equals(existing.JobTitle, e.JobTitle, StringComparison.OrdinalIgnoreCase)))
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
            portfolio.Sections.Experience = true;
        }

        // If real projects were extracted, add them
        if (analysis.Projects.Count > 0)
        {
            foreach (var p in analysis.Projects)
            {
                if (!portfolio.Projects.Any(existing => string.Equals(existing.Name, p.Name, StringComparison.OrdinalIgnoreCase)))
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
            portfolio.Sections.Projects = true;
        }

        // If education extracted, add it
        if (analysis.Education.Count > 0)
        {
            foreach (var ed in analysis.Education)
            {
                if (!portfolio.Education.Any(existing => string.Equals(existing.Institution, ed.Institution, StringComparison.OrdinalIgnoreCase)))
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
            portfolio.Sections.Education = true;
        }

        // If certifications extracted, add them
        if (analysis.Certifications.Count > 0)
        {
            foreach (var c in analysis.Certifications)
            {
                if (!portfolio.Certifications.Any(existing => string.Equals(existing.Name, c.Name, StringComparison.OrdinalIgnoreCase)))
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
            portfolio.Sections.Certifications = true;
        }
    }

    [HttpGet("download")]
    public async Task<IActionResult> DownloadResume()
    {
        var file = await resumeStorage.GetResumeAsync(userContext.UserId);
        if (file == null)
        {
            return NotFound(ApiResponse.Fail("No resume found for download.", "NOT_FOUND"));
        }

        return File(file.Value.Stream, file.Value.ContentType, file.Value.FileName);
    }

    [HttpGet("info")]
    public async Task<ActionResult<ApiResponse<StoredResumeInfo>>> GetResumeInfo()
    {
        var info = await resumeStorage.GetResumeInfoAsync(userContext.UserId);
        return Ok(ApiResponse<StoredResumeInfo>.Ok(info));
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse>> DeleteResume()
    {
        var deleted = await resumeStorage.DeleteResumeAsync(userContext.UserId);
        return Ok(ApiResponse.SuccessResult(deleted ? "Resume deleted." : "No resume found to delete."));
    }
}
