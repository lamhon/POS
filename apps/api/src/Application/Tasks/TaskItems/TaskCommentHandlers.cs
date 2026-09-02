using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Tasks.TaskItems;

// ─── Get Comments ──────────────────────────────────────────────

public record GetTaskCommentsQuery(Guid TaskId, Guid UserId) : IRequest<List<TaskCommentDto>>;

public class GetTaskCommentsQueryHandler : IRequestHandler<GetTaskCommentsQuery, List<TaskCommentDto>>
{
    private readonly IApplicationDbContext _context;
    public GetTaskCommentsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<TaskCommentDto>> Handle(GetTaskCommentsQuery request, CancellationToken cancellationToken)
    {
        var comments = await _context.TaskComments
            .Include(c => c.User)
            .Include(c => c.Reactions).ThenInclude(r => r.User)
            .Include(c => c.Replies.Where(r => !r.IsDeleted))
                .ThenInclude(r => r.User)
            .Include(c => c.Replies.Where(r => !r.IsDeleted))
                .ThenInclude(r => r.Reactions)
                    .ThenInclude(rx => rx.User)
            .Where(c => c.TaskId == request.TaskId && c.ParentCommentId == null && !c.IsDeleted)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        return comments.Select(c => MapToDto(c)).ToList();
    }

    private TaskCommentDto MapToDto(TaskComment comment)
    {
        return new TaskCommentDto(
            comment.Id,
            comment.TaskId,
            comment.UserId,
            comment.User?.Email ?? string.Empty,
            comment.User?.DisplayName ?? string.Empty,
            comment.Content,
            comment.CreatedAt,
            comment.UpdatedAt,
            comment.ParentCommentId,
            comment.Replies.Count,
            comment.Reactions.Select(r => new TaskCommentReactionDto(r.Emoji, r.UserId, r.User?.DisplayName ?? string.Empty)).ToList(),
            comment.IsImportant,
            comment.Replies.OrderBy(r => r.CreatedAt).Select(r => MapToDto(r)).ToList()
        );
    }
}

// ─── Create Comment ──────────────────────────────────────────────

public record CreateTaskCommentCommand(Guid TaskId, Guid UserId, string Content, Guid? ParentCommentId = null) : IRequest<TaskCommentDto>;

public class CreateTaskCommentCommandHandler : IRequestHandler<CreateTaskCommentCommand, TaskCommentDto>
{
    private readonly IApplicationDbContext _context;
    public CreateTaskCommentCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskCommentDto> Handle(CreateTaskCommentCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == request.TaskId && !t.IsDeleted, cancellationToken)
            ?? throw new InvalidOperationException("Task not found.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new InvalidOperationException("User not found.");

        if (string.IsNullOrWhiteSpace(request.Content))
            throw new InvalidOperationException("Comment content cannot be empty.");

        if (request.ParentCommentId.HasValue)
        {
            var parent = await _context.TaskComments.FirstOrDefaultAsync(c => c.Id == request.ParentCommentId.Value && !c.IsDeleted, cancellationToken)
                ?? throw new InvalidOperationException("Parent comment not found.");
            
            // Do not allow nested replies deeper than 1 level
            if (parent.ParentCommentId.HasValue)
                throw new InvalidOperationException("Cannot reply to a reply.");
        }

        var comment = new TaskComment
        {
            TaskId = request.TaskId,
            UserId = request.UserId,
            Content = request.Content,
            ParentCommentId = request.ParentCommentId
        };

        _context.TaskComments.Add(comment);

        var log = new TaskActivityLog
        {
            TaskId = request.TaskId,
            UserId = request.UserId,
            Action = "Added a comment"
        };
        _context.TaskActivityLogs.Add(log);

        await _context.SaveChangesAsync(cancellationToken);

        return new TaskCommentDto(
            comment.Id,
            comment.TaskId,
            comment.UserId,
            user.Email,
            user.DisplayName,
            comment.Content,
            comment.CreatedAt,
            comment.UpdatedAt,
            comment.ParentCommentId,
            0,
            new List<TaskCommentReactionDto>(),
            false,
            new List<TaskCommentDto>()
        );
    }
}

