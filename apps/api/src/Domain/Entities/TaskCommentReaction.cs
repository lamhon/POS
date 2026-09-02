using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class TaskCommentReaction : AuditableEntity
{
    public Guid CommentId { get; set; }
    public TaskComment Comment { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Emoji { get; set; } = string.Empty;
}
