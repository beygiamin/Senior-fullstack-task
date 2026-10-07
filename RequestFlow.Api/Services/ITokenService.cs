using RequestFlow.Api.Models;

namespace RequestFlow.Api.Services;

public interface ITokenService
{
    string CreateAccessToken(ApplicationUser user, IEnumerable<string> roles);
}
