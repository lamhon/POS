namespace PersonalOs.Application.Tasks.DTOs;

public record WorkspaceDto(
    Guid Id,
    string Name,
    string? Description,
    string? Icon,
    string? Color,
    bool IsPinned,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt
);

public record WorkspaceSettingsDto(
    string CreatePagesPermission,
    string CreateDatabasesPermission,
    string CreateProjectsPermission,
    string DeleteContentPermission,
    string InviteMembersPermission,
    string ManageSettingsPermission,
    string ExportWorkspacePermission
);

public record ResourcePermissionDto(
    Guid Id,
    Guid WorkspaceId,
    string ResourceType,
    Guid? ResourceId,
    Guid? UserId,
    string? Role,
    string AccessLevel,
    DateTimeOffset CreatedAt
);

public record WorkspaceMemberDto(
    Guid Id,
    Guid WorkspaceId,
    Guid UserId,
    string Email,
    string DisplayName,
    string Role,
    DateTimeOffset CreatedAt,
    string? Phone
);

public record ProjectDto(
    Guid Id,
    Guid WorkspaceId,
    string Name,
    string? Description,
    string? Icon,
    string? Color,
    string Status,
    string? Priority,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt
);



public record TaskActivityLogDto(
    Guid Id,
    Guid TaskId,
    Guid UserId,
    string Action,
    string? OldValue,
    string? NewValue,
    DateTimeOffset CreatedAt
);

public record UserSummaryDto(
    Guid Id,
    string DisplayName,
    string Email
);

public record TaskDto(
    Guid Id,
    Guid UserId,
    Guid WorkspaceId,
    Guid? ProjectId,
    Guid? DatabaseId,
    Guid? ParentTaskId,
    string Title,
    string? Description,
    string Status,
    string? Priority,
    Guid? AssigneeId,
    string? AssigneeName,
    List<UserSummaryDto>? Assignees,
    List<Guid>? AssigneeIds,
    List<string> Tags,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate,
    DateTimeOffset? CompletedAt,
    DateTimeOffset? ArchivedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt,

    List<TaskDto> Subtasks,
    int SubtaskCount,
    int CompletedSubtaskCount,
    double? Estimate,
    List<ChecklistItemDto> ChecklistItems
);
