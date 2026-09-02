using Microsoft.EntityFrameworkCore;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<UserReport> UserReports { get; }
    DbSet<UserWarning> UserWarnings { get; }
    DbSet<AuditLog> AuditLogs { get; }

    DbSet<Account> Accounts { get; }
    DbSet<Category> Categories { get; }
    DbSet<Transaction> Transactions { get; }
    DbSet<Transfer> Transfers { get; }

    // Task Management
    DbSet<Workspace> Workspaces { get; }
    DbSet<WorkspaceMember> WorkspaceMembers { get; }
    DbSet<ResourcePermission> ResourcePermissions { get; }
    DbSet<Project> Projects { get; }
    DbSet<TaskDatabase> TaskDatabases { get; }
    DbSet<TaskEntity> Tasks { get; }
    DbSet<TaskActivityLog> TaskActivityLogs { get; }
    DbSet<TaskAssignee> TaskAssignees { get; }
    DbSet<TaskComment> TaskComments { get; }
    DbSet<TaskCommentReaction> TaskCommentReactions { get; }
    DbSet<ChecklistItem> ChecklistItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
