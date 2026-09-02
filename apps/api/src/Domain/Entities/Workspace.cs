using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>
/// Workspace is the top-level container for organizing projects and tasks.
/// </summary>
public class Workspace : AuditableEntity, ISoftDelete
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsPinned { get; set; }
    public bool IsArchived { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public string? ArchivedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    // Workspace Permissions (Defaults: Everyone, Admin, NoOne)
    public string CreatePagesPermission { get; set; } = "Everyone";
    public string CreateDatabasesPermission { get; set; } = "Everyone";
    public string CreateProjectsPermission { get; set; } = "Everyone";
    public string DeleteContentPermission { get; set; } = "Admin";
    public string InviteMembersPermission { get; set; } = "Admin";
    public string ManageSettingsPermission { get; set; } = "Admin";
    public string ExportWorkspacePermission { get; set; } = "Admin";

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<WorkspaceMember> Members { get; set; } = new List<WorkspaceMember>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<TaskDatabase> Databases { get; set; } = new List<TaskDatabase>();
    public ICollection<ResourcePermission> ResourcePermissions { get; set; } = new List<ResourcePermission>();
}
