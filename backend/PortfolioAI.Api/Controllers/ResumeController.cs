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
        if (ext != ".pdf" && ext != ".docx")
        {
            return BadRequest(ApiResponse.Fail("Only .pdf and .docx file formats are supported.", "INVALID_FORMAT"));
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
    public async Task<ActionResult<ApiResponse<AiAnalysisResult>>> AnalyzeResume(CancellationToken cancellationToken)
    {
        var resumeData = await resumeStorage.GetResumeAsync(userContext.UserId);
        if (resumeData == null)
        {
            return BadRequest(ApiResponse.Fail("No resume found. Please upload a resume before analyzing.", "NO_RESUME_FOUND"));
        }

        await using var stream = resumeData.Value.Stream;
        var ext = Path.GetExtension(resumeData.Value.FileName);
        var extractedText = textExtractor.ExtractText(stream, ext);

        if (string.IsNullOrWhiteSpace(extractedText))
        {
            return BadRequest(ApiResponse.Fail("Unable to read any text from the uploaded document.", "TEXT_EXTRACTION_FAILED"));
        }

        logger.LogInformation("Extracted {Length} characters from resume for user {UserId}", extractedText.Length, userContext.UserId);

        var analysisResult = await resumeAiService.AnalyzeResumeTextAsync(extractedText, cancellationToken);

        // Save AI analysis result to: /storage/users/{userId}/ai/latest-analysis.json
        var analysisPath = GetAiAnalysisPath(userContext.UserId);
        await fileStorage.WriteJsonAsync(analysisPath, analysisResult, createBackup: false, cancellationToken);

        // Check user privacy settings for auto-deletion
        var settings = await fileStorage.ReadJsonAsync<UserSettings>(GetSettingsPath(userContext.UserId), cancellationToken);
        if (settings?.AutoDeleteResumeAfterAnalysis == true)
        {
            logger.LogInformation("AutoDeleteResumeAfterAnalysis enabled. Deleting resume for user {UserId}", userContext.UserId);
            await resumeStorage.DeleteResumeAsync(userContext.UserId);
        }

        return Ok(ApiResponse<AiAnalysisResult>.Ok(analysisResult, "Resume successfully analyzed by AI."));
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
