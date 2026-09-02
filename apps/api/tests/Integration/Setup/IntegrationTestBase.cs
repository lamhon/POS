using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Domain.Entities;
using PersonalOs.Infrastructure.Persistence.Context;
using Xunit;

namespace PersonalOs.Tests.Integration.Setup;

public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory Factory;

    protected IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected async Task<string> AuthenticateAsAdminAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PersonalOsDbContext>();
        
        var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
        if (adminRole == null)
        {
            adminRole = new Role { Name = "Admin", NormalizedName = "ADMIN", Type = RoleType.System };
            context.Roles.Add(adminRole);
            await context.SaveChangesAsync();
        }

        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@personalos.local");
        if (adminUser == null)
        {
            adminUser = new User 
            { 
                Email = "admin@personalos.local", 
                DisplayName = "Admin", 
                FullName = "Admin User",
                PasswordHash = "hash"
            };
            context.Users.Add(adminUser);
            context.UserRoles.Add(new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id });
            await context.SaveChangesAsync();
        }

        var jwtGenerator = scope.ServiceProvider.GetRequiredService<IJwtTokenGenerator>();
        var roles = new List<string> { "Admin" };
        var permissions = new List<string> { "admin" };
        var token = jwtGenerator.GenerateAccessToken(adminUser, roles, permissions);

        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return token;
    }
}
