using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PersonalOs.Domain.Entities;
using PersonalOs.Infrastructure.Persistence.Context;
using System.Linq;

namespace PersonalOs.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PersonalOsDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

        // Apply migrations automatically if relational, else EnsureCreated (e.g. for InMemory)
        if (context.Database.IsRelational())
        {
            await context.Database.MigrateAsync();
        }
        else
        {
            await context.Database.EnsureCreatedAsync();
        }

        // Backfill workspace members for existing workspaces
        var existingWorkspaces = await context.Workspaces.ToListAsync();
        foreach (var ws in existingWorkspaces)
        {
            var hasOwner = await context.WorkspaceMembers.AnyAsync(m => m.WorkspaceId == ws.Id && m.UserId == ws.UserId);
            if (!hasOwner)
            {
                context.WorkspaceMembers.Add(new WorkspaceMember
                {
                    WorkspaceId = ws.Id,
                    UserId = ws.UserId,
                    Role = "Owner"
                });
            }
        }
        await context.SaveChangesAsync();

        // Seed default system roles if they don't exist
        var systemRoles = new[]
        {
            new { Name = "Super Admin", Description = "Super Administrator with full ownership and control", Icon = "shield", Color = "#8b5cf6" },
            new { Name = "Admin",       Description = "Administrator with management permissions",           Icon = "shield-check", Color = "#6366f1" },
            new { Name = "Moderator",   Description = "Moderator with limited management permissions",      Icon = "users",        Color = "#0ea5e9" },
            new { Name = "User",        Description = "Regular user with basic access",                     Icon = "user",         Color = "#6b7280" }
        };

        foreach (var r in systemRoles)
        {
            var roleExists = await context.Roles.AnyAsync(role => role.Name == r.Name);
            if (!roleExists)
            {
                context.Roles.Add(new Role
                {
                    Name = r.Name,
                    NormalizedName = r.Name.ToUpperInvariant(),
                    Description = r.Description,
                    Icon = r.Icon,
                    Color = r.Color,
                    Type = RoleType.System,
                    Status = RoleStatus.Active
                });
            }
            else
            {
                // Backfill existing roles as System type
                var existing = await context.Roles.FirstOrDefaultAsync(role => role.Name == r.Name);
                if (existing != null && existing.Type != RoleType.System)
                {
                    existing.Type = RoleType.System;
                    existing.Icon = r.Icon;
                    existing.Color = r.Color;
                }
            }
        }
        await context.SaveChangesAsync();

        // Seed comprehensive permissions using module.resource.action format
        var allPermissions = new (string name, string module, string resource, string action, string description)[]
        {
            // Admin module
            ("admin.user.view",      "admin", "user",      "view",    "View users"),
            ("admin.user.create",    "admin", "user",      "create",  "Create users"),
            ("admin.user.update",    "admin", "user",      "update",  "Update users"),
            ("admin.user.delete",    "admin", "user",      "delete",  "Delete users"),
            ("admin.user.export",    "admin", "user",      "export",  "Export users"),
            ("admin.role.view",      "admin", "role",      "view",    "View roles"),
            ("admin.role.create",    "admin", "role",      "create",  "Create roles"),
            ("admin.role.update",    "admin", "role",      "update",  "Update roles"),
            ("admin.role.delete",    "admin", "role",      "delete",  "Delete roles"),
            ("admin.role.assign",    "admin", "role",      "assign",  "Assign roles to users"),
            // Task module
            ("task.workspace.view",  "task",  "workspace", "view",    "View workspaces"),
            ("task.workspace.create","task",  "workspace", "create",  "Create workspaces"),
            ("task.workspace.update","task",  "workspace", "update",  "Update workspaces"),
            ("task.workspace.delete","task",  "workspace", "delete",  "Delete workspaces"),
            ("task.task.view",       "task",  "task",      "view",    "View tasks"),
            ("task.task.create",     "task",  "task",      "create",  "Create tasks"),
            ("task.task.update",     "task",  "task",      "update",  "Update tasks"),
            ("task.task.delete",     "task",  "task",      "delete",  "Delete tasks"),
            ("task.task.assign",     "task",  "task",      "assign",  "Assign tasks"),
            ("task.task.complete",   "task",  "task",      "complete","Complete tasks"),
            // Finance module
            ("finance.account.view",     "finance","account",    "view",  "View accounts"),
            ("finance.account.create",   "finance","account",    "create","Create accounts"),
            ("finance.account.update",   "finance","account",    "update","Update accounts"),
            ("finance.account.delete",   "finance","account",    "delete","Delete accounts"),
            ("finance.transaction.view", "finance","transaction","view",  "View transactions"),
            ("finance.transaction.create","finance","transaction","create","Create transactions"),
            ("finance.transaction.update","finance","transaction","update","Update transactions"),
            ("finance.transaction.delete","finance","transaction","delete","Delete transactions"),
            ("finance.transaction.export","finance","transaction","export","Export transactions"),
        };

        foreach (var (name, module, resource, action, description) in allPermissions)
        {
            var permExists = await context.Permissions.AnyAsync(p => p.Name == name);
            if (!permExists)
            {
                context.Permissions.Add(new Permission
                {
                    Name = name,
                    Module = module,
                    Resource = resource,
                    Action = action,
                    Description = description
                });
            }
            else
            {
                // Backfill existing permissions with Resource and Action fields
                var existing = await context.Permissions.FirstOrDefaultAsync(p => p.Name == name);
                if (existing != null && string.IsNullOrEmpty(existing.Resource))
                {
                    existing.Resource = resource;
                    existing.Action = action;
                }
            }
        }
        await context.SaveChangesAsync();



        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@personal.os");
        if (existingAdmin != null)
        {
            if (string.IsNullOrEmpty(existingAdmin.NormalizedEmail))
            {
                existingAdmin.NormalizedEmail = "ADMIN@PERSONAL.OS";
                await context.SaveChangesAsync();
            }
            return;
        }

        var adminRole = new Role
        {
            Name = "Admin",
            Description = "Administrator Role with all permissions"
        };
        context.Roles.Add(adminRole);

        // Add all required permissions
        var permissions = new[]
        {
            "users.view", "users.create", "users.update", "users.delete",
            "roles.view", "roles.create", "roles.update", "roles.delete"
        };

        foreach (var p in permissions)
        {
            var permission = new Permission
            {
                Name = p,
                Description = $"Permission to {p}"
            };
            context.Permissions.Add(permission);

            context.RolePermissions.Add(new RolePermission
            {
                RoleId = adminRole.Id,
                PermissionId = permission.Id
            });
        }

        var adminUser = new User
        {
            Email = "admin@personal.os",
            NormalizedEmail = "ADMIN@PERSONAL.OS",
            DisplayName = "System Admin",
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin@1234");
        context.Users.Add(adminUser);

        context.UserRoles.Add(new UserRole
        {
            UserId = adminUser.Id,
            RoleId = adminRole.Id
        });

        await context.SaveChangesAsync();
    }
}
