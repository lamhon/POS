using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Tasks.Checklists;

public record CreateChecklistItemCommand(Guid TaskId, string Title, Guid? AssigneeId, Guid UserId) : IRequest<ChecklistItemDto>;

public record UpdateChecklistItemCommand(Guid TaskId, Guid ItemId, string Title, bool IsCompleted, Guid? AssigneeId, Guid UserId) : IRequest<ChecklistItemDto>;

public record DeleteChecklistItemCommand(Guid TaskId, Guid ItemId, Guid UserId) : IRequest<bool>;

public class ChecklistHandlers : 
    IRequestHandler<CreateChecklistItemCommand, ChecklistItemDto>,
    IRequestHandler<UpdateChecklistItemCommand, ChecklistItemDto>,
    IRequestHandler<DeleteChecklistItemCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ChecklistHandlers(IApplicationDbContext context)
    {
        _context = context;
    }

    private ChecklistItemDto MapToDto(ChecklistItem item, User? assignee) => new(
        item.Id, item.TaskId, item.Title, item.IsCompleted, item.AssigneeId, assignee?.DisplayName, assignee?.Email
    );

    public async Task<ChecklistItemDto> Handle(CreateChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == request.TaskId && !t.IsDeleted, cancellationToken)
            ?? throw new InvalidOperationException("Task not found.");

        User? assignee = null;
        if (request.AssigneeId.HasValue)
        {
            assignee = await _context.Users.FindAsync(new object[] { request.AssigneeId.Value }, cancellationToken);
            if (assignee == null) throw new InvalidOperationException("Assignee not found.");
        }

        var item = new ChecklistItem
        {
            TaskId = request.TaskId,
            Title = request.Title,
            AssigneeId = request.AssigneeId
        };

        _context.ChecklistItems.Add(item);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(item, assignee);
    }

    public async Task<ChecklistItemDto> Handle(UpdateChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.ChecklistItems
            .Include(c => c.Task)
            .FirstOrDefaultAsync(c => c.Id == request.ItemId && c.TaskId == request.TaskId && !c.Task.IsDeleted, cancellationToken)
            ?? throw new InvalidOperationException("Checklist item not found.");

        User? assignee = null;
        if (request.AssigneeId.HasValue)
        {
            assignee = await _context.Users.FindAsync(new object[] { request.AssigneeId.Value }, cancellationToken);
            if (assignee == null) throw new InvalidOperationException("Assignee not found.");
        }
        else if (item.AssigneeId.HasValue && !request.AssigneeId.HasValue)
        {
            // Removed assignee
        }
        else if (item.AssigneeId == request.AssigneeId && request.AssigneeId.HasValue)
        {
            // Unchanged assignee
            assignee = await _context.Users.FindAsync(new object[] { request.AssigneeId.Value }, cancellationToken);
        }

        item.Title = request.Title;
        item.IsCompleted = request.IsCompleted;
        item.AssigneeId = request.AssigneeId;

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(item, assignee);
    }

    public async Task<bool> Handle(DeleteChecklistItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.ChecklistItems
            .FirstOrDefaultAsync(c => c.Id == request.ItemId && c.TaskId == request.TaskId, cancellationToken)
            ?? throw new InvalidOperationException("Checklist item not found.");

        _context.ChecklistItems.Remove(item);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
