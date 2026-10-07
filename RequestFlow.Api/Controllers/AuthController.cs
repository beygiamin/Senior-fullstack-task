using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RequestFlow.Api.Contracts;
using RequestFlow.Api.Models;
using RequestFlow.Api.Services;

namespace RequestFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public AuthController(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Username and password are required.");
        }

        var role = request.Role.Trim();
        var validRoles = new[] { RoleNames.Employee, RoleNames.Manager, RoleNames.Finance };
        if (!validRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest("Role must be Employee, Manager, or Finance.");
        }

        if (await _userManager.FindByNameAsync(request.UserName) is not null)
        {
            return Conflict("A user with this username already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.UserName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors.Select(x => x.Description));
        }

        await _userManager.AddToRoleAsync(user, role);

        var token = _tokenService.CreateAccessToken(user, await _userManager.GetRolesAsync(user));
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            UserName = user.UserName,
            Roles = (await _userManager.GetRolesAsync(user)).ToList()
        });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Username and password are required.");
        }

        var user = await _userManager.FindByNameAsync(request.UserName);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateAccessToken(user, roles);
        return Ok(new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            UserName = user.UserName,
            Roles = roles.ToList()
        });
    }
}
