using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>Violation report filed against a user.</summary>
public class UserReport : AuditableEntity, ISoftDelete
{
    public Guid ReporterUserId { get; set; }
    public User Reporter { get; set; } = null!;

    public Guid TargetUserId { get; set; }
    public User TargetUser { get; set; } = null!;

    public string ReasonCode { get; set; } = string.Empty; // SPAM, ABUSE, INAPPROPRIATE, OTHER
    public string? Description { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Resolved, Dismissed
    public string? Resolution { get; set; }
    public Guid? ResolvedBy { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }

    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
