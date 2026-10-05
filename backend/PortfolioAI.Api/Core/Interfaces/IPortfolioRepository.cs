using PortfolioAI.Api.Core.Models;

namespace PortfolioAI.Api.Core.Interfaces;

public interface IPortfolioRepository
{
    Task<Portfolio> GetOrCreatePortfolioAsync(string userId, CancellationToken cancellationToken = default);
    Task<Portfolio> GetOrCreatePortfolioAsync(string userId, string? userName, string? userEmail, CancellationToken cancellationToken = default);
    Task<Portfolio?> GetPortfolioAsync(string userId, CancellationToken cancellationToken = default);
    Task<Portfolio> SavePortfolioAsync(string userId, Portfolio portfolio, CancellationToken cancellationToken = default);
    Task<Portfolio> UpdateProfileAsync(string userId, Profile profile, CancellationToken cancellationToken = default);
    Task<Portfolio> UpdateSummaryAsync(string userId, Summary summary, CancellationToken cancellationToken = default);
    Task<Portfolio> UpdateThemeAsync(string userId, ThemeConfig theme, CancellationToken cancellationToken = default);
    Task<Portfolio> UpdateSectionsAsync(string userId, SectionsConfig sections, CancellationToken cancellationToken = default);
    Task<bool> DeletePortfolioAsync(string userId, CancellationToken cancellationToken = default);
}
