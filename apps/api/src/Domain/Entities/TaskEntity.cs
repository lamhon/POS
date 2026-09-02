using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>
/// TaskEntity is the central data entity (named TaskEntity to avoid conflict with System.Threading.Tasks.Task).
/// Subtasks are represented as Tasks with a ParentTaskId — no separate Subtask model needed.
/// </summary>
public class TaskEntity : AuditableEntity, ISoftDelete
{
    public Guid UserId { get; set; }                // Creator / Owner
    public Guid WorkspaceId { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? DatabaseId { get; set; }
    public Guid? ParentTaskId { get; set; }         // null = root task; non-null = subtask

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Workflow
    public string Status { get; set; } = "Todo";   // Configurable: Todo, In Progress, Done, etc.
    public string? Priority { get; set; }           // Urgent, High, Medium, Low, None

    // Assignee (FK to User; nullable because task may be unassigned)
    public Guid? AssigneeId { get; set; }

    // Tags stored as JSON array in PostgreSQL (simple string list)
    public List<string> Tags { get; set; } = new();

    // Schedule
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public double? Estimate { get; set; }            // Estimated hours

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    // Navigation properties
    public User Creator { get; set; } = null!;
    public User? Assignee { get; set; }
    public ICollection<TaskAssignee> Assignees { get; set; } = new List<TaskAssignee>();
    public ICollection<ChecklistItem> ChecklistItems { get; set; } = new List<ChecklistItem>();
    public Workspace Workspace { get; set; } = null!;
    public Project? Project { get; set; }
    public TaskDatabase? Database { get; set; }
    public TaskEntity? ParentTask { get; set; }
    public ICollection<TaskEntity> Subtasks { get; set; } = new List<TaskEntity>();
    public ICollection<TaskActivityLog> ActivityLogs { get; set; } = new List<TaskActivityLog>();
    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}
