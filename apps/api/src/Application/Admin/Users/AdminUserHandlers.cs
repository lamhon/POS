using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PersonalOs.Application.Admin.DTOs;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Common.Models;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Admin.Users;

// ─── Helpers ──────────────────────────────────────────────

internal static class AdminUserMapper
{
    public static AdminUserListDto ToListDto(User u) =>
        new(u.Id, u.Email, u.DisplayName, u.FullName, u.Username, u.Phone, u.AvatarUrl,
            u.Status.ToString(),
            u.UserRoles.FirstOrDefault()?.Role.Name,
            u.EmailVerifiedAt.HasValue,
            u.LastLoginAt, u.CreatedAt);

    public static AdminUserDetailDto ToDetailDto(User u) =>
        new(u.Id, u.Email, u.DisplayName, u.FullName, u.Username, u.Phone, u.AvatarUrl,
            u.Gender, u.DateOfBirth, u.Status.ToString(),
            u.UserRoles.FirstOrDefault()?.Role.Name,
            u.EmailVerifiedAt.HasValue, u.PhoneVerifiedAt.HasValue,
            u.MustChangePassword, u.LastLoginAt, u.CreatedAt, u.UpdatedAt);
}

// ─── Queries ──────────────────────────────────────────────

public record GetAdminUsersQuery(
    string? Search = null,
    string? Role = null,
    string? Status = null,
    bool? Verified = null,
    DateTimeOffset? CreatedFrom = null,
    DateTimeOffset? CreatedTo = null,
    string SortBy = "createdAt",
    string SortDirection = "desc",
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<PaginatedDto<AdminUserListDto>>;

public class GetAdminUsersQueryHandler : IRequestHandler<GetAdminUsersQuery, PaginatedDto<AdminUserListDto>>
{
    private readonly IApplicationDbContext _context;
    public GetAdminUsersQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedDto<AdminUserListDto>> Handle(GetAdminUsersQuery request, CancellationToken ct)
    {
        var query = _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => !u.IsDeleted || request.Status == "Deleted");

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(s) ||
                u.DisplayName.ToLower().Contains(s) ||
                (u.FullName != null && u.FullName.ToLower().Contains(s)) ||
                (u.Username != null && u.Username.ToLower().Contains(s)) ||
                (u.Phone != null && u.Phone.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(request.Status) && request.Status != "All")
        {
            if (request.Status == "Deleted")
            {
                query = query.Where(u => u.IsDeleted);
            }
            else if (Enum.TryParse<UserStatus>(request.Status, out var statusEnum))
            {
                query = query.Where(u => u.Status == statusEnum);
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Role))
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == request.Role));

        if (request.Verified.HasValue)
        {
            if (request.Verified.Value) query = query.Where(u => u.EmailVerifiedAt != null);
            else query = query.Where(u => u.EmailVerifiedAt == null);
        }

        if (request.CreatedFrom.HasValue) query = query.Where(u => u.CreatedAt >= request.CreatedFrom.Value);
        if (request.CreatedTo.HasValue) query = query.Where(u => u.CreatedAt <= request.CreatedTo.Value);

        query = (request.SortBy, request.SortDirection.ToLower()) switch
        {
            ("email", "asc") => query.OrderBy(u => u.Email),
            ("email", _) => query.OrderByDescending(u => u.Email),
            ("name", "asc") => query.OrderBy(u => u.DisplayName),
            ("name", _) => query.OrderByDescending(u => u.DisplayName),
            ("lastLogin", "asc") => query.OrderBy(u => u.LastLoginAt),
            ("lastLogin", _) => query.OrderByDescending(u => u.LastLoginAt),
            ("createdAt", "asc") => query.OrderBy(u => u.CreatedAt),
            _ => query.OrderByDescending(u => u.CreatedAt),
        };

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => AdminUserMapper.ToListDto(u))
            .ToListAsync(ct);

        return new PaginatedDto<AdminUserListDto>(
            items,
            request.PageNumber,
            request.PageSize,
            total,
            (int)Math.Ceiling(total / (double)request.PageSize)
        );
    }
}

