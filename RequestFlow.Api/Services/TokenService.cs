using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using RequestFlow.Api.Models;

namespace RequestFlow.Api.Services;

public class TokenService(IConfiguration configuration) : ITokenService
{
    public string CreateAccessToken(ApplicationUser user, IEnumerable<string> roles)
    {
        var jwtKey = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Missing required configuration 'Jwt:Key'.");
        var issuer = configuration["Jwt:Issuer"] ?? "RequestFlow.Api";
        var audience = configuration["Jwt:Audience"] ?? "RequestFlow.Client";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(6),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
