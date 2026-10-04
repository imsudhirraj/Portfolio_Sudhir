using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace PortfolioAI.Api.Core.Services;

public record GoogleUserInfo(string Sub, string Email, string Name, string? Picture);

public class JwtTokenService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<JwtTokenService> logger)
{
    public string GenerateToken(string userId, string email, string name, string? picture = null)
    {
        var secret = configuration["Jwt:SecretKey"] ?? "PortfolioAI_Super_Secret_Key_For_Development_Min_32_Characters_Long!";
        var issuer = configuration["Jwt:Issuer"] ?? "PortfolioAI.Api";
        var audience = configuration["Jwt:Audience"] ?? "PortfolioAI.Client";
        var expiryHours = int.TryParse(configuration["Jwt:ExpiryHours"], out var hours) ? hours : 24;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(JwtRegisteredClaimNames.Sub, userId),
            new(ClaimTypes.Email, email),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Name, name),
            new("userId", userId)
        };

        if (!string.IsNullOrWhiteSpace(picture))
        {
            claims.Add(new Claim("picture", picture));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<GoogleUserInfo?> VerifyGoogleTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var client = httpClientFactory.CreateClient();
            var response = await client.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}", cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Google tokeninfo returned status {Status}", response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // Optional check against Google Client ID if configured
            var expectedClientId = configuration["Authentication:Google:ClientId"];
            if (!string.IsNullOrWhiteSpace(expectedClientId) && !expectedClientId.StartsWith("YOUR_"))
            {
                if (root.TryGetProperty("aud", out var aud) && aud.GetString() != expectedClientId)
                {
                    logger.LogWarning("Google Token audience does not match configured ClientId");
                    return null;
                }
            }

            var sub = root.GetProperty("sub").GetString();
            var email = root.GetProperty("email").GetString();
            var name = root.TryGetProperty("name", out var n) ? n.GetString() : email;
            var picture = root.TryGetProperty("picture", out var p) ? p.GetString() : null;

            if (string.IsNullOrWhiteSpace(sub) || string.IsNullOrWhiteSpace(email))
            {
                return null;
            }

            return new GoogleUserInfo(sub, email, name ?? email, picture);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error validating Google ID Token");
            return null;
        }
    }
}
