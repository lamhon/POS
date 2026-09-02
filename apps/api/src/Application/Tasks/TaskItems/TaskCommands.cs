using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Common.Models;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Tasks.TaskItems;

// ─── Create Task ──────────────────────────────────────────────

public record CreateTaskCommand(
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
    List<Guid>? AssigneeIds,
    List<string>? Tags,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate,
    double? Estimate
) : IRequest<TaskDto>;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly IApplicationDbContext _context;
    public CreateTaskCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            throw new InvalidOperationException("Task title is required.");

        // Verify workspace ownership
        var workspace = await _context.Workspaces
            .FirstOrDefaultAsync(w => w.Id == request.WorkspaceId && w.UserId == request.UserId && !w.IsDeleted, cancellationToken)
            ?? throw new InvalidOperationException("Workspace not found.");

        if (workspace.IsArchived)
            throw new InvalidOperationException("Cannot create tasks in an archived workspace.");

        // If ParentTaskId provided, validate it belongs to the same user and isn't circular
        if (request.ParentTaskId.HasValue)
        {
            var parent = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == request.ParentTaskId.Value && t.UserId == request.UserId && !t.IsDeleted, cancellationToken)
                ?? throw new InvalidOperationException("Parent task not found.");

            // Prevent self-reference (simple check — deeper cycle detection can be done in Phase 3)
            if (parent.Id == request.ParentTaskId.Value && request.ParentTaskId == parent.ParentTaskId)
                throw new InvalidOperationException("Circular parent-child relationship detected.");
        }

        var task = new TaskEntity
        {
            UserId = request.UserId,
            WorkspaceId = request.WorkspaceId,
            ProjectId = request.ProjectId,
            DatabaseId = request.DatabaseId,
            ParentTaskId = request.ParentTaskId,
            Title = request.Title,
            Description = request.Description,
            Status = string.IsNullOrWhiteSpace(request.Status) ? "Todo" : request.Status,
            Priority = request.Priority,
            AssigneeId = request.AssigneeId,
            Tags = request.Tags ?? new List<string>(),
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            Estimate = request.Estimate,
            Assignees = request.AssigneeIds?.Select(id => new TaskAssignee { UserId = id }).ToList() ?? new List<TaskAssignee>()
        };
        _context.Tasks.Add(task);

        // Record activity log
        var log = new TaskActivityLog
        {
            TaskId = task.Id,
            UserId = request.UserId,
            Action = "Created",
            CreatedAt = DateTimeOffset.UtcNow
        };
        _context.TaskActivityLogs.Add(log);

        await _context.SaveChangesAsync(cancellationToken);
        return TaskItemMapper.ToDto(task);
    }
}

// ─── Update Task ──────────────────────────────────────────────

public record UpdateTaskCommand(
    Guid Id,
    Guid UserId,
    string Title,
    string? Description,
    string Status,
    string? Priority,
    Guid? AssigneeId,
    List<Guid>? AssigneeIds,
    List<string>? Tags,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate,
    double? Estimate
) : IRequest<TaskDto?>;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, TaskDto?>
{
    private readonly IApplicationDbContext _context;
    public UpdateTaskCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskDto?> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignees)
            .Include(t => t.Workspace)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId && !t.IsDeleted, cancellationToken);

        if (task == null) return null;

        if (task.Workspace != null && task.Workspace.IsArchived)
            throw new InvalidOperationException("Cannot update tasks in an archived workspace.");

        // Track changes for Activity Log
        var logs = new List<TaskActivityLog>();

        if (task.Status != request.Status)
        {
            logs.Add(new TaskActivityLog { TaskId = task.Id, UserId = request.UserId, Action = "StatusChanged", OldValue = task.Status, NewValue = request.Status, CreatedAt = DateTimeOffset.UtcNow });
        }
        if (task.Priority != request.Priority)
        {
            logs.Add(new TaskActivityLog { TaskId = task.Id, UserId = request.UserId, Action = "PriorityChanged", OldValue = task.Priority, NewValue = request.Priority, CreatedAt = DateTimeOffset.UtcNow });
        }
        if (task.AssigneeId != request.AssigneeId)
        {
            logs.Add(new TaskActivityLog { TaskId = task.Id, UserId = request.UserId, Action = "Assigned", OldValue = task.AssigneeId?.ToString(), NewValue = request.AssigneeId?.ToString(), CreatedAt = DateTimeOffset.UtcNow });
        }
        if (task.DueDate != request.DueDate)
        {
            logs.Add(new TaskActivityLog { TaskId = task.Id, UserId = request.UserId, Action = "DueDateChanged", OldValue = task.DueDate?.ToString("o"), NewValue = request.DueDate?.ToString("o"), CreatedAt = DateTimeOffset.UtcNow });
        }
        if (task.Title != request.Title)
        {
            logs.Add(new TaskActivityLog { TaskId = task.Id, UserId = request.UserId, Action = "TitleChanged", OldValue = task.Title, NewValue = request.Title, CreatedAt = DateTimeOffset.UtcNow });
        }
        if (task.Description != request.Description)
        {
            logs.Add(new TaskActivityLog { TaskId = task.Id, UserId = request.UserId, Action = "DescriptionChanged", CreatedAt = DateTimeOffset.UtcNow });
        }

        // Apply updates
        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.AssigneeId = request.AssigneeId;
        task.Tags = request.Tags ?? new List<string>();
        task.StartDate = request.StartDate;
        task.DueDate = request.DueDate;
        task.Estimate = request.Estimate;

        if (request.AssigneeIds != null)
        {
            var currentAssigneeIds = task.Assignees.Select(a => a.UserId).ToList();
            var toAdd = request.AssigneeIds.Except(currentAssigneeIds).ToList();
            var toRemove = currentAssigneeIds.Except(request.AssigneeIds).ToList();

            foreach (var userId in toAdd)
                task.Assignees.Add(new TaskAssignee { TaskId = task.Id, UserId = userId });

            foreach (var userId in toRemove)
            {
                var assigneeToRemove = task.Assignees.FirstOrDefault(a => a.UserId == userId);
                if (assigneeToRemove != null)
                    task.Assignees.Remove(assigneeToRemove);
            }
        }

        // Mark completed
        if (request.Status == "Done" && task.CompletedAt == null)
        {
            task.CompletedAt = DateTimeOffset.UtcNow;
            logs.Add(new TaskActivityLog { TaskId = task.Id, UserId = request.UserId, Action = "Completed", CreatedAt = DateTimeOffset.UtcNow });
        }
        else if (request.Status != "Done")
        {
            task.CompletedAt = null;
        }

        foreach (var log in logs)
            _context.TaskActivityLogs.Add(log);

        await _context.SaveChangesAsync(cancellationToken);
        return TaskItemMapper.ToDto(task);
    }
}

