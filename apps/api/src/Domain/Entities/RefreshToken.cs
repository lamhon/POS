using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class RefreshToken : Entity<Guid>
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    
    // For refresh rotation tracking
    public Guid? ReplacedByTokenId { get; set; }

    // Session metadata (Option A)
    public string? Device { get; set; }
    public string? Browser { get; set; }
    public string? Os { get; set; }
    public string? IpAddress { get; set; }
    public DateTimeOffset LastActiveAt { get; set; } = DateTimeOffset.UtcNow;
    
    public bool IsRevoked => RevokedAt != null;
    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;
}
