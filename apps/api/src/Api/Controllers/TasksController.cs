using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Common.Models;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Application.Tasks.TaskItems;
using PersonalOs.Application.Tasks.Checklists;

namespace PersonalOs.Api.Controllers;

[Authorize]
public class TasksController : ApiControllerBase
{
    private readonly IMediator _mediator;
    public TasksController(IMediator mediator) => _mediator = mediator;

    // GET /api/tasks?workspaceId=...&projectId=...&status=...&search=...&pageNumber=1&pageSize=20
    [HttpGet]
    public async Task<ActionResult<PaginatedDto<TaskDto>>> GetTasks(
        [FromQuery] Guid? workspaceId,
        [FromQuery] Guid? projectId,
        [FromQuery] Guid? parentTaskId,
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] string? search,
        [FromQuery] List<Guid>? assigneeIds,
        [FromQuery] DateTimeOffset? dueDateFrom,
        [FromQuery] DateTimeOffset? dueDateTo,
        [FromQuery] bool includeArchived = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetTasksQuery(
            CurrentUserId, workspaceId, projectId, parentTaskId,
            status, priority, search, assigneeIds, dueDateFrom, dueDateTo, includeArchived, pageNumber, pageSize));
        return Ok(result);
    }

    // GET /api/tasks/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetTask(Guid id)
    {
        var result = await _mediator.Send(new GetTaskByIdQuery(id, CurrentUserId));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // POST /api/tasks
    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskRequest request)
    {
        var result = await _mediator.Send(new CreateTaskCommand(
            CurrentUserId,
            request.WorkspaceId,
            request.ProjectId,
            request.DatabaseId,
            request.ParentTaskId,
            request.Title,
            request.Description,
            request.Status ?? "Todo",
            request.Priority,
            request.AssigneeId,
            request.AssigneeIds,
            request.Tags,
            request.StartDate,
            request.DueDate,
            request.Estimate));
        return Ok(result);
    }

    // PUT /api/tasks/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<TaskDto>> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var result = await _mediator.Send(new UpdateTaskCommand(
            id, CurrentUserId,
            request.Title, request.Description, request.Status,
            request.Priority, request.AssigneeId, request.AssigneeIds, request.Tags,
            request.StartDate, request.DueDate, request.Estimate));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/tasks/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(Guid id)
    {
        await _mediator.Send(new DeleteTaskCommand(id, CurrentUserId));
        return NoContent();
    }

    // POST /api/tasks/{id}/complete
    [HttpPost("{id}/complete")]
    public async Task<ActionResult<TaskDto>> CompleteTask(Guid id)
    {
        var result = await _mediator.Send(new CompleteTaskCommand(id, CurrentUserId));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // POST /api/tasks/{id}/archive
    [HttpPost("{id}/archive")]
    public async Task<ActionResult<TaskDto>> ArchiveTask(Guid id)
    {
        var result = await _mediator.Send(new ArchiveTaskCommand(id, CurrentUserId));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // GET /api/tasks/{id}/activity
    [HttpGet("{id}/activity")]
    public async Task<ActionResult<List<TaskActivityLogDto>>> GetTaskActivityLogs(Guid id)
    {
        var result = await _mediator.Send(new GetTaskActivityLogsQuery(id, CurrentUserId));
        return Ok(result);
    }


    // ─── Comment endpoints ──────────────────────────────────────────

    // GET /api/tasks/{id}/comments
    [HttpGet("{id}/comments")]
    public async Task<ActionResult<List<TaskCommentDto>>> GetTaskComments(Guid id)
    {
        var result = await _mediator.Send(new GetTaskCommentsQuery(id, CurrentUserId));
        return Ok(result);
    }

    // POST /api/tasks/{id}/comments
    [HttpPost("{id}/comments")]
    public async Task<ActionResult<TaskCommentDto>> CreateTaskComment(Guid id, [FromBody] CreateTaskCommentRequest request)
    {
        var result = await _mediator.Send(new CreateTaskCommentCommand(id, CurrentUserId, request.Content, request.ParentCommentId));
        return Ok(result);
    }

    // PUT /api/tasks/{id}/comments/{commentId}
    [HttpPut("{id}/comments/{commentId}")]
    public async Task<ActionResult<TaskCommentDto>> UpdateTaskComment(Guid id, Guid commentId, [FromBody] UpdateTaskCommentRequest request)
    {
        var result = await _mediator.Send(new UpdateTaskCommentCommand(commentId, id, CurrentUserId, request.Content));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // DELETE /api/tasks/{id}/comments/{commentId}
    [HttpDelete("{id}/comments/{commentId}")]
    public async Task<ActionResult> DeleteTaskComment(Guid id, Guid commentId)
    {
        var success = await _mediator.Send(new DeleteTaskCommentCommand(commentId, id, CurrentUserId));
        if (!success) return NotFound();
        return NoContent();
    }

    // POST /api/tasks/{id}/comments/{commentId}/reactions
    [HttpPost("{id}/comments/{commentId}/reactions")]
    public async Task<ActionResult> ToggleCommentReaction(Guid id, Guid commentId, [FromBody] ToggleCommentReactionRequest request)
    {
        await _mediator.Send(new ToggleTaskCommentReactionCommand(id, commentId, CurrentUserId, request.Emoji));
        return Ok();
    }

    // POST /api/tasks/{id}/comments/{commentId}/toggle-important
    [HttpPost("{id}/comments/{commentId}/toggle-important")]
    public async Task<ActionResult<TaskCommentDto>> ToggleCommentImportant(Guid id, Guid commentId)
    {
        var result = await _mediator.Send(new ToggleTaskCommentImportantCommand(id, commentId, CurrentUserId));
        return Ok(result);
    }

    // POST /api/tasks/{id}/comments/{commentId}/promote
    [HttpPost("{id}/comments/{commentId}/promote")]
    public async Task<ActionResult<TaskCommentDto>> PromoteComment(Guid id, Guid commentId)
    {
        var result = await _mediator.Send(new PromoteTaskCommentCommand(id, commentId, CurrentUserId));
        return Ok(result);
    }

    // ─── Checklist Endpoints ───────────────────────────────────────────────

    public record CreateChecklistItemRequest(string Title, Guid? AssigneeId);

    [HttpPost("{id}/checklist")]
    public async Task<ActionResult<ChecklistItemDto>> CreateChecklistItem(Guid id, [FromBody] CreateChecklistItemRequest request)
    {
        var result = await _mediator.Send(new CreateChecklistItemCommand(id, request.Title, request.AssigneeId, CurrentUserId));
        return Ok(result);
    }

    public record UpdateChecklistItemRequest(string Title, bool IsCompleted, Guid? AssigneeId);

    [HttpPut("{id}/checklist/{itemId}")]
    public async Task<ActionResult<ChecklistItemDto>> UpdateChecklistItem(Guid id, Guid itemId, [FromBody] UpdateChecklistItemRequest request)
    {
        var result = await _mediator.Send(new UpdateChecklistItemCommand(id, itemId, request.Title, request.IsCompleted, request.AssigneeId, CurrentUserId));
        return Ok(result);
    }

    [HttpDelete("{id}/checklist/{itemId}")]
    public async Task<ActionResult> DeleteChecklistItem(Guid id, Guid itemId)
    {
        await _mediator.Send(new DeleteChecklistItemCommand(id, itemId, CurrentUserId));
        return NoContent();
    }
}

// ─── Request DTOs ─────────────────────────────────────────────────

public record CreateTaskRequest(
    Guid WorkspaceId,
    Guid? ProjectId,
    Guid? DatabaseId,
    Guid? ParentTaskId,
    string Title,
    string? Description,
    string? Status,
    string? Priority,
    Guid? AssigneeId,
    List<Guid>? AssigneeIds,
    List<string>? Tags,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate,
    double? Estimate
);

public record UpdateTaskRequest(
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
);



public record CreateTaskCommentRequest(string Content, Guid? ParentCommentId = null);

public record UpdateTaskCommentRequest(string Content);

public record ToggleCommentReactionRequest(string Emoji);