public record GetAdminUserDetailQuery(Guid UserId) : IRequest<AdminUserDetailDto?>;

public class GetAdminUserDetailQueryHandler : IRequestHandler<GetAdminUserDetailQuery, AdminUserDetailDto?>
{
    private readonly IApplicationDbContext _context;
    public GetAdminUserDetailQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<AdminUserDetailDto?> Handle(GetAdminUserDetailQuery request, CancellationToken ct)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == request.UserId, ct);
        return user == null ? null : AdminUserMapper.ToDetailDto(user);
    }
}

public record GetAdminUserSessionsQuery(Guid UserId) : IRequest<List<AdminSessionDto>>;

public class GetAdminUserSessionsQueryHandler : IRequestHandler<GetAdminUserSessionsQuery, List<AdminSessionDto>>
{
    private readonly IApplicationDbContext _context;
    public GetAdminUserSessionsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<AdminSessionDto>> Handle(GetAdminUserSessionsQuery request, CancellationToken ct)
    {
        return await _context.RefreshTokens
            .Where(rt => rt.UserId == request.UserId && rt.RevokedAt == null && rt.ExpiresAt > DateTimeOffset.UtcNow)
            .OrderByDescending(rt => rt.LastActiveAt)
            .Select(rt => new AdminSessionDto(rt.Id, rt.Device, rt.Browser, rt.Os, rt.IpAddress, rt.LastActiveAt, rt.ExpiresAt, rt.IsActive, rt.CreatedAt))
            .ToListAsync(ct);
    }
}

public record GetAdminUserWarningsQuery(Guid UserId) : IRequest<List<AdminUserWarningDto>>;

public class GetAdminUserWarningsQueryHandler : IRequestHandler<GetAdminUserWarningsQuery, List<AdminUserWarningDto>>
{
    private readonly IApplicationDbContext _context;
    public GetAdminUserWarningsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<AdminUserWarningDto>> Handle(GetAdminUserWarningsQuery request, CancellationToken ct)
    {
        return await _context.UserWarnings
            .Where(w => w.UserId == request.UserId && !w.IsDeleted)
            .OrderByDescending(w => w.CreatedAt)
            .Select(w => new AdminUserWarningDto(w.Id, w.Type, w.Title, w.Message, w.CreatedByName, w.CreatedAt))
            .ToListAsync(ct);
    }
}

public record GetAdminUserReportsQuery(Guid UserId) : IRequest<List<AdminUserReportDto>>;

public class GetAdminUserReportsQueryHandler : IRequestHandler<GetAdminUserReportsQuery, List<AdminUserReportDto>>
{
    private readonly IApplicationDbContext _context;
    public GetAdminUserReportsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<AdminUserReportDto>> Handle(GetAdminUserReportsQuery request, CancellationToken ct)
    {
        return await _context.UserReports
            .Include(r => r.Reporter)
            .Where(r => r.TargetUserId == request.UserId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new AdminUserReportDto(r.Id, r.Reporter.Email, r.ReasonCode, r.Description, r.Status, r.Resolution, r.CreatedAt, r.ResolvedAt))
            .ToListAsync(ct);
    }
}

public record GetAuditLogsQuery(Guid? TargetUserId = null, int PageNumber = 1, int PageSize = 20)
    : IRequest<PaginatedDto<AuditLogDto>>;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, PaginatedDto<AuditLogDto>>
{
    private readonly IApplicationDbContext _context;
    public GetAuditLogsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedDto<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken ct)
    {
        var query = _context.AuditLogs
            .Include(a => a.AdminUser)
            .AsQueryable();

        if (request.TargetUserId.HasValue)
            query = query.Where(a => a.TargetId == request.TargetUserId.Value.ToString());

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AuditLogDto(a.Id, a.AdminUser.Email, a.AdminRole, a.Action, a.TargetType, a.TargetId, a.BeforeData, a.AfterData, a.Reason, a.IpAddress, a.CreatedAt))
            .ToListAsync(ct);

        return new PaginatedDto<AuditLogDto>(
            items,
            request.PageNumber,
            request.PageSize,
            total,
            (int)Math.Ceiling(total / (double)request.PageSize)
        );
    }
}