// ─── Update Comment ──────────────────────────────────────────────

public record UpdateTaskCommentCommand(Guid CommentId, Guid TaskId, Guid UserId, string Content) : IRequest<TaskCommentDto?>;

public class UpdateTaskCommentCommandHandler : IRequestHandler<UpdateTaskCommentCommand, TaskCommentDto?>
{
    private readonly IApplicationDbContext _context;
    public UpdateTaskCommentCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskCommentDto?> Handle(UpdateTaskCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _context.TaskComments
            .Include(c => c.User)
            .Include(c => c.Reactions).ThenInclude(r => r.User)
            .FirstOrDefaultAsync(c => c.Id == request.CommentId && c.TaskId == request.TaskId && !c.IsDeleted, cancellationToken);

        if (comment == null) return null;

        if (comment.UserId != request.UserId)
            throw new UnauthorizedAccessException("You can only edit your own comments.");

        if (string.IsNullOrWhiteSpace(request.Content))
            throw new InvalidOperationException("Comment content cannot be empty.");

        comment.Content = request.Content;
        await _context.SaveChangesAsync(cancellationToken);

        return new TaskCommentDto(
            comment.Id,
            comment.TaskId,
            comment.UserId,
            comment.User.Email,
            comment.User.DisplayName,
            comment.Content,
            comment.CreatedAt,
            comment.UpdatedAt,
            comment.ParentCommentId,
            comment.Replies?.Count ?? 0,
            comment.Reactions.Select(r => new TaskCommentReactionDto(r.Emoji, r.UserId, r.User?.DisplayName ?? string.Empty)).ToList(),
            comment.IsImportant,
            null
        );
    }
}

// ─── Delete Comment ──────────────────────────────────────────────

public record DeleteTaskCommentCommand(Guid CommentId, Guid TaskId, Guid UserId) : IRequest<bool>;