// ─── Delete Task (soft delete) ────────────────────────────────

public record DeleteTaskCommand(Guid Id, Guid UserId) : IRequest;

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand>
{
    private readonly IApplicationDbContext _context;
    public DeleteTaskCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .Include(t => t.Workspace)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId && !t.IsDeleted, cancellationToken)
            ?? throw new InvalidOperationException("Task not found.");

        if (task.Workspace != null && task.Workspace.IsArchived)
            throw new InvalidOperationException("Cannot delete tasks in an archived workspace.");

        task.IsDeleted = true;
        task.DeletedAt = DateTimeOffset.UtcNow;

        _context.TaskActivityLogs.Add(new TaskActivityLog
        {
            TaskId = task.Id, UserId = request.UserId,
            Action = "Deleted", CreatedAt = DateTimeOffset.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
    }
}

// ─── Complete Task ────────────────────────────────────────────

public record CompleteTaskCommand(Guid Id, Guid UserId) : IRequest<TaskDto?>;

public class CompleteTaskCommandHandler : IRequestHandler<CompleteTaskCommand, TaskDto?>
{
    private readonly IApplicationDbContext _context;
    public CompleteTaskCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskDto?> Handle(CompleteTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .Include(t => t.Workspace)
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId && !t.IsDeleted, cancellationToken);

        if (task == null) return null;

        if (task.Workspace != null && task.Workspace.IsArchived)
            throw new InvalidOperationException("Cannot complete tasks in an archived workspace.");

        if (task.Status == "Done")
        {
            task.Status = "Todo";
            task.CompletedAt = null;

            _context.TaskActivityLogs.Add(new TaskActivityLog
            {
                TaskId = task.Id, UserId = request.UserId,
                Action = "Reopened", NewValue = "Todo", CreatedAt = DateTimeOffset.UtcNow
            });
        }
        else
        {
            task.Status = "Done";
            task.CompletedAt = DateTimeOffset.UtcNow;

            _context.TaskActivityLogs.Add(new TaskActivityLog
            {
                TaskId = task.Id, UserId = request.UserId,
                Action = "Completed", NewValue = "Done", CreatedAt = DateTimeOffset.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return TaskItemMapper.ToDto(task);
    }
}

// ─── Archive Task ─────────────────────────────────────────────

public record ArchiveTaskCommand(Guid Id, Guid UserId) : IRequest<TaskDto?>;

public class ArchiveTaskCommandHandler : IRequestHandler<ArchiveTaskCommand, TaskDto?>
{
    private readonly IApplicationDbContext _context;
    public ArchiveTaskCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<TaskDto?> Handle(ArchiveTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.UserId == request.UserId && !t.IsDeleted, cancellationToken);

        if (task == null) return null;

        if (task.ArchivedAt != null)
        {
            task.ArchivedAt = null;

            _context.TaskActivityLogs.Add(new TaskActivityLog
            {
                TaskId = task.Id, UserId = request.UserId,
                Action = "Unarchived", CreatedAt = DateTimeOffset.UtcNow
            });
        }
        else
        {
            task.ArchivedAt = DateTimeOffset.UtcNow;

            _context.TaskActivityLogs.Add(new TaskActivityLog
            {
                TaskId = task.Id, UserId = request.UserId,
                Action = "Archived", CreatedAt = DateTimeOffset.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return TaskItemMapper.ToDto(task);
    }
}

// ─── Internal Mapper ─────────────────────────────────────────

internal static class TaskItemMapper
{
    internal static TaskDto ToDto(TaskEntity t, List<TaskDto>? subtasks = null) =>
        new(
            t.Id, t.UserId, t.WorkspaceId, t.ProjectId, t.DatabaseId, t.ParentTaskId,
            t.Title, t.Description, t.Status, t.Priority, t.AssigneeId, t.Assignee?.DisplayName,
            t.Assignees?.Select(a => new UserSummaryDto(a.UserId, a.User?.DisplayName ?? "", a.User?.Email ?? "")).ToList(),
            t.Assignees?.Select(a => a.UserId).ToList(),
            t.Tags,
            t.StartDate, t.DueDate, t.CompletedAt, t.ArchivedAt, t.CreatedAt, t.UpdatedAt,
            subtasks ?? new List<TaskDto>(),
            t.Subtasks.Count,
            t.Subtasks.Count(s => s.Status == "Done"),
            t.Estimate,
            t.ChecklistItems?.OrderBy(c => c.CreatedAt).Select(c => new ChecklistItemDto(
                c.Id, c.TaskId, c.Title, c.IsCompleted, c.AssigneeId, c.Assignee?.DisplayName, c.Assignee?.Email
            )).ToList() ?? new List<ChecklistItemDto>()
        );
}