public record GetAdminDashboardMetricsQuery : IRequest<AdminDashboardMetricsDto>;

public class GetAdminDashboardMetricsQueryHandler : IRequestHandler<GetAdminDashboardMetricsQuery, AdminDashboardMetricsDto>
{
    private readonly IApplicationDbContext _context;
    public GetAdminDashboardMetricsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<AdminDashboardMetricsDto> Handle(GetAdminDashboardMetricsQuery request, CancellationToken ct)
    {
        var today = DateTimeOffset.UtcNow.Date;
        var thisMonthStart = new DateTimeOffset(today.Year, today.Month, 1, 0, 0, 0, TimeSpan.Zero);

        var total = await _context.Users.CountAsync(ct);
        var active = await _context.Users.CountAsync(u => !u.IsDeleted && u.Status == UserStatus.Active, ct);
        var pending = await _context.Users.CountAsync(u => !u.IsDeleted && u.Status == UserStatus.Pending, ct);
        var locked = await _context.Users.CountAsync(u => !u.IsDeleted && u.Status == UserStatus.Locked, ct);
        var deleted = await _context.Users.CountAsync(u => u.IsDeleted, ct);
        var newToday = await _context.Users.CountAsync(u => u.CreatedAt >= today, ct);
        var newThisMonth = await _context.Users.CountAsync(u => u.CreatedAt >= thisMonthStart, ct);
        var unverified = await _context.Users.CountAsync(u => !u.IsDeleted && u.EmailVerifiedAt == null, ct);

        return new AdminDashboardMetricsDto(total, active, pending, locked, deleted, newToday, newThisMonth, unverified);
    }
}

// ─── Commands ──────────────────────────────────────────────

public record UpdateAdminUserCommand(
    Guid AdminUserId, Guid TargetUserId,
    string? FullName, string? Username, string? Phone,
    string? AvatarUrl, string? Gender, DateTimeOffset? DateOfBirth,
    string? Reason = null, string? IpAddress = null
) : IRequest<AdminUserDetailDto?>;

public class UpdateAdminUserCommandHandler : IRequestHandler<UpdateAdminUserCommand, AdminUserDetailDto?>
{
    private readonly IApplicationDbContext _context;
    public UpdateAdminUserCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<AdminUserDetailDto?> Handle(UpdateAdminUserCommand req, CancellationToken ct)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == req.TargetUserId, ct);
        if (user == null) return null;

        if (!string.IsNullOrWhiteSpace(req.Username) && req.Username != user.Username)
        {
            var usernameExists = await _context.Users.AnyAsync(u => u.Id != req.TargetUserId && u.Username != null && u.Username.ToLower() == req.Username.ToLower() && !u.IsDeleted, ct);
            if (usernameExists)
            {
                throw new InvalidOperationException("Username is already taken.");
            }
        }

        if (!string.IsNullOrWhiteSpace(req.Phone) && req.Phone != user.Phone)
        {
            var phoneExists = await _context.Users.AnyAsync(u => u.Id != req.TargetUserId && u.Phone != null && u.Phone == req.Phone && !u.IsDeleted, ct);
            if (phoneExists)
            {
                throw new InvalidOperationException("Phone number is already registered.");
            }
        }

        var before = System.Text.Json.JsonSerializer.Serialize(new { user.FullName, user.Username, user.Phone, user.Gender });
        if (req.FullName != null) user.FullName = req.FullName;
        if (req.Username != null) user.Username = req.Username;
        if (req.Phone != null) user.Phone = req.Phone;
        if (req.AvatarUrl != null) user.AvatarUrl = req.AvatarUrl;
        if (req.Gender != null) user.Gender = req.Gender;
        if (req.DateOfBirth.HasValue) user.DateOfBirth = req.DateOfBirth;
        var after = System.Text.Json.JsonSerializer.Serialize(new { user.FullName, user.Username, user.Phone, user.Gender });

        await WriteAuditLog(req.AdminUserId, "USER_UPDATED", user.Id.ToString(), before, after, req.Reason, req.IpAddress, ct);
        await _context.SaveChangesAsync(ct);
        return AdminUserMapper.ToDetailDto(user);
    }

    private async Task WriteAuditLog(Guid adminId, string action, string targetId, string? before, string? after, string? reason, string? ip, CancellationToken ct)
    {
        var admin = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == adminId, ct);
        _context.AuditLogs.Add(new AuditLog
        {
            AdminUserId = adminId,
            AdminRole = admin?.UserRoles.FirstOrDefault()?.Role.Name ?? "Admin",
            Action = action,
            TargetId = targetId,
            BeforeData = before,
            AfterData = after,
            Reason = reason,
            IpAddress = ip,
        });
    }
}