public class DeleteTaskCommentCommandHandler : IRequestHandler<DeleteTaskCommentCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public DeleteTaskCommentCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(DeleteTaskCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _context.TaskComments
            .Include(c => c.Task)
            .FirstOrDefaultAsync(c => c.Id == request.CommentId && c.TaskId == request.TaskId && !c.IsDeleted, cancellationToken);

        if (comment == null) return false;

        // Allow comment owner OR workspace owner to delete
        if (comment.UserId != request.UserId && comment.Task.UserId != request.UserId)
            throw new UnauthorizedAccessException("You don't have permission to delete this comment.");

        comment.IsDeleted = true;
        comment.DeletedAt = DateTimeOffset.UtcNow;

        var log = new TaskActivityLog
        {
            TaskId = request.TaskId,
            UserId = request.UserId,
            Action = "Deleted a comment"
        };
        _context.TaskActivityLogs.Add(log);

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

// ─── Toggle Reaction ──────────────────────────────────────────────

public record ToggleTaskCommentReactionCommand(Guid TaskId, Guid CommentId, Guid UserId, string Emoji) : IRequest<Unit>;

public class ToggleTaskCommentReactionCommandHandler : IRequestHandler<ToggleTaskCommentReactionCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    public ToggleTaskCommentReactionCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Unit> Handle(ToggleTaskCommentReactionCommand request, CancellationToken cancellationToken)
    {
        var comment = await _context.TaskComments
            .FirstOrDefaultAsync(c => c.Id == request.CommentId && c.TaskId == request.TaskId && !c.IsDeleted, cancellationToken);

        if (comment == null) throw new InvalidOperationException("Comment not found.");

        var existingReaction = await _context.TaskCommentReactions
            .FirstOrDefaultAsync(r => r.CommentId == request.CommentId && r.UserId == request.UserId && r.Emoji == request.Emoji, cancellationToken);

        if (existingReaction != null)
        {
            // Untoggle
            _context.TaskCommentReactions.Remove(existingReaction);
        }
        else
        {
            // Toggle on
            _context.TaskCommentReactions.Add(new TaskCommentReaction
            {
                CommentId = request.CommentId,
                UserId = request.UserId,
                Emoji = request.Emoji
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}

// ─── Toggle Comment Important ──────────────────────────────────────

public record ToggleTaskCommentImportantCommand(Guid TaskId, Guid CommentId, Guid UserId) : IRequest<TaskCommentDto>;

public class ToggleTaskCommentImportantCommandHandler : IRequestHandler<ToggleTaskCommentImportantCommand, TaskCommentDto>
{
    private readonly IApplicationDbContext _context;
    public ToggleTaskCommentImportantCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskCommentDto> Handle(ToggleTaskCommentImportantCommand request, CancellationToken cancellationToken)
    {
        var comment = await _context.TaskComments
            .Include(c => c.User)
            .Include(c => c.Reactions).ThenInclude(r => r.User)
            .FirstOrDefaultAsync(c => c.Id == request.CommentId && c.TaskId == request.TaskId && !c.IsDeleted, cancellationToken);

        if (comment == null) throw new InvalidOperationException("Comment not found.");

        comment.IsImportant = !comment.IsImportant;
        await _context.SaveChangesAsync(cancellationToken);

        return new TaskCommentDto(
            comment.Id,
            comment.TaskId,
            comment.UserId,
            comment.User?.Email ?? string.Empty,
            comment.User?.DisplayName ?? string.Empty,
            comment.Content,
            comment.CreatedAt,
            comment.UpdatedAt,
            comment.ParentCommentId,
            comment.Replies?.Count ?? 0,
            comment.Reactions.Select(r => new TaskCommentReactionDto(r.Emoji, r.UserId, r.User?.DisplayName ?? string.Empty)).ToList(),
            comment.IsImportant,
            null
        );
    }
}

// ─── Promote Comment ──────────────────────────────────────────────

public record PromoteTaskCommentCommand(Guid TaskId, Guid CommentId, Guid UserId) : IRequest<TaskCommentDto>;

public class PromoteTaskCommentCommandHandler : IRequestHandler<PromoteTaskCommentCommand, TaskCommentDto>
{
    private readonly IApplicationDbContext _context;
    public PromoteTaskCommentCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskCommentDto> Handle(PromoteTaskCommentCommand request, CancellationToken cancellationToken)
    {
        var originalComment = await _context.TaskComments
            .Include(c => c.Task)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == request.CommentId && c.TaskId == request.TaskId && !c.IsDeleted, cancellationToken);

        if (originalComment == null) throw new InvalidOperationException("Comment not found.");

        var subtask = originalComment.Task;
        if (subtask.ParentTaskId == null)
            throw new InvalidOperationException("Cannot promote a comment from a root task.");

        var parentTask = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == subtask.ParentTaskId.Value && !t.IsDeleted, cancellationToken)
            ?? throw new InvalidOperationException("Parent task not found.");

        var newComment = new TaskComment
        {
            TaskId = parentTask.Id,
            UserId = request.UserId, // The user promoting it (could also be originalComment.UserId)
            Content = $"⚠️ From {subtask.Title}\n\n{originalComment.Content}",
            IsImportant = true
        };

        _context.TaskComments.Add(newComment);
        
        // Also mark original comment as important if not already
        originalComment.IsImportant = true;

        await _context.SaveChangesAsync(cancellationToken);

        // Fetch user for response
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        return new TaskCommentDto(
            newComment.Id,
            newComment.TaskId,
            newComment.UserId,
            user?.Email ?? string.Empty,
            user?.DisplayName ?? string.Empty,
            newComment.Content,
            newComment.CreatedAt,
            newComment.UpdatedAt,
            null,
            0,
            new List<TaskCommentReactionDto>(),
            newComment.IsImportant,
            new List<TaskCommentDto>()
        );
    }
}
