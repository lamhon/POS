using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>
/// Project groups tasks that share a common goal within a Workspace.
/// </summary>
public class Project : AuditableEntity, ISoftDelete
{
    public Guid UserId { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public string Status { get; set; } = "Active";  // Active, Completed, Archived, Cancelled
    public string? Priority { get; set; }            // Urgent, High, Medium, Low, None
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public bool IsArchived { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Workspace Workspace { get; set; } = null!;
    public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
}
