using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using RequestFlow.Api.Contracts;
using RequestFlow.Api.Models;

namespace RequestFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        var role = request.Role.Trim();
        var validRoles = new[] { RoleNames.Employee, RoleNames.Manager, RoleNames.Finance };
        if (!validRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest("Role must be Employee, Manager, or Finance.");
        }

        if (await _userManager.FindByEmailAsync(request.Email) is not null)
        {
            return Conflict("A user with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(x => x.Description));
        }

        await _userManager.AddToRoleAsync(user, role);

        var token = GenerateToken(user, await _userManager.GetRolesAsync(user));
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            Roles = (await _userManager.GetRolesAsync(user)).ToList()
        });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateToken(user, roles);
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            Roles = roles.ToList()
        });
    }

    private string GenerateToken(ApplicationUser user, IEnumerable<string> roles)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "ThisIsAReallyStrongKeyForJwtSigning123!";
        var issuer = _configuration["Jwt:Issuer"] ?? "RequestFlow.Api";
        var audience = _configuration["Jwt:Audience"] ?? "RequestFlow.Client";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Email ?? string.Empty),
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
