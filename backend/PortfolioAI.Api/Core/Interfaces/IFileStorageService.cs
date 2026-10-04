namespace PortfolioAI.Api.Core.Interfaces;

public interface IFileStorageService
{
    string GetUserDirectory(string userId);
    Task<T?> ReadJsonAsync<T>(string relativePath, CancellationToken cancellationToken = default);
    Task WriteJsonAsync<T>(string relativePath, T data, bool createBackup = true, CancellationToken cancellationToken = default);
    Task<bool> FileExistsAsync(string relativePath);
    Task<bool> DeleteFileAsync(string relativePath);
    Task<bool> DeleteDirectoryAsync(string relativePath);
    Task SaveBinaryFileAsync(string relativePath, Stream stream, CancellationToken cancellationToken = default);
    Task<(Stream Stream, string ContentType)?> ReadBinaryFileAsync(string relativePath);
}
