using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Admin.DTOs;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Common.Models;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Admin.Roles;

// ─── Helpers ──────────────────────────────────────────────

internal static class RoleMapper
{
    public static RoleListDto ToListDto(Role r, int userCount) =>
        new(r.Id, r.Name, r.Description, r.Icon, r.Color,
            r.Type.ToString(), r.Status.ToString(),
            userCount, r.RolePermissions.Count,
            r.CreatedAt, r.UpdatedAt);

    public static RoleDetailDto ToDetailDto(Role r, int userCount) =>
        new(r.Id, r.Name, r.Description, r.Icon, r.Color,
            r.Type.ToString(), r.Status.ToString(),
            r.RolePermissions.Select(rp => new RolePermissionDto(
                rp.PermissionId, rp.Permission.Name,
                rp.Permission.Module, rp.Permission.Resource, rp.Permission.Action,
                rp.Scope.ToString())).ToList(),
            userCount, r.CreatedAt, r.UpdatedAt);
}

// ─── Queries ──────────────────────────────────────────────

public record GetRolesQuery(
    string? Search = null,
    string? Type = null,
    string? Status = null,
    int PageNumber = 1,
    int PageSize = 20
) : IRequest<PaginatedDto<RoleListDto>>;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, PaginatedDto<RoleListDto>>
{
    private readonly IApplicationDbContext _context;
    public GetRolesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedDto<RoleListDto>> Handle(GetRolesQuery request, CancellationToken ct)
    {
        var query = _context.Roles
            .Include(r => r.RolePermissions)
            .Include(r => r.UserRoles)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(r => r.Name.ToLower().Contains(s) || r.Description.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(request.Type) && Enum.TryParse<RoleType>(request.Type, out var typeEnum))
            query = query.Where(r => r.Type == typeEnum);

        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<RoleStatus>(request.Status, out var statusEnum))
            query = query.Where(r => r.Status == statusEnum);

        var total = await query.CountAsync(ct);
        var roles = await query
            .OrderBy(r => r.Type).ThenBy(r => r.Name)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        var items = roles.Select(r => RoleMapper.ToListDto(r, r.UserRoles.Count)).ToList();

        return new PaginatedDto<RoleListDto>(items, request.PageNumber, request.PageSize, total,
            (int)Math.Ceiling(total / (double)request.PageSize));
    }
}

public record GetRoleByIdQuery(Guid RoleId) : IRequest<RoleDetailDto?>;

public class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, RoleDetailDto?>
{
    private readonly IApplicationDbContext _context;
    public GetRoleByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<RoleDetailDto?> Handle(GetRoleByIdQuery request, CancellationToken ct)
    {
        var role = await _context.Roles
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.Id == request.RoleId, ct);

        return role == null ? null : RoleMapper.ToDetailDto(role, role.UserRoles.Count);
    }
}

public record GetPermissionsQuery : IRequest<List<PermissionGroupDto>>;

public class GetPermissionsQueryHandler : IRequestHandler<GetPermissionsQuery, List<PermissionGroupDto>>
{
    private readonly IApplicationDbContext _context;
    public GetPermissionsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<PermissionGroupDto>> Handle(GetPermissionsQuery request, CancellationToken ct)
    {
        var permissions = await _context.Permissions.ToListAsync(ct);
        
        // Ensure legacy or unpopulated fields fall back to parsing Name (module.resource.action)
        var mapped = permissions.Select(p =>
        {
            var parts = p.Name.Split('.');
            var mod = !string.IsNullOrWhiteSpace(p.Module) ? p.Module : (parts.Length > 0 ? parts[0] : "general");
            var res = !string.IsNullOrWhiteSpace(p.Resource) ? p.Resource : (parts.Length > 1 ? parts[1] : "general");
            var act = !string.IsNullOrWhiteSpace(p.Action) ? p.Action : (parts.Length > 2 ? parts[2] : p.Name);
            return new { p.Id, p.Name, Module = mod, Resource = res, Action = act, p.Description };
        }).OrderBy(p => p.Module).ThenBy(p => p.Resource).ThenBy(p => p.Action);

        return mapped
            .GroupBy(p => p.Module)
            .Select(mg => new PermissionGroupDto(
                mg.Key,
                mg.GroupBy(p => p.Resource)
                  .Select(rg => new PermissionResourceDto(
                      rg.Key,
                      rg.Select(p => new PermissionItemDto(p.Id, p.Name, p.Action, p.Description)).ToList()
                  )).ToList()
            )).ToList();
    }
}

public record GetUserEffectivePermissionsQuery(Guid UserId) : IRequest<List<EffectivePermissionDto>>;

