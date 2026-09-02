using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Common.Models;
using PersonalOs.Application.Tasks.DTOs;

namespace PersonalOs.Application.Tasks.TaskItems;

// ─── Get Tasks (paginated + filtered) ─────────────────────────

public record GetTasksQuery(
    Guid UserId,
    Guid? WorkspaceId = null,
    Guid? ProjectId = null,
    Guid? ParentTaskId = null,    // null = root tasks; use Guid.Empty sentinel for inbox
    string? Status = null,
    string? Priority = null,
    string? Search = null,
    List<Guid>? AssigneeIds = null,
    DateTimeOffset? DueDateFrom = null,
    DateTimeOffset? DueDateTo = null,
    bool IncludeArchived = false,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<PaginatedDto<TaskDto>>;

public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, PaginatedDto<TaskDto>>
{
    private readonly IApplicationDbContext _context;
    public GetTasksQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedDto<TaskDto>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.Subtasks.Where(s => !s.IsDeleted))
            .Where(t => t.UserId == request.UserId && !t.IsDeleted);

        // Scope filters
        if (request.WorkspaceId.HasValue)
            query = query.Where(t => t.WorkspaceId == request.WorkspaceId.Value);

        if (request.ProjectId.HasValue)
            query = query.Where(t => t.ProjectId == request.ProjectId.Value);

        // Show subtasks or root tasks based on ParentTaskId filter
        if (request.ParentTaskId.HasValue)
            query = query.Where(t => t.ParentTaskId == request.ParentTaskId.Value);
        else
            query = query.Where(t => t.ParentTaskId == null);   // root tasks only by default

        if (!string.IsNullOrWhiteSpace(request.Status))
            query = query.Where(t => t.Status == request.Status);

        if (!string.IsNullOrWhiteSpace(request.Priority))
            query = query.Where(t => t.Priority == request.Priority);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(search) ||
                (t.Description != null && t.Description.ToLower().Contains(search)));
        }

        if (request.AssigneeIds != null && request.AssigneeIds.Any())
        {
            foreach (var assigneeId in request.AssigneeIds)
            {
                query = query.Where(t => t.AssigneeId == assigneeId || t.Assignees.Any(a => a.UserId == assigneeId));
            }
        }

        if (request.DueDateFrom.HasValue)
        {
            query = query.Where(t => t.DueDate >= request.DueDateFrom.Value);
        }

        if (request.DueDateTo.HasValue)
        {
            query = query.Where(t => t.DueDate <= request.DueDateTo.Value);
        }

        if (!request.IncludeArchived)
            query = query.Where(t => t.ArchivedAt == null);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var tasks = await query
            .OrderBy(t => t.Status == "Done" ? 1 : 0)
            .ThenBy(t => t.DueDate == null ? 1 : 0)
            .ThenBy(t => t.DueDate)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = tasks.Select(t => TaskItemMapper.ToDto(t)).ToList();
        return new PaginatedDto<TaskDto>(dtos, request.PageNumber, request.PageSize, totalCount, totalPages);
    }
}

// ─── Get Task By Id ────────────────────────────────────────────

public record GetTaskByIdQuery(Guid Id, Guid UserId) : IRequest<TaskDto?>;

public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, TaskDto?>
{
    private readonly IApplicationDbContext _context;
    public GetTaskByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskDto?> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.ChecklistItems).ThenInclude(c => c.Assignee)
            .Include(t => t.Subtasks.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Assignee)
            .Include(t => t.Subtasks.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Assignees).ThenInclude(a => a.User)
            .Include(t => t.Subtasks.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.ChecklistItems).ThenInclude(c => c.Assignee)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId && !t.IsDeleted, cancellationToken);

        if (task == null) return null;

        var subtaskDtos = task.Subtasks
            .OrderBy(s => s.CreatedAt)
            .Select(s => TaskItemMapper.ToDto(s))
            .ToList();

        return TaskItemMapper.ToDto(task, subtaskDtos);
    }
}

// ─── Get Task Activity Logs ───────────────────────────────────

public record GetTaskActivityLogsQuery(Guid TaskId, Guid UserId) : IRequest<List<TaskActivityLogDto>>;

public class GetTaskActivityLogsQueryHandler : IRequestHandler<GetTaskActivityLogsQuery, List<TaskActivityLogDto>>
{
    private readonly IApplicationDbContext _context;
    public GetTaskActivityLogsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<TaskActivityLogDto>> Handle(GetTaskActivityLogsQuery request, CancellationToken cancellationToken)
    {
        var hasAccess = await _context.Tasks.AnyAsync(t => t.Id == request.TaskId && t.UserId == request.UserId && !t.IsDeleted, cancellationToken);
        if (!hasAccess) return new List<TaskActivityLogDto>();

        var logs = await _context.TaskActivityLogs
            .Where(l => l.TaskId == request.TaskId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);

        return logs.Select(l => new TaskActivityLogDto(
            l.Id, l.TaskId, l.UserId, l.Action, l.OldValue, l.NewValue, l.CreatedAt
        )).ToList();
    }
}
