using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RequestFlow.Api.Contracts;
using RequestFlow.Api.Controllers;
using RequestFlow.Api.Models;

namespace RequestFlow.Tests;

public class RequestsControllerAuthorizationTests
{
    [Fact]
    public void RequestsController_RequiresAnAuthenticatedUser()
    {
        var authorization = typeof(RequestsController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
            .Cast<AuthorizeAttribute>()
            .Single();

        Assert.Null(authorization.Roles);
    }

    [Fact]
    public void Create_RequiresEmployeeRole()
    {
        var authorization = typeof(RequestsController)
            .GetMethod(nameof(RequestsController.Create))!
            .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
            .Cast<AuthorizeAttribute>()
            .Single();

        Assert.Equal(RoleNames.Employee, authorization.Roles);
    }

    [Fact]
    public async Task Create_WhenUserIdClaimIsMissing_ReturnsUnauthorized()
    {
        var controller = new RequestsController(
            null!,
            null!,
            null!)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity())
                }
            }
        };

        var result = await controller.Create(new CreateRequestRequest
        {
            Title = "Test request",
            Amount = 100m,
            Description = "Test"
        });

        Assert.IsType<UnauthorizedResult>(result.Result);
    }
}
