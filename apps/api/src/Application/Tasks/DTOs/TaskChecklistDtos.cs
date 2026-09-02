namespace PersonalOs.Application.Tasks.DTOs;

public record ChecklistItemDto(
    Guid Id,
    Guid TaskId,
    string Title,
    bool IsCompleted,
    Guid? AssigneeId,
    string? AssigneeName,
    string? AssigneeEmail
);
