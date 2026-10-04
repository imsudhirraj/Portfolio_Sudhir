namespace PortfolioAI.Api.Core.Interfaces;

public interface IPublicSlugRepository
{
    Task<string?> GetUserIdBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<string?> GetSlugByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<bool> IsSlugAvailableAsync(string slug, string currentUserId, CancellationToken cancellationToken = default);
    Task<bool> RegisterSlugAsync(string slug, string userId, CancellationToken cancellationToken = default);
    Task<bool> ReleaseSlugAsync(string slug, string userId, CancellationToken cancellationToken = default);
}
