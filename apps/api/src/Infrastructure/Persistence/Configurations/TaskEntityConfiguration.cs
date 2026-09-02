using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Infrastructure.Persistence.Configurations;

public class TaskEntityConfiguration : IEntityTypeConfiguration<TaskEntity>
{
    public void Configure(EntityTypeBuilder<TaskEntity> builder)
    {
        builder.ToTable("tasks");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(10000);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Priority).HasMaxLength(50);

        // Store Tags as a text array in PostgreSQL
        builder.Property(x => x.Tags)
            .HasColumnType("text[]");

        // Creator → User (Cascade delete: if user deleted, all their tasks go too)
        builder.HasOne(x => x.Creator)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Assignee → User (Restrict: cannot delete user while assigned to tasks)
        builder.HasOne(x => x.Assignee)
            .WithMany()
            .HasForeignKey(x => x.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Workspace)
            .WithMany()
            .HasForeignKey(x => x.WorkspaceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(x => x.ProjectId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Database)
            .WithMany(d => d.Tasks)
            .HasForeignKey(x => x.DatabaseId)
            .OnDelete(DeleteBehavior.SetNull);

        // Self-referencing: Parent Task → Subtasks
        builder.HasOne(x => x.ParentTask)
            .WithMany(t => t.Subtasks)
            .HasForeignKey(x => x.ParentTaskId)
            .OnDelete(DeleteBehavior.Restrict);   // Restrict to avoid accidental cascade

        // Cascade delete activity logs when task is hard-deleted

        builder.HasMany(x => x.ActivityLogs)
            .WithOne(a => a.Task)
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // Composite indexes for common query patterns
        builder.HasIndex(x => new { x.UserId, x.IsDeleted });
        builder.HasIndex(x => new { x.WorkspaceId, x.IsDeleted });
        builder.HasIndex(x => new { x.ProjectId, x.IsDeleted });
        builder.HasIndex(x => new { x.ParentTaskId, x.IsDeleted });
        builder.HasIndex(x => new { x.Status, x.DueDate });
    }
}
