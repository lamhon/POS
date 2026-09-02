using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class ResourcePermission : AuditableEntity
{
    public Guid WorkspaceId { get; set; }
    
    // Resource levels: "Workspace", "Folder", "Project", "Database", "Task"
    public string ResourceType { get; set; } = string.Empty; 
    public Guid? ResourceId { get; set; } // Points to the specific Project, Database, or Task ID
    
    // Target user or workspace role
    public Guid? UserId { get; set; }
    public string? Role { get; set; } // Target role (e.g. "Member", "Viewer")
    
    // Access level: "None", "View", "Create", "Edit", "Delete", "Share", "Manage"
    public string AccessLevel { get; set; } = string.Empty; 
    
    // Navigations
    public Workspace Workspace { get; set; } = null!;
    public User? User { get; set; }
}
