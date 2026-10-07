using Microsoft.Extensions.Options;
using RequestFlow.Api.Models;
using RequestFlow.Api.Options;
using RequestFlow.Api.Services;

namespace RequestFlow.Tests;

public class RequestRoutingServiceTests
{
    private readonly RequestRoutingService _service = new(
        Options.Create(new RoutingOptions { ManagerThreshold = 1_000_000m }));

    [Fact]
    public void DetermineAssignedRole_WhenAmountIsBelowThreshold_ReturnsManager()
    {
        var role = _service.DetermineAssignedRole(500_000m);

        Assert.Equal(RoleNames.Manager, role);
    }

    [Fact]
    public void DetermineAssignedRole_WhenAmountEqualsThreshold_ReturnsManager()
    {
        var role = _service.DetermineAssignedRole(1_000_000m);

        Assert.Equal(RoleNames.Manager, role);
    }

    [Fact]
    public void DetermineAssignedRole_WhenAmountExceedsThreshold_ReturnsFinance()
    {
        var role = _service.DetermineAssignedRole(1_000_001m);

        Assert.Equal(RoleNames.Finance, role);
    }
}
