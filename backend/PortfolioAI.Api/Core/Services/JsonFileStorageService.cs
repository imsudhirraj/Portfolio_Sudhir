using System.Collections.Concurrent;
using System.Security;
using System.Text.Json;
using System.Text.Json.Serialization;
using PortfolioAI.Api.Core.Interfaces;

namespace PortfolioAI.Api.Core.Services;

public class JsonFileStorageService : IFileStorageService
{
    private readonly string _storageRoot;
    private readonly ILogger<JsonFileStorageService> _logger;
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> FileLocks = new(StringComparer.OrdinalIgnoreCase);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public JsonFileStorageService(IConfiguration configuration, IWebHostEnvironment environment, ILogger<JsonFileStorageService> logger)
    {
        _logger = logger;
        var configRoot = configuration["Storage:Root"] ?? "storage";

        _storageRoot = Path.IsPathRooted(configRoot)
            ? Path.GetFullPath(configRoot)
            : Path.GetFullPath(Path.Combine(environment.ContentRootPath, configRoot));

        if (!Directory.Exists(_storageRoot))
        {
            Directory.CreateDirectory(_storageRoot);
        }

        var publicDir = Path.Combine(_storageRoot, "public");
        if (!Directory.Exists(publicDir))
        {
            Directory.CreateDirectory(publicDir);
        }

        var usersDir = Path.Combine(_storageRoot, "users");
        if (!Directory.Exists(usersDir))
        {
            Directory.CreateDirectory(usersDir);
        }

        _logger.LogInformation("Storage root initialized at {StorageRoot}", _storageRoot);
    }

    public string GetUserDirectory(string userId)
    {
        var safeUserId = SanitizeIdentifier(userId);
        var userPath = Path.Combine(_storageRoot, "users", safeUserId);
        ValidateSecurePath(userPath);

        if (!Directory.Exists(userPath))
        {
            Directory.CreateDirectory(userPath);
        }

        return userPath;
    }

