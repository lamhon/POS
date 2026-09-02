namespace PersonalOs.Application.Tasks.DTOs;

public record TaskCommentReactionDto(
    string Emoji,
    Guid UserId,
    string UserDisplayName
);

public record TaskCommentDto(
    Guid Id,
    Guid TaskId,
    Guid UserId,
    string UserEmail,
    string UserDisplayName,
    string Content,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt,
    Guid? ParentCommentId,
    int RepliesCount,
    List<TaskCommentReactionDto> Reactions,
    bool IsImportant,
    List<TaskCommentDto>? Replies = null
);