public record ChangeUserRoleCommand(Guid AdminUserId, Guid TargetUserId, string NewRole, string? Reason, string? IpAddress) : IRequest<bool>;

public class ChangeUserRoleCommandHandler : IRequestHandler<ChangeUserRoleCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public ChangeUserRoleCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(ChangeUserRoleCommand req, CancellationToken ct)
    {
        var user = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == req.TargetUserId, ct);
        if (user == null) return false;

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == req.NewRole, ct);
        if (role == null) return false;

        var oldRole = user.UserRoles.FirstOrDefault()?.Role.Name ?? "None";
        // Remove existing roles and assign new one
        var existing = _context.UserRoles.Where(ur => ur.UserId == req.TargetUserId);
        _context.UserRoles.RemoveRange(existing);
        _context.UserRoles.Add(new UserRole { UserId = req.TargetUserId, RoleId = role.Id });

        var admin = await _context.Users.FirstOrDefaultAsync(u => u.Id == req.AdminUserId, ct);
        _context.AuditLogs.Add(new AuditLog
        {
            AdminUserId = req.AdminUserId,
            AdminRole = "Admin",
            Action = "USER_ROLE_CHANGED",
            TargetId = req.TargetUserId.ToString(),
            BeforeData = oldRole,
            AfterData = req.NewRole,
            Reason = req.Reason,
            IpAddress = req.IpAddress,
        });

        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record LockUserCommand(Guid AdminUserId, Guid TargetUserId, string? Reason, string? IpAddress) : IRequest<bool>;

public class LockUserCommandHandler : IRequestHandler<LockUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public LockUserCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(LockUserCommand req, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == req.TargetUserId && !u.IsDeleted, ct);
        if (user == null) return false;

        user.Status = UserStatus.Locked;
        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "USER_LOCKED", TargetId = req.TargetUserId.ToString(), Reason = req.Reason, IpAddress = req.IpAddress });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record UnlockUserCommand(Guid AdminUserId, Guid TargetUserId, string? Reason, string? IpAddress) : IRequest<bool>;

public class UnlockUserCommandHandler : IRequestHandler<UnlockUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public UnlockUserCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(UnlockUserCommand req, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == req.TargetUserId && !u.IsDeleted, ct);
        if (user == null) return false;

        user.Status = UserStatus.Active;
        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "USER_UNLOCKED", TargetId = req.TargetUserId.ToString(), Reason = req.Reason, IpAddress = req.IpAddress });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record DeleteAdminUserCommand(Guid AdminUserId, Guid TargetUserId, string? Reason, string? IpAddress) : IRequest<bool>;

public class DeleteAdminUserCommandHandler : IRequestHandler<DeleteAdminUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public DeleteAdminUserCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(DeleteAdminUserCommand req, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == req.TargetUserId && !u.IsDeleted, ct);
        if (user == null) return false;

        user.IsDeleted = true;
        user.DeletedAt = DateTimeOffset.UtcNow;
        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "USER_DELETED", TargetId = req.TargetUserId.ToString(), Reason = req.Reason, IpAddress = req.IpAddress });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record RestoreAdminUserCommand(Guid AdminUserId, Guid TargetUserId, string? Reason, string? IpAddress) : IRequest<bool>;

