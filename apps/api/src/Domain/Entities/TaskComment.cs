using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class TaskComment : AuditableEntity, ISoftDelete
{
    public Guid TaskId { get; set; }
    public TaskEntity Task { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Content { get; set; } = string.Empty;
    public bool IsImportant { get; set; } = false;

    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    public Guid? ParentCommentId { get; set; }
    public TaskComment? ParentComment { get; set; }
    public ICollection<TaskComment> Replies { get; set; } = new List<TaskComment>();

    public ICollection<TaskCommentReaction> Reactions { get; set; } = new List<TaskCommentReaction>();
}
