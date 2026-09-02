using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class WorkspaceMember : AuditableEntity, ISoftDelete
{
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Role { get; set; } = "Viewer";

    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
