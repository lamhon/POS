using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Infrastructure.Persistence.Context;

/// <summary>
/// Application database context.
/// Business entity configurations will be added via IEntityTypeConfiguration&lt;T&gt; in future modules.
/// </summary>
public sealed class PersonalOsDbContext : DbContext, IUnitOfWork, IApplicationDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserReport> UserReports => Set<UserReport>();
    public DbSet<UserWarning> UserWarnings => Set<UserWarning>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Transfer> Transfers => Set<Transfer>();

    // Task Management
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<ResourcePermission> ResourcePermissions => Set<ResourcePermission>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskDatabase> TaskDatabases => Set<TaskDatabase>();
    public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
    public DbSet<TaskActivityLog> TaskActivityLogs => Set<TaskActivityLog>();
    public DbSet<TaskAssignee> TaskAssignees => Set<TaskAssignee>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();
    public DbSet<TaskCommentReaction> TaskCommentReactions => Set<TaskCommentReaction>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();

    public PersonalOsDbContext(DbContextOptions<PersonalOsDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity type configurations discovered from this assembly.
        // Module-specific configurations are registered via IEntityTypeConfiguration<T>.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PersonalOsDbContext).Assembly);
    }
}
