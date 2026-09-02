using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Application.Tasks.Projects;
using PersonalOs.Application.Tasks.Workspaces;

namespace PersonalOs.Api.Controllers;

[Authorize]
public class WorkspacesController : ApiControllerBase
{
    private readonly IMediator _mediator;
    public WorkspacesController(IMediator mediator) => _mediator = mediator;

    // GET /api/workspaces
    [HttpGet]
    public async Task<ActionResult<List<WorkspaceDto>>> GetWorkspaces()
    {
        var result = await _mediator.Send(new GetWorkspacesQuery(CurrentUserId));
        return Ok(result);
    }

    // POST /api/workspaces
    [HttpPost]
    public async Task<ActionResult<WorkspaceDto>> CreateWorkspace([FromBody] CreateWorkspaceRequest request)
    {
        var result = await _mediator.Send(new CreateWorkspaceCommand(
            CurrentUserId, request.Name, request.Description, request.Icon, request.Color));
        return Ok(result);
    }

    // PUT /api/workspaces/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<WorkspaceDto>> UpdateWorkspace(Guid id, [FromBody] UpdateWorkspaceRequest request)
    {
        try
        {
            var result = await _mediator.Send(new UpdateWorkspaceCommand(
                id, CurrentUserId, request.Name, request.Description, request.Icon, request.Color, request.IsPinned));
            if (result == null) return NotFound(new { message = "Workspace not found." });
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST /api/workspaces/{id}/archive
    [HttpPost("{id}/archive")]
    public async Task<ActionResult<WorkspaceDto>> ArchiveWorkspace(Guid id)
    {
        var result = await _mediator.Send(new ArchiveWorkspaceCommand(id, CurrentUserId));
        if (result == null) return NotFound(new { message = "Workspace not found or access denied." });
        return Ok(result);
    }

    // DELETE /api/workspaces/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteWorkspace(Guid id)
    {
        var result = await _mediator.Send(new DeleteWorkspaceCommand(id, CurrentUserId));
        if (!result) return BadRequest(new { message = "Workspace not found or cannot be deleted" });
        return NoContent();
    }

    // GET /api/workspaces/{workspaceId}/projects
    [HttpGet("{workspaceId}/projects")]
    public async Task<ActionResult<List<ProjectDto>>> GetProjects(Guid workspaceId)
    {
        var result = await _mediator.Send(new GetProjectsQuery(CurrentUserId, workspaceId));
        return Ok(result);
    }

    // POST /api/workspaces/{workspaceId}/projects
    [HttpPost("{workspaceId}/projects")]
    public async Task<ActionResult<ProjectDto>> CreateProject(Guid workspaceId, [FromBody] CreateProjectRequest request)
    {
        var result = await _mediator.Send(new CreateProjectCommand(
            CurrentUserId, workspaceId, request.Name, request.Description,
            request.Icon, request.Color, request.Priority, request.StartDate, request.DueDate));
        return Ok(result);
    }

    // GET /api/workspaces/{workspaceId}/members
    [HttpGet("{workspaceId}/members")]
    public async Task<ActionResult<List<WorkspaceMemberDto>>> GetWorkspaceMembers(Guid workspaceId)
    {
        try
        {
            var result = await _mediator.Send(new GetWorkspaceMembersQuery(CurrentUserId, workspaceId));
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    // POST /api/workspaces/{workspaceId}/members
    [HttpPost("{workspaceId}/members")]
    public async Task<ActionResult<WorkspaceMemberDto>> AddWorkspaceMember(Guid workspaceId, [FromBody] AddWorkspaceMemberRequest request)
    {
        try
        {
            var result = await _mediator.Send(new AddWorkspaceMemberCommand(
                CurrentUserId, workspaceId, request.Email, request.Role));
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT /api/workspaces/{workspaceId}/members/{userId}
    [HttpPut("{workspaceId}/members/{userId}")]
    public async Task<ActionResult<WorkspaceMemberDto>> UpdateWorkspaceMemberRole(Guid workspaceId, Guid userId, [FromBody] UpdateWorkspaceMemberRoleRequest request)
    {
        try
        {
            var result = await _mediator.Send(new UpdateWorkspaceMemberRoleCommand(
                CurrentUserId, workspaceId, userId, request.Role));
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE /api/workspaces/{workspaceId}/members/{userId}
    [HttpDelete("{workspaceId}/members/{userId}")]
    public async Task<ActionResult> RemoveWorkspaceMember(Guid workspaceId, Guid userId)
    {
        try
        {
            var result = await _mediator.Send(new RemoveWorkspaceMemberCommand(
                CurrentUserId, workspaceId, userId));
            if (!result) return NotFound();
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/workspaces/{workspaceId}/settings
    [HttpGet("{workspaceId}/settings")]
    public async Task<ActionResult<WorkspaceSettingsDto>> GetWorkspaceSettings(Guid workspaceId)
    {
        var result = await _mediator.Send(new GetWorkspaceSettingsQuery(CurrentUserId, workspaceId));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // PUT /api/workspaces/{workspaceId}/settings
    [HttpPut("{workspaceId}/settings")]
    public async Task<ActionResult> UpdateWorkspaceSettings(Guid workspaceId, [FromBody] WorkspaceSettingsDto settings)
    {
        try
        {
            var result = await _mediator.Send(new UpdateWorkspaceSettingsCommand(CurrentUserId, workspaceId, settings));
            if (!result) return NotFound(new { message = "Workspace not found." });
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/workspaces/{workspaceId}/resource-permissions
    [HttpGet("{workspaceId}/resource-permissions")]
    public async Task<ActionResult<List<ResourcePermissionDto>>> GetResourcePermissions(Guid workspaceId)
    {
        var result = await _mediator.Send(new GetResourcePermissionsQuery(CurrentUserId, workspaceId));
        return Ok(result);
    }

    // POST /api/workspaces/{workspaceId}/resource-permissions
    [HttpPost("{workspaceId}/resource-permissions")]
    public async Task<ActionResult<ResourcePermissionDto>> SetResourcePermission(Guid workspaceId, [FromBody] SetResourcePermissionRequest request)
    {
        var result = await _mediator.Send(new SetResourcePermissionCommand(
            CurrentUserId, workspaceId, request.ResourceType, request.ResourceId, request.TargetUserId, request.TargetRole, request.AccessLevel));
        return Ok(result);
    }

    // DELETE /api/workspaces/{workspaceId}/resource-permissions/{permissionId}
    [HttpDelete("{workspaceId}/resource-permissions/{permissionId}")]
    public async Task<ActionResult> RemoveResourcePermission(Guid workspaceId, Guid permissionId)
    {
        var result = await _mediator.Send(new RemoveResourcePermissionCommand(CurrentUserId, permissionId));
        if (!result) return NotFound();
        return NoContent();
    }
}

public record CreateWorkspaceRequest(string Name, string? Description, string? Icon, string? Color);
public record UpdateWorkspaceRequest(string? Name, string? Description, string? Icon, string? Color, bool? IsPinned);
public record CreateProjectRequest(string Name, string? Description, string? Icon, string? Color, string? Priority, DateTimeOffset? StartDate, DateTimeOffset? DueDate);
public record AddWorkspaceMemberRequest(string Email, string Role);
public record UpdateWorkspaceMemberRoleRequest(string Role);
public record SetResourcePermissionRequest(string ResourceType, Guid? ResourceId, Guid? TargetUserId, string? TargetRole, string AccessLevel);
