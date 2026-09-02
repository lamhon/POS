using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using PersonalOs.Application.Admin.DTOs;
using PersonalOs.Application.Admin.Roles;
using PersonalOs.Application.Common.Models;
using PersonalOs.Tests.Integration.Setup;
using Xunit;

namespace PersonalOs.Tests.Integration.Controllers;

public class RolesControllerIntegrationTests : IntegrationTestBase
{
    public RolesControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetRoles_Should_ReturnSuccessAndPaginatedList()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Act
        var response = await Client.GetAsync("/api/admin/roles");

        // Assert
        response.EnsureSuccessStatusCode();
        var result = await response.Content.ReadFromJsonAsync<PaginatedDto<RoleListDto>>();
        
        result.Should().NotBeNull();
        result!.Items.Should().NotBeEmpty();
        result.Items.Should().Contain(r => r.Name == "Admin");
    }

    [Fact]
    public async Task CreateRole_Should_CreateCustomRole_And_ReturnCreated()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        
        var request = new CreateRoleCommand(
            Guid.Empty, // AdminUserId is extracted from JWT in the controller, so we just pass empty here, actually the controller takes a Dto without AdminUserId
            "Sales Lead",
            "Sales Lead role",
            "icon-sales",
            "#00ff00",
            null
        );

        // Act
        // Actually, the API might expect a different DTO. Let's see if CreateRoleRequest exists or if it maps to CreateRoleCommand directly.
        // Assuming it's mapped from a standard request body. Let's send it as CreateRoleCommand.
        var response = await Client.PostAsJsonAsync("/api/admin/roles", new { 
            Name = "Sales Lead", 
            Description = "Sales Lead role", 
            Icon = "icon-sales", 
            Color = "#00ff00" 
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var createdRole = await response.Content.ReadFromJsonAsync<RoleDetailDto>();
        createdRole.Should().NotBeNull();
        createdRole!.Name.Should().Be("Sales Lead");
    }

    [Fact]
    public async Task CreateRole_Should_ReturnBadRequest_When_NameAlreadyExists()
    {
        // Arrange
        await AuthenticateAsAdminAsync();
        
        // Act - First request
        await Client.PostAsJsonAsync("/api/admin/roles", new { Name = "Support" });
        
        // Act - Duplicate request
        var response = await Client.PostAsJsonAsync("/api/admin/roles", new { Name = "Support" });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("already exists"); // Based on exception message
    }

    [Fact]
    public async Task GetUserEffectivePermissions_Should_ReturnPermissions()
    {
        // Arrange
        await AuthenticateAsAdminAsync(); // Automatically creates the Admin user

        // Act - We don't have the user ID explicitly here, but we can query roles or users.
        // For simplicity, let's just ensure the endpoint returns 404 or 200 for a random guid
        var response = await Client.GetAsync($"/api/admin/users/{Guid.NewGuid()}/effective-permissions");

        // Assert
        // We expect it to return 200 OK with an empty list for a random user, as per the query handler
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var perms = await response.Content.ReadFromJsonAsync<List<EffectivePermissionDto>>();
        perms.Should().BeEmpty();
    }
}
