using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>Warning message sent to a user by an admin.</summary>
public class UserWarning : AuditableEntity, ISoftDelete
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Type { get; set; } = string.Empty; // Spam, InappropriateContent, Abuse, Other
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? CreatedByName { get; set; }

    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