public class GetUserEffectivePermissionsQueryHandler : IRequestHandler<GetUserEffectivePermissionsQuery, List<EffectivePermissionDto>>
{
    private readonly IApplicationDbContext _context;
    public GetUserEffectivePermissionsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<EffectivePermissionDto>> Handle(GetUserEffectivePermissionsQuery request, CancellationToken ct)
    {
        var userRoles = await _context.UserRoles
            .Include(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .Where(ur => ur.UserId == request.UserId)
            .ToListAsync(ct);

        var effectivePerms = new Dictionary<string, (PermissionScope scope, List<string> roles)>();

        foreach (var ur in userRoles)
        {
            foreach (var rp in ur.Role.RolePermissions)
            {
                var permName = rp.Permission.Name;
                if (!effectivePerms.TryGetValue(permName, out var existing))
                    effectivePerms[permName] = (rp.Scope, new List<string> { ur.Role.Name });
                else
                {
                    // Take the widest scope (All > Workspace > Department > Team > Assigned > Own > Custom)
                    if ((int)rp.Scope < (int)existing.scope)
                        effectivePerms[permName] = (rp.Scope, existing.roles);
                    existing.roles.Add(ur.Role.Name);
                }
            }
        }

        return effectivePerms.Select(kvp => new EffectivePermissionDto(
            kvp.Key,
            kvp.Value.roles.Count > 0 ? string.Empty : string.Empty, // resolved from perm
            string.Empty, string.Empty,
            kvp.Value.scope.ToString(),
            kvp.Value.roles
        )).ToList();
    }
}

// ─── Commands ──────────────────────────────────────────────

public record CreateRoleCommand(
    Guid AdminUserId,
    string Name,
    string? Description,
    string? Icon,
    string? Color,
    List<RolePermissionInputDto>? Permissions
) : IRequest<RoleDetailDto>;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, RoleDetailDto>
{
    private readonly IApplicationDbContext _context;
    public CreateRoleCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<RoleDetailDto> Handle(CreateRoleCommand req, CancellationToken ct)
    {
        var exists = await _context.Roles.AnyAsync(r => r.NormalizedName == req.Name.ToUpperInvariant(), ct);
        if (exists) throw new InvalidOperationException($"Role '{req.Name}' already exists.");

        var role = new Role
        {
            Name = req.Name,
            NormalizedName = req.Name.ToUpperInvariant(),
            Description = req.Description ?? string.Empty,
            Icon = req.Icon,
            Color = req.Color,
            Type = RoleType.Custom,
            Status = RoleStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = req.AdminUserId.ToString()
        };
        _context.Roles.Add(role);

        if (req.Permissions != null)
        {
            foreach (var p in req.Permissions)
            {
                if (!Enum.TryParse<PermissionScope>(p.Scope, out var scope)) scope = PermissionScope.All;
                _context.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = p.PermissionId, Scope = scope });
            }
        }

        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "ROLE_CREATED", TargetType = "Role", TargetId = role.Id.ToString(), AfterData = role.Name });
        await _context.SaveChangesAsync(ct);

        var created = await _context.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).Include(r => r.UserRoles)
            .FirstAsync(r => r.Id == role.Id, ct);
        return RoleMapper.ToDetailDto(created, 0);
    }
}

public record UpdateRoleCommand(
    Guid AdminUserId,
    Guid RoleId,
    string? Name,
    string? Description,
    string? Icon,
    string? Color,
    List<RolePermissionInputDto>? Permissions
) : IRequest<RoleDetailDto?>;

public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, RoleDetailDto?>
{
    private readonly IApplicationDbContext _context;
    public UpdateRoleCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<RoleDetailDto?> Handle(UpdateRoleCommand req, CancellationToken ct)
    {
        var role = await _context.Roles.Include(r => r.RolePermissions).Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.Id == req.RoleId, ct);
        if (role == null) return null;

        var before = role.Name;
        if (req.Name != null)
        {
            // Prevent renaming SYSTEM roles core names
            if (role.Type == RoleType.System && req.Name != role.Name)
                throw new InvalidOperationException("Cannot rename a system role.");
            role.Name = req.Name;
            role.NormalizedName = req.Name.ToUpperInvariant();
        }
        if (req.Description != null) role.Description = req.Description;
        if (req.Icon != null) role.Icon = req.Icon;
        if (req.Color != null) role.Color = req.Color;
        role.UpdatedAt = DateTimeOffset.UtcNow;
        role.UpdatedBy = req.AdminUserId.ToString();

        if (req.Permissions != null)
        {
            var existing = _context.RolePermissions.Where(rp => rp.RoleId == req.RoleId);
            _context.RolePermissions.RemoveRange(existing);
            foreach (var p in req.Permissions)
            {
                if (!Enum.TryParse<PermissionScope>(p.Scope, out var scope)) scope = PermissionScope.All;
                _context.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = p.PermissionId, Scope = scope });
            }
        }

        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "ROLE_UPDATED", TargetType = "Role", TargetId = role.Id.ToString(), BeforeData = before, AfterData = role.Name });
        await _context.SaveChangesAsync(ct);

        var updated = await _context.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).Include(r => r.UserRoles)
            .FirstAsync(r => r.Id == req.RoleId, ct);
        return RoleMapper.ToDetailDto(updated, updated.UserRoles.Count);
    }
}

