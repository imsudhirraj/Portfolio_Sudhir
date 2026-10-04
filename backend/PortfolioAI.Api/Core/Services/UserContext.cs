using System.Security.Claims;
using PortfolioAI.Api.Core.Interfaces;

namespace PortfolioAI.Api.Core.Services;

public class UserContext(IHttpContextAccessor httpContextAccessor) : IUserContext
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public string UserId
    {
        get
        {
            var id = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User?.FindFirst("sub")?.Value
                     ?? User?.FindFirst("userId")?.Value;

            if (string.IsNullOrWhiteSpace(id))
            {
                throw new UnauthorizedAccessException("Authenticated user identity claim was not found.");
            }

            return id;
        }
    }

    public string? Email =>
        User?.FindFirst(ClaimTypes.Email)?.Value ?? User?.FindFirst("email")?.Value;

    public string? Name =>
        User?.FindFirst(ClaimTypes.Name)?.Value ?? User?.FindFirst("name")?.Value;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
}
