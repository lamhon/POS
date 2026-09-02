using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

/// <summary>
/// TaskDatabase is the data source container (Notion-like Database) that owns Tasks and Views.
/// All Views (List, Board, Calendar...) read from the same TaskDatabase — no data duplication.
/// </summary>
public class TaskDatabase : AuditableEntity, ISoftDelete
{
    public Guid UserId { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid? ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Workspace Workspace { get; set; } = null!;
    public Project? Project { get; set; }
    public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
}
