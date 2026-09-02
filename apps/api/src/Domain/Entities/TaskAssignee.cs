using PersonalOs.Domain.Common;

namespace PersonalOs.Domain.Entities;

public class TaskAssignee
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }

    public TaskEntity Task { get; set; } = null!;
    public User User { get; set; } = null!;
}
