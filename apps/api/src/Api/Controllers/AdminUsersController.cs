using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalOs.Application.Admin.Users;
using PersonalOs.Application.Admin.DTOs;
using PersonalOs.Application.Admin.Roles;
using PersonalOs.Application.Common.Models;

namespace PersonalOs.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize]
public class AdminUsersController : ApiControllerBase
{
    private readonly IMediator _mediator;
    private string? ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString();

    public AdminUsersController(IMediator mediator) => _mediator = mediator;

    // GET /api/admin/users
    [HttpGet]
    public async Task<ActionResult<PaginatedDto<AdminUserListDto>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] string? status,
        [FromQuery] bool? verified,
        [FromQuery] DateTimeOffset? createdFrom,
        [FromQuery] DateTimeOffset? createdTo,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortDirection = "desc",
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetAdminUsersQuery(
            search, role, status, verified, createdFrom, createdTo,
            sortBy, sortDirection, pageNumber, pageSize));
        return Ok(result);
    }

    // POST /api/admin/users
    [HttpPost]
    public async Task<ActionResult<AdminUserDetailDto>> CreateUser([FromBody] CreateAdminUserRequest req)
    {
        try
        {
            var result = await _mediator.Send(new CreateAdminUserCommand(
                CurrentUserId, req.Email, req.DisplayName, req.Password,
                req.FullName, req.Username, req.Phone, req.Role, req.Status, ClientIp));
            return CreatedAtAction(nameof(GetUserDetail), new { userId = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }

    // GET /api/admin/users/{userId}
    [HttpGet("{userId}")]
    public async Task<ActionResult<AdminUserDetailDto>> GetUserDetail(Guid userId)
    {
        var result = await _mediator.Send(new GetAdminUserDetailQuery(userId));
        if (result == null) return NotFound();
        return Ok(result);
    }

    // PATCH /api/admin/users/{userId}
    [HttpPatch("{userId}")]
    public async Task<ActionResult<AdminUserDetailDto>> UpdateUser(Guid userId, [FromBody] UpdateAdminUserRequest req)
    {
        try
        {
            var result = await _mediator.Send(new UpdateAdminUserCommand(
                CurrentUserId, userId, req.FullName, req.Username, req.Phone,
                req.AvatarUrl, req.Gender, req.DateOfBirth, req.Reason, ClientIp));
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PATCH /api/admin/users/{userId}/role
    [HttpPatch("{userId}/role")]
    public async Task<ActionResult> ChangeRole(Guid userId, [FromBody] ChangeRoleRequest req)
    {
        var ok = await _mediator.Send(new ChangeUserRoleCommand(CurrentUserId, userId, req.Role, req.Reason, ClientIp));
        if (!ok) return NotFound();
        return NoContent();
    }

    // POST /api/admin/users/{userId}/lock
    [HttpPost("{userId}/lock")]
    public async Task<ActionResult> LockUser(Guid userId, [FromBody] ReasonRequest req)
    {
        var ok = await _mediator.Send(new LockUserCommand(CurrentUserId, userId, req.Reason, ClientIp));
        if (!ok) return NotFound();
        return NoContent();
    }

    // POST /api/admin/users/{userId}/unlock
    [HttpPost("{userId}/unlock")]
    public async Task<ActionResult> UnlockUser(Guid userId, [FromBody] ReasonRequest req)
    {
        var ok = await _mediator.Send(new UnlockUserCommand(CurrentUserId, userId, req.Reason, ClientIp));
        if (!ok) return NotFound();
        return NoContent();
    }

    // DELETE /api/admin/users/{userId}
    [HttpDelete("{userId}")]
    public async Task<ActionResult> DeleteUser(Guid userId, [FromBody] ReasonRequest req)
    {
        var ok = await _mediator.Send(new DeleteAdminUserCommand(CurrentUserId, userId, req.Reason, ClientIp));
        if (!ok) return NotFound();
        return NoContent();
    }

    // POST /api/admin/users/{userId}/restore
    [HttpPost("{userId}/restore")]
    public async Task<ActionResult> RestoreUser(Guid userId, [FromBody] ReasonRequest req)
    {
        var ok = await _mediator.Send(new RestoreAdminUserCommand(CurrentUserId, userId, req.Reason, ClientIp));
        if (!ok) return NotFound();
        return NoContent();
    }

    // POST /api/admin/users/{userId}/force-password-change
    [HttpPost("{userId}/force-password-change")]
    public async Task<ActionResult> ForcePasswordChange(Guid userId)
    {
        var ok = await _mediator.Send(new ForcePasswordChangeCommand(CurrentUserId, userId, ClientIp));
        if (!ok) return NotFound();
        return NoContent();
    }

    // GET /api/admin/users/{userId}/sessions
    [HttpGet("{userId}/sessions")]
    public async Task<ActionResult<List<AdminSessionDto>>> GetSessions(Guid userId)
    {
        var result = await _mediator.Send(new GetAdminUserSessionsQuery(userId));
        return Ok(result);
    }

    // DELETE /api/admin/users/{userId}/sessions/{sessionId}
    [HttpDelete("{userId}/sessions/{sessionId}")]
    public async Task<ActionResult> RevokeSession(Guid userId, Guid sessionId)
    {
        var ok = await _mediator.Send(new RevokeSessionCommand(CurrentUserId, userId, sessionId, ClientIp));
        if (!ok) return NotFound();
        return NoContent();
    }

    // DELETE /api/admin/users/{userId}/sessions
    [HttpDelete("{userId}/sessions")]
    public async Task<ActionResult> RevokeAllSessions(Guid userId)
    {
        var count = await _mediator.Send(new RevokeAllSessionsCommand(CurrentUserId, userId, ClientIp));
        return Ok(new { revokedCount = count });
    }

    // GET /api/admin/users/{userId}/warnings
    [HttpGet("{userId}/warnings")]
    public async Task<ActionResult<List<AdminUserWarningDto>>> GetWarnings(Guid userId)
    {
        var result = await _mediator.Send(new GetAdminUserWarningsQuery(userId));
        return Ok(result);
    }

    // POST /api/admin/users/{userId}/warn
    [HttpPost("{userId}/warn")]
    public async Task<ActionResult> WarnUser(Guid userId, [FromBody] WarnUserRequest req)
    {
        var ok = await _mediator.Send(new WarnUserCommand(CurrentUserId, userId, req.Type, req.Title, req.Message, ClientIp));
        if (!ok) return NotFound();
        return NoContent();
    }

    // GET /api/admin/users/{userId}/reports
    [HttpGet("{userId}/reports")]
    public async Task<ActionResult<List<AdminUserReportDto>>> GetReports(Guid userId)
    {
        var result = await _mediator.Send(new GetAdminUserReportsQuery(userId));
        return Ok(result);
    }

    // GET /api/admin/users/{userId}/audit-logs
    [HttpGet("{userId}/audit-logs")]
    public async Task<ActionResult<PaginatedDto<AuditLogDto>>> GetUserAuditLogs(Guid userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetAuditLogsQuery(userId, pageNumber, pageSize));
        return Ok(result);
    }

    // POST /api/admin/users/bulk-action
    [HttpPost("bulk-action")]
    public async Task<ActionResult> BulkAction([FromBody] BulkActionRequest req)
    {
        var count = await _mediator.Send(new BulkActionCommand(CurrentUserId, req.UserIds, req.Action, req.Reason, ClientIp));
        return Ok(new { affectedCount = count });
    }

    // POST /api/admin/users/{userId}/roles - Assign roles to user
    [HttpPost("{userId:guid}/roles")]
    public async Task<IActionResult> AssignUserRoles(Guid userId, [FromBody] AssignUserRolesRequest request)
    {
        try
        {
            var result = await _mediator.Send(new AssignUserRolesCommand(CurrentUserId, userId, request.RoleIds));
            return result ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/admin/users/{userId}/effective-permissions - Get union of all permissions
    [HttpGet("{userId:guid}/effective-permissions")]
    public async Task<IActionResult> GetEffectivePermissions(Guid userId)
    {
        var result = await _mediator.Send(new GetUserEffectivePermissionsQuery(userId));
        return Ok(result);
    }
}

[ApiController]
[Route("api/admin/dashboard")]
[Authorize]
public class AdminDashboardController : ControllerBase
{
    private readonly IMediator _mediator;
    public AdminDashboardController(IMediator mediator) => _mediator = mediator;

    // GET /api/admin/dashboard/metrics
    [HttpGet("metrics")]
    public async Task<ActionResult<AdminDashboardMetricsDto>> GetMetrics()
    {
        var result = await _mediator.Send(new GetAdminDashboardMetricsQuery());
        return Ok(result);
    }
}

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize]
public class AuditLogsController : ControllerBase
{
    private readonly IMediator _mediator;
    public AuditLogsController(IMediator mediator) => _mediator = mediator;

    // GET /api/admin/audit-logs
    [HttpGet]
    public async Task<ActionResult<PaginatedDto<AuditLogDto>>> GetAuditLogs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _mediator.Send(new GetAuditLogsQuery(null, pageNumber, pageSize));
        return Ok(result);
    }
}

// ─── Request Records ──────────────────────────────────────────────

public record CreateAdminUserRequest(string Email, string Password, string DisplayName, string? FullName, string? Username, string? Phone, string Role, string Status);
public record UpdateAdminUserRequest(string? FullName, string? Username, string? Phone, string? AvatarUrl, string? Gender, DateTimeOffset? DateOfBirth, string? Reason);
public record ChangeRoleRequest(string Role, string? Reason);
public record ReasonRequest(string? Reason);
public record WarnUserRequest(string Type, string Title, string Message);
public record BulkActionRequest(List<Guid> UserIds, string Action, string? Reason);
