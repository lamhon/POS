using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public enum RoleType
{
    System,
    Custom
}

public enum RoleStatus
{
    Active,
    Archived
}

public class Role : AuditableEntity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string NormalizedName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public RoleType Type { get; set; } = RoleType.Custom;
    public RoleStatus Status { get; set; } = RoleStatus.Active;

    // Navigation properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

