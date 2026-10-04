namespace PortfolioAI.Api.Core.Interfaces;

public interface IUserContext
{
    string UserId { get; }
    string? Email { get; }
    string? Name { get; }
    bool IsAuthenticated { get; }
}