    public async Task<T?> ReadJsonAsync<T>(string relativePath, CancellationToken cancellationToken = default)
    {
        var fullPath = ResolveAndValidatePath(relativePath);
        if (!File.Exists(fullPath))
        {
            return default;
        }

        var fileLock = GetLock(fullPath);
        await fileLock.WaitAsync(cancellationToken);
        try
        {
            await using var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions, cancellationToken);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse JSON file {Path}. Attempting backup restore if available.", fullPath);
            var backupPath = fullPath + ".backup1";
            if (File.Exists(backupPath))
            {
                await using var bStream = new FileStream(backupPath, FileMode.Open, FileAccess.Read, FileShare.Read);
                return await JsonSerializer.DeserializeAsync<T>(bStream, JsonOptions, cancellationToken);
            }
            throw;
        }
        finally
        {
            fileLock.Release();
        }
    }

    public async Task WriteJsonAsync<T>(string relativePath, T data, bool createBackup = true, CancellationToken cancellationToken = default)
    {
        var fullPath = ResolveAndValidatePath(relativePath);
        var dir = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }

        var fileLock = GetLock(fullPath);
        await fileLock.WaitAsync(cancellationToken);
        try
        {
            // Rotate backups if target file already exists
            if (createBackup && File.Exists(fullPath))
            {
                RotateBackups(fullPath, maxBackups: 3);
            }

            // Atomic file write using .tmp file
            var tempPath = fullPath + "." + Guid.NewGuid().ToString("N") + ".tmp";
            try
            {
                await using (var fileStream = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, FileOptions.WriteThrough))
                {
                    await JsonSerializer.SerializeAsync(fileStream, data, JsonOptions, cancellationToken);
                    await fileStream.FlushAsync(cancellationToken);
                }

                // Atomic replace
                File.Move(tempPath, fullPath, overwrite: true);
            }
            catch
            {
                if (File.Exists(tempPath))
                {
                    try { File.Delete(tempPath); } catch { /* ignore */ }
                }
                throw;
            }
        }
        finally
        {
            fileLock.Release();
        }
    }

    public Task<bool> FileExistsAsync(string relativePath)
    {
        var fullPath = ResolveAndValidatePath(relativePath);
        return Task.FromResult(File.Exists(fullPath));
    }

    public async Task<bool> DeleteFileAsync(string relativePath)
    {
        var fullPath = ResolveAndValidatePath(relativePath);
        var fileLock = GetLock(fullPath);
        await fileLock.WaitAsync();
        try
        {
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);

                // Also delete backups
                for (var i = 1; i <= 3; i++)
                {
                    var bPath = $"{fullPath}.backup{i}";
                    if (File.Exists(bPath))
                    {
                        File.Delete(bPath);
                    }
                }
                return true;
            }
            return false;
        }
        finally
        {
            fileLock.Release();
        }
    }

    public Task<bool> DeleteDirectoryAsync(string relativePath)
    {
        var fullPath = ResolveAndValidatePath(relativePath);
        if (Directory.Exists(fullPath))
        {
            Directory.Delete(fullPath, recursive: true);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public async Task SaveBinaryFileAsync(string relativePath, Stream stream, CancellationToken cancellationToken = default)
    {
        var fullPath = ResolveAndValidatePath(relativePath);
        var dir = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }

        var fileLock = GetLock(fullPath);
        await fileLock.WaitAsync(cancellationToken);
        try
        {
            var tempPath = fullPath + "." + Guid.NewGuid().ToString("N") + ".tmp";
            try
            {
                await using (var target = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.None, 81920, FileOptions.WriteThrough))
                {
                    await stream.CopyToAsync(target, cancellationToken);
                    await target.FlushAsync(cancellationToken);
                }

                File.Move(tempPath, fullPath, overwrite: true);
            }
            catch
            {
                if (File.Exists(tempPath))
                {
                    try { File.Delete(tempPath); } catch { /* ignore */ }
                }
                throw;
            }
        }
        finally
        {
            fileLock.Release();
        }
    }

    public Task<(Stream Stream, string ContentType)?> ReadBinaryFileAsync(string relativePath)
    {
        var fullPath = ResolveAndValidatePath(relativePath);
        if (!File.Exists(fullPath))
        {
            return Task.FromResult<(Stream Stream, string ContentType)?>(null);
        }

        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".txt" => "text/plain; charset=utf-8",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<(Stream Stream, string ContentType)?>((stream, contentType));
    }

    private string ResolveAndValidatePath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            throw new ArgumentException("Path cannot be empty.", nameof(relativePath));
        }

        if (Path.IsPathRooted(relativePath))
        {
            throw new SecurityException("Absolute paths are not permitted in storage operations.");
        }

        // Normalize separators
        var normalized = relativePath.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);
        var combined = Path.Combine(_storageRoot, normalized);
        var fullPath = Path.GetFullPath(combined);

        ValidateSecurePath(fullPath);
        return fullPath;
    }

    private void ValidateSecurePath(string fullPath)
    {
        if (!fullPath.StartsWith(_storageRoot, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Potential path traversal attempt blocked: {Path}", fullPath);
            throw new SecurityException("Access outside the designated storage root is strictly prohibited.");
        }
    }

    private static string SanitizeIdentifier(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier))
        {
            throw new ArgumentException("Identifier cannot be empty.", nameof(identifier));
        }

        // Allow alphanumeric, dashes and underscores
        var safeChars = identifier.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_').ToArray();
        var safe = new string(safeChars);
        if (string.IsNullOrWhiteSpace(safe))
        {
            throw new ArgumentException("Identifier contains no safe characters.", nameof(identifier));
        }
        return safe;
    }

    private static void RotateBackups(string fullPath, int maxBackups)
    {
        try
        {
            for (var i = maxBackups - 1; i >= 1; i--)
            {
                var src = $"{fullPath}.backup{i}";
                var dest = $"{fullPath}.backup{i + 1}";
                if (File.Exists(src))
                {
                    File.Move(src, dest, overwrite: true);
                }
            }

            var firstBackup = $"{fullPath}.backup1";
            File.Copy(fullPath, firstBackup, overwrite: true);
        }
        catch
        {
            // Non-critical if backup rotation fails
        }
    }

    private static SemaphoreSlim GetLock(string fullPath)
    {
        return FileLocks.GetOrAdd(fullPath, _ => new SemaphoreSlim(1, 1));
    }
}
