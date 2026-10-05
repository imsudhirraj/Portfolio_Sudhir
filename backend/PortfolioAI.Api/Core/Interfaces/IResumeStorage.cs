namespace PortfolioAI.Api.Core.Interfaces;

public record StoredResumeInfo(bool Exists, string? FileName, long FileSizeBytes, DateTime? UploadedAtUtc);

public interface IResumeStorage
{
    Task<string> SaveResumeAsync(string userId, Stream stream, string originalFileName, CancellationToken cancellationToken = default);
    Task<(Stream Stream, string ContentType, string FileName, string Extension)?> GetResumeAsync(string userId);
    Task<StoredResumeInfo> GetResumeInfoAsync(string userId);
    Task<bool> DeleteResumeAsync(string userId);
}
