using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class ChecklistItem : AuditableEntity
{
    public Guid TaskId { get; set; }
    public TaskEntity Task { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;

    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
}
