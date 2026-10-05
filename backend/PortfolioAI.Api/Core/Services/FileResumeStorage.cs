using PortfolioAI.Api.Core.Interfaces;

namespace PortfolioAI.Api.Core.Services;

public class FileResumeStorage(IFileStorageService fileStorage, ILogger<FileResumeStorage> logger) : IResumeStorage
{
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB
    private record ResumeMetadata(string OriginalFileName, string Extension, long FileSizeBytes, DateTime UploadedAtUtc);

    private static string GetResumeDirectory(string userId) => Path.Combine("users", userId, "resume");
    private static string GetMetaPath(string userId) => Path.Combine("users", userId, "resume", "metadata.json");

    public async Task<string> SaveResumeAsync(string userId, Stream stream, string originalFileName, CancellationToken cancellationToken = default)
    {
        if (stream.Length > MaxFileSize)
        {
            throw new ArgumentException($"File size exceeds maximum permitted limit of {MaxFileSize / (1024 * 1024)}MB.");
        }

        // Validate extension
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (ext != ".pdf" && ext != ".docx" && ext != ".txt")
        {
            throw new ArgumentException("Only .pdf, .docx, and .txt file formats are permitted.");
        }

        // Validate magic bytes
        var headerBytes = new byte[8];
        var bytesRead = await stream.ReadAsync(headerBytes.AsMemory(0, 8), cancellationToken);
        stream.Seek(0, SeekOrigin.Begin);

        if (bytesRead < 4)
        {
            throw new ArgumentException("Uploaded file is corrupted or empty.");
        }

        if (ext == ".pdf")
        {
            // PDF starts with "%PDF" (0x25, 0x50, 0x44, 0x46)
            if (headerBytes[0] != 0x25 || headerBytes[1] != 0x50 || headerBytes[2] != 0x44 || headerBytes[3] != 0x46)
            {
                throw new ArgumentException("Invalid file format. File does not contain valid PDF headers.");
            }
        }
        else if (ext == ".docx")
        {
            // DOCX is a zip archive starting with "PK\x03\x04" (0x50, 0x4B, 0x03, 0x04)
            if (headerBytes[0] != 0x50 || headerBytes[1] != 0x4B || headerBytes[2] != 0x03 || headerBytes[3] != 0x04)
            {
                throw new ArgumentException("Invalid file format. File does not contain valid DOCX zip headers.");
            }
        }
        else if (ext == ".txt")
        {
            // Verify TXT is not an executable (MZ = 0x4D, 0x5A or ELF = 0x7F, 0x45, 0x4C, 0x46)
            if ((headerBytes[0] == 0x4D && headerBytes[1] == 0x5A) ||
                (headerBytes[0] == 0x7F && headerBytes[1] == 0x45 && headerBytes[2] == 0x4C && headerBytes[3] == 0x46))
            {
                throw new ArgumentException("Invalid file format. Executable binary files cannot be uploaded as text resumes.");
            }
        }

        // Clean any existing resume files in user's resume directory
        await DeleteResumeAsync(userId);

        // Safe deterministic server-side filename
        var safeFileName = $"resume{ext}";
        var relativeFilePath = Path.Combine(GetResumeDirectory(userId), safeFileName);

        await fileStorage.SaveBinaryFileAsync(relativeFilePath, stream, cancellationToken);

        // Save metadata
        var metadata = new ResumeMetadata(
            OriginalFileName: Path.GetFileName(originalFileName),
            Extension: ext,
            FileSizeBytes: stream.Length,
            UploadedAtUtc: DateTime.UtcNow
        );
        await fileStorage.WriteJsonAsync(GetMetaPath(userId), metadata, createBackup: false, cancellationToken);

        logger.LogInformation("Resume successfully saved for user {UserId} as {SafeFileName}", userId, safeFileName);
        return safeFileName;
    }

    public async Task<(Stream Stream, string ContentType, string FileName, string Extension)?> GetResumeAsync(string userId)
    {
        var meta = await fileStorage.ReadJsonAsync<ResumeMetadata>(GetMetaPath(userId));
        if (meta == null)
        {
            return null;
        }

        var relativeFilePath = Path.Combine(GetResumeDirectory(userId), $"resume{meta.Extension}");
        var fileData = await fileStorage.ReadBinaryFileAsync(relativeFilePath);
        if (fileData == null)
        {
            return null;
        }

        return (fileData.Value.Stream, fileData.Value.ContentType, meta.OriginalFileName, meta.Extension);
    }

    public async Task<StoredResumeInfo> GetResumeInfoAsync(string userId)
    {
        var meta = await fileStorage.ReadJsonAsync<ResumeMetadata>(GetMetaPath(userId));
        if (meta == null)
        {
            return new StoredResumeInfo(false, null, 0, null);
        }

        var relativeFilePath = Path.Combine(GetResumeDirectory(userId), $"resume{meta.Extension}");
        var exists = await fileStorage.FileExistsAsync(relativeFilePath);
        return new StoredResumeInfo(exists, meta.OriginalFileName, meta.FileSizeBytes, meta.UploadedAtUtc);
    }

    public async Task<bool> DeleteResumeAsync(string userId)
    {
        var resumeDir = GetResumeDirectory(userId);
        var deletedDir = await fileStorage.DeleteDirectoryAsync(resumeDir);
        return deletedDir;
    }
}
