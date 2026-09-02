using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>
/// Supported data access scopes per permission in a role.
/// </summary>
public enum PermissionScope
{
    All,
    Workspace,
    Organization,
    Department,
    Team,
    Assigned,
    Own,
    Custom
}

public class RolePermission : Entity<Guid>
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public Guid PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;

    /// <summary>
    /// Data scope for this specific permission within the role.
    /// </summary>
    public PermissionScope Scope { get; set; } = PermissionScope.All;
}

