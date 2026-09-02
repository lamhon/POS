using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Admin.DTOs;
using PersonalOs.Application.Admin.Roles;
using PersonalOs.Domain.Entities;
using PersonalOs.Infrastructure.Persistence.Context;

namespace PersonalOs.Tests.Unit.Application;

public class RoleHandlersTests : IDisposable
{
    private readonly PersonalOsDbContext _context;

    public RoleHandlersTests()
    {
        var options = new DbContextOptionsBuilder<PersonalOsDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new PersonalOsDbContext(options);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task CreateRoleCommandHandler_Should_CreateCustomRole_And_AssignPermissions()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var handler = new CreateRoleCommandHandler(_context);
        
        var perm = new Permission { Name = "task.create", Module = "task", Resource = "task", Action = "create", Description = "Create task" };
        _context.Permissions.Add(perm);
        await _context.SaveChangesAsync();
        var permId = perm.Id;

        var command = new CreateRoleCommand(
            adminId,
            "Manager",
            "Manager role",
            "icon-test",
            "#ff0000",
            new List<RolePermissionInputDto>
            {
                new RolePermissionInputDto(permId, "Department")
            }
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Manager");
        result.Type.Should().Be(RoleType.Custom.ToString());
        result.Status.Should().Be(RoleStatus.Active.ToString());
        
        var dbRole = await _context.Roles.Include(r => r.RolePermissions).FirstAsync(r => r.Id == result.Id);
        dbRole.Name.Should().Be("Manager");
        dbRole.RolePermissions.Should().HaveCount(1);
        dbRole.RolePermissions.First().Scope.Should().Be(PermissionScope.Department);
        
        var audit = await _context.AuditLogs.FirstOrDefaultAsync(a => a.TargetId == result.Id.ToString());
        audit.Should().NotBeNull();
        audit!.Action.Should().Be("ROLE_CREATED");
    }

    [Fact]
    public async Task CreateRoleCommandHandler_Should_Throw_When_NameAlreadyExists()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var handler = new CreateRoleCommandHandler(_context);
        
        _context.Roles.Add(new Role { Name = "Manager", NormalizedName = "MANAGER", CreatedBy = adminId.ToString() });
        await _context.SaveChangesAsync();

        var command = new CreateRoleCommand(adminId, "Manager", null, null, null, null);

        // Act & Assert
        var action = async () => await handler.Handle(command, CancellationToken.None);
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Role 'Manager' already exists.");
    }

    [Fact]
    public async Task UpdateRoleCommandHandler_Should_UpdateCustomRole()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var handler = new UpdateRoleCommandHandler(_context);
        var role = new Role { Name = "Manager", NormalizedName = "MANAGER", CreatedBy = adminId.ToString(), Type = RoleType.Custom };
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        var roleId = role.Id;

        var command = new UpdateRoleCommand(adminId, roleId, "Director", "Director role", "new-icon", "#00ff00", null);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Director");
        
        var dbRole = await _context.Roles.FindAsync(roleId);
        dbRole!.Name.Should().Be("Director");
        dbRole.NormalizedName.Should().Be("DIRECTOR");
    }

    [Fact]
    public async Task UpdateRoleCommandHandler_Should_Throw_When_RenamingSystemRole()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var handler = new UpdateRoleCommandHandler(_context);
        var role = new Role { Name = "Admin", NormalizedName = "ADMIN", CreatedBy = adminId.ToString(), Type = RoleType.System };
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        var roleId = role.Id;

        var command = new UpdateRoleCommand(adminId, roleId, "SuperAdmin", null, null, null, null);

        // Act & Assert
        var action = async () => await handler.Handle(command, CancellationToken.None);
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Cannot rename a system role.");
    }

    [Fact]
    public async Task DeleteRoleCommandHandler_Should_DeleteCustomRole()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var handler = new DeleteRoleCommandHandler(_context);
        var role = new Role { Name = "Manager", NormalizedName = "MANAGER", CreatedBy = adminId.ToString(), Type = RoleType.Custom };
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        var roleId = role.Id;

        var command = new DeleteRoleCommand(adminId, roleId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        var dbRole = await _context.Roles.FindAsync(roleId);
        dbRole.Should().BeNull();
    }

    [Fact]
    public async Task DeleteRoleCommandHandler_Should_Throw_When_DeletingSystemRole()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var handler = new DeleteRoleCommandHandler(_context);
        var role = new Role { Name = "Admin", NormalizedName = "ADMIN", CreatedBy = adminId.ToString(), Type = RoleType.System };
        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        var roleId = role.Id;

        var command = new DeleteRoleCommand(adminId, roleId);

        // Act & Assert
        var action = async () => await handler.Handle(command, CancellationToken.None);
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Cannot delete a system role.");
    }

    [Fact]
    public async Task DeleteRoleCommandHandler_Should_Throw_When_RoleIsAssignedToUsers()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var handler = new DeleteRoleCommandHandler(_context);
        
        var role = new Role { Name = "Manager", NormalizedName = "MANAGER", CreatedBy = adminId.ToString(), Type = RoleType.Custom };
        _context.Roles.Add(role);
        var roleId = role.Id;
        _context.UserRoles.Add(new UserRole { RoleId = roleId, UserId = userId });
        await _context.SaveChangesAsync();

        var command = new DeleteRoleCommand(adminId, roleId);

        // Act & Assert
        var action = async () => await handler.Handle(command, CancellationToken.None);
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Cannot delete role 'Manager' because it is assigned to 1 user(s). Remove all assignments first.");
    }
}