public class RestoreAdminUserCommandHandler : IRequestHandler<RestoreAdminUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public RestoreAdminUserCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(RestoreAdminUserCommand req, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == req.TargetUserId && u.IsDeleted, ct);
        if (user == null) return false;

        user.IsDeleted = false;
        user.DeletedAt = null;
        user.Status = UserStatus.Active;
        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "USER_RESTORED", TargetId = req.TargetUserId.ToString(), Reason = req.Reason, IpAddress = req.IpAddress });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record ForcePasswordChangeCommand(Guid AdminUserId, Guid TargetUserId, string? IpAddress) : IRequest<bool>;

public class ForcePasswordChangeCommandHandler : IRequestHandler<ForcePasswordChangeCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public ForcePasswordChangeCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(ForcePasswordChangeCommand req, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == req.TargetUserId && !u.IsDeleted, ct);
        if (user == null) return false;

        user.MustChangePassword = true;
        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "PASSWORD_CHANGE_FORCED", TargetId = req.TargetUserId.ToString(), IpAddress = req.IpAddress });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record RevokeSessionCommand(Guid AdminUserId, Guid TargetUserId, Guid SessionId, string? IpAddress) : IRequest<bool>;

public class RevokeSessionCommandHandler : IRequestHandler<RevokeSessionCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public RevokeSessionCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(RevokeSessionCommand req, CancellationToken ct)
    {
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Id == req.SessionId && rt.UserId == req.TargetUserId, ct);
        if (token == null) return false;

        token.RevokedAt = DateTimeOffset.UtcNow;
        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "SESSION_REVOKED", TargetId = req.TargetUserId.ToString(), IpAddress = req.IpAddress });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record RevokeAllSessionsCommand(Guid AdminUserId, Guid TargetUserId, string? IpAddress) : IRequest<int>;

public class RevokeAllSessionsCommandHandler : IRequestHandler<RevokeAllSessionsCommand, int>
{
    private readonly IApplicationDbContext _context;
    public RevokeAllSessionsCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<int> Handle(RevokeAllSessionsCommand req, CancellationToken ct)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == req.TargetUserId && rt.RevokedAt == null)
            .ToListAsync(ct);

        foreach (var t in tokens) t.RevokedAt = DateTimeOffset.UtcNow;
        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "ALL_SESSIONS_REVOKED", TargetId = req.TargetUserId.ToString(), IpAddress = req.IpAddress });
        await _context.SaveChangesAsync(ct);
        return tokens.Count;
    }
}

public record WarnUserCommand(Guid AdminUserId, Guid TargetUserId, string Type, string Title, string Message, string? IpAddress) : IRequest<bool>;

public class WarnUserCommandHandler : IRequestHandler<WarnUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public WarnUserCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(WarnUserCommand req, CancellationToken ct)
    {
        var admin = await _context.Users.FirstOrDefaultAsync(u => u.Id == req.AdminUserId, ct);
        _context.UserWarnings.Add(new UserWarning
        {
            UserId = req.TargetUserId,
            Type = req.Type,
            Title = req.Title,
            Message = req.Message,
            CreatedByName = admin?.DisplayName ?? "Admin"
        });
        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "USER_WARNED", TargetId = req.TargetUserId.ToString(), AfterData = req.Title, IpAddress = req.IpAddress });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record BulkActionCommand(Guid AdminUserId, List<Guid> UserIds, string Action, string? Reason, string? IpAddress) : IRequest<int>;

public class BulkActionCommandHandler : IRequestHandler<BulkActionCommand, int>
{
    private readonly IMediator _mediator;
    public BulkActionCommandHandler(IMediator mediator) => _mediator = mediator;

    public async Task<int> Handle(BulkActionCommand req, CancellationToken ct)
    {
        var count = 0;
        foreach (var userId in req.UserIds)
        {
            var success = req.Action switch
            {
                "lock" => await _mediator.Send(new LockUserCommand(req.AdminUserId, userId, req.Reason, req.IpAddress), ct),
                "unlock" => await _mediator.Send(new UnlockUserCommand(req.AdminUserId, userId, req.Reason, req.IpAddress), ct),
                "delete" => await _mediator.Send(new DeleteAdminUserCommand(req.AdminUserId, userId, req.Reason, req.IpAddress), ct),
                _ => false
            };
            if (success) count++;
        }
        return count;
    }
}
