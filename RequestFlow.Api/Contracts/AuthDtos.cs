using RequestFlow.Api.Models;

namespace RequestFlow.Api.Contracts;

public class RegisterRequest
{
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = RoleNames.Employee;
}

public class LoginRequest
{
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public string UserName { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public IList<string> Roles { get; set; } = [];
}
public class CreateRequestRequest
{
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class ReviewRequestRequest
{
    public ReviewDecision Decision { get; set; }
}

public class RequestListItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CreatedByUserId { get; set; } = string.Empty;
    public string AssignedRole { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
