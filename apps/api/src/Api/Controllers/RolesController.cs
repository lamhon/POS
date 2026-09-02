using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Admin.DTOs;
using PersonalOs.Application.Admin.Roles;
using System.Security.Claims;

namespace PersonalOs.Api.Controllers;

[ApiController]
[Route("api/admin/roles")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly IMediator _mediator;

    public RolesController(IMediator mediator) => _mediator = mediator;

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());

    /// <summary>Get paginated list of roles with optional filters</summary>
    [HttpGet]
    public async Task<IActionResult> GetRoles(
        [FromQuery] string? search,
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetRolesQuery(search, type, status, pageNumber, pageSize));
        return Ok(result);
    }

    /// <summary>Get role detail by ID including permissions</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRole(Guid id)
    {
        var result = await _mediator.Send(new GetRoleByIdQuery(id));
        return result == null ? NotFound() : Ok(result);
    }

    /// <summary>Get all system permissions grouped by Module and Resource</summary>
    [HttpGet("/api/admin/permissions")]
    public async Task<IActionResult> GetPermissions()
    {
        var result = await _mediator.Send(new GetPermissionsQuery());
        return Ok(result);
    }

    /// <summary>Create a new custom role</summary>
    [HttpPost]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        try
        {
            var result = await _mediator.Send(new CreateRoleCommand(
                CurrentUserId, request.Name, request.Description,
                request.Icon, request.Color, request.Permissions));
            return CreatedAtAction(nameof(GetRole), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>Update role information and permissions</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
    {
        try
        {
            var result = await _mediator.Send(new UpdateRoleCommand(
                CurrentUserId, id, request.Name, request.Description,
                request.Icon, request.Color, request.Permissions));
            return result == null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Duplicate a role (copies permissions and scope, creates new ID, no user assignments)</summary>
    [HttpPost("{id:guid}/duplicate")]
    public async Task<IActionResult> DuplicateRole(Guid id, [FromBody] DuplicateRoleRequest request)
    {
        try
        {
            var result = await _mediator.Send(new DuplicateRoleCommand(CurrentUserId, id, request.NewName));
            return result == null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>Toggle role status between Active and Archived</summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> ToggleArchiveRole(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new ArchiveRoleCommand(CurrentUserId, id));
            return result ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Delete a custom role (must have no user assignments)</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new DeleteRoleCommand(CurrentUserId, id));
            return result ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record DuplicateRoleRequest(string NewName);
