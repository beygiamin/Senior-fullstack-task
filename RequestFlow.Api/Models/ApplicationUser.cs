using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Identity;

namespace RequestFlow.Api.Models;

public class ApplicationUser : IdentityUser
{
    [AllowNull]
    public override string UserName { get; set; } = string.Empty;
}
