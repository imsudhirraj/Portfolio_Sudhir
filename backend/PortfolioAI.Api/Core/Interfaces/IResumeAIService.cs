using PortfolioAI.Api.Core.Models;

namespace PortfolioAI.Api.Core.Interfaces;

public interface IResumeAIService
{
    Task<AiAnalysisResult> AnalyzeResumeTextAsync(string resumeText, CancellationToken cancellationToken = default);
    Task<AiAnalysisResult> AnalyzeDocumentBytesAsync(Stream documentStream, string contentType, CancellationToken cancellationToken = default);
    Task<string> ImproveSummaryAsync(string currentSummary, string tone = "professional", CancellationToken cancellationToken = default);
    Task<string> ImproveProjectDescriptionAsync(string currentDescription, string role, IEnumerable<string> technologies, CancellationToken cancellationToken = default);
    Task<string> GenerateHeadlineAsync(string fullName, string currentRole, IEnumerable<string> topSkills, CancellationToken cancellationToken = default);
}
