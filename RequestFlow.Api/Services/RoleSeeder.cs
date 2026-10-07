using Microsoft.AspNetCore.Identity;
using RequestFlow.Api.Models;

namespace RequestFlow.Api.Services;

public static class RoleSeeder
{
    public static async Task SeedRolesAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        foreach (var roleName in new[] { RoleNames.Employee, RoleNames.Manager, RoleNames.Finance })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }
}
