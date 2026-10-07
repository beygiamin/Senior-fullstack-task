using Microsoft.Extensions.Options;
using RequestFlow.Api.Models;
using RequestFlow.Api.Options;

namespace RequestFlow.Api.Services;

public class RequestRoutingService
{
    private readonly RoutingOptions _options;

    public RequestRoutingService(IOptions<RoutingOptions> options)
    {
        _options = options.Value;
    }

    public string DetermineAssignedRole(decimal amount)
    {
        return amount <= _options.ManagerThreshold ? RoleNames.Manager : RoleNames.Finance;
    }

    public decimal Threshold => _options.ManagerThreshold;
}
