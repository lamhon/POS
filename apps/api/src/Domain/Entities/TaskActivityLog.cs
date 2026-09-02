using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>
/// TaskActivityLog records immutable audit events for a Task (status changes, priority changes, assignments, etc.).
/// Used for history, transparency, and AI context.
/// </summary>
public class TaskActivityLog : Entity<Guid>
{
    public TaskActivityLog()
    {
        Id = Guid.NewGuid();
    }

    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }

    /// <summary>
    /// Action type, e.g.: Created, StatusChanged, PriorityChanged, Assigned, DueDateChanged, Completed, Archived, Deleted.
    /// </summary>
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    // Navigation
    public TaskEntity Task { get; set; } = null!;
    public User User { get; set; } = null!;
}
