using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class Permission : Entity<Guid>
{
    public string Name { get; set; } = string.Empty; // format: <module>.<resource>.<action> e.g. "task.task.create"
    public string Description { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty; // e.g. "task"
    public string Resource { get; set; } = string.Empty; // e.g. "task"
    public string Action { get; set; } = string.Empty; // e.g. "create"

    // Navigation properties
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