public record DuplicateRoleCommand(Guid AdminUserId, Guid RoleId, string NewName) : IRequest<RoleDetailDto?>;

public class DuplicateRoleCommandHandler : IRequestHandler<DuplicateRoleCommand, RoleDetailDto?>
{
    private readonly IApplicationDbContext _context;
    public DuplicateRoleCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<RoleDetailDto?> Handle(DuplicateRoleCommand req, CancellationToken ct)
    {
        var source = await _context.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Id == req.RoleId, ct);
        if (source == null) return null;

        var exists = await _context.Roles.AnyAsync(r => r.NormalizedName == req.NewName.ToUpperInvariant(), ct);
        if (exists) throw new InvalidOperationException($"Role '{req.NewName}' already exists.");

        var copy = new Role
        {
            Name = req.NewName,
            NormalizedName = req.NewName.ToUpperInvariant(),
            Description = source.Description,
            Icon = source.Icon,
            Color = source.Color,
            Type = RoleType.Custom,
            Status = RoleStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = req.AdminUserId.ToString()
        };
        _context.Roles.Add(copy);

        foreach (var rp in source.RolePermissions)
            _context.RolePermissions.Add(new RolePermission { RoleId = copy.Id, PermissionId = rp.PermissionId, Scope = rp.Scope });

        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "ROLE_DUPLICATED", TargetType = "Role", TargetId = copy.Id.ToString(), BeforeData = source.Name, AfterData = copy.Name });
        await _context.SaveChangesAsync(ct);

        var created = await _context.Roles.Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission).Include(r => r.UserRoles)
            .FirstAsync(r => r.Id == copy.Id, ct);
        return RoleMapper.ToDetailDto(created, 0);
    }
}

public record ArchiveRoleCommand(Guid AdminUserId, Guid RoleId) : IRequest<bool>;

public class ArchiveRoleCommandHandler : IRequestHandler<ArchiveRoleCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public ArchiveRoleCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(ArchiveRoleCommand req, CancellationToken ct)
    {
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == req.RoleId, ct);
        if (role == null) return false;
        if (role.Type == RoleType.System) throw new InvalidOperationException("Cannot archive a system role.");

        var before = role.Status.ToString();
        role.Status = role.Status == RoleStatus.Active ? RoleStatus.Archived : RoleStatus.Active;
        role.UpdatedAt = DateTimeOffset.UtcNow;

        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = role.Status == RoleStatus.Archived ? "ROLE_ARCHIVED" : "ROLE_RESTORED", TargetType = "Role", TargetId = role.Id.ToString(), BeforeData = before, AfterData = role.Status.ToString() });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record DeleteRoleCommand(Guid AdminUserId, Guid RoleId) : IRequest<bool>;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public DeleteRoleCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(DeleteRoleCommand req, CancellationToken ct)
    {
        var role = await _context.Roles.Include(r => r.UserRoles).FirstOrDefaultAsync(r => r.Id == req.RoleId, ct);
        if (role == null) return false;
        if (role.Type == RoleType.System) throw new InvalidOperationException("Cannot delete a system role.");
        if (role.UserRoles.Count > 0) throw new InvalidOperationException($"Cannot delete role '{role.Name}' because it is assigned to {role.UserRoles.Count} user(s). Remove all assignments first.");

        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "ROLE_DELETED", TargetType = "Role", TargetId = role.Id.ToString(), BeforeData = role.Name });
        _context.Roles.Remove(role);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record AssignUserRolesCommand(Guid AdminUserId, Guid TargetUserId, List<Guid> RoleIds) : IRequest<bool>;

public class AssignUserRolesCommandHandler : IRequestHandler<AssignUserRolesCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public AssignUserRolesCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(AssignUserRolesCommand req, CancellationToken ct)
    {
        var user = await _context.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == req.TargetUserId && !u.IsDeleted, ct);
        if (user == null) return false;

        // Validate all roles exist and are active
        var roles = await _context.Roles.Where(r => req.RoleIds.Contains(r.Id) && r.Status == RoleStatus.Active).ToListAsync(ct);
        if (roles.Count != req.RoleIds.Count) throw new InvalidOperationException("One or more roles not found or are archived.");

        var before = string.Join(", ", user.UserRoles.Select(ur => ur.RoleId));
        _context.UserRoles.RemoveRange(user.UserRoles);
        foreach (var roleId in req.RoleIds)
            _context.UserRoles.Add(new UserRole { UserId = req.TargetUserId, RoleId = roleId });

        _context.AuditLogs.Add(new AuditLog { AdminUserId = req.AdminUserId, AdminRole = "Admin", Action = "USER_ROLES_ASSIGNED", TargetType = "User", TargetId = req.TargetUserId.ToString(), BeforeData = before, AfterData = string.Join(", ", req.RoleIds) });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}
