using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>Administrative action audit log.</summary>
public class AuditLog : Entity<Guid>
{
    public Guid AdminUserId { get; set; }
    public User AdminUser { get; set; } = null!;

    public string AdminRole { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // USER_LOCKED, USER_ROLE_CHANGED, etc.
    public string TargetType { get; set; } = "User";
    public string TargetId { get; set; } = string.Empty;
    public string? BeforeData { get; set; }  // JSON snapshot
    public string? AfterData { get; set; }   // JSON snapshot
    public string? Reason { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
