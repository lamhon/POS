using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Tasks.Workspaces;

public record GetWorkspaceSettingsQuery(Guid CurrentUserId, Guid WorkspaceId) : IRequest<WorkspaceSettingsDto?>;
public record UpdateWorkspaceSettingsCommand(Guid CurrentUserId, Guid WorkspaceId, WorkspaceSettingsDto Settings) : IRequest<bool>;
public record GetResourcePermissionsQuery(Guid CurrentUserId, Guid WorkspaceId) : IRequest<List<ResourcePermissionDto>>;
public record SetResourcePermissionCommand(Guid CurrentUserId, Guid WorkspaceId, string ResourceType, Guid? ResourceId, Guid? TargetUserId, string? TargetRole, string AccessLevel) : IRequest<ResourcePermissionDto>;
public record RemoveResourcePermissionCommand(Guid CurrentUserId, Guid PermissionId) : IRequest<bool>;

public class WorkspacePermissionHandlers :
    IRequestHandler<GetWorkspaceSettingsQuery, WorkspaceSettingsDto?>,
    IRequestHandler<UpdateWorkspaceSettingsCommand, bool>,
    IRequestHandler<GetResourcePermissionsQuery, List<ResourcePermissionDto>>,
    IRequestHandler<SetResourcePermissionCommand, ResourcePermissionDto>,
    IRequestHandler<RemoveResourcePermissionCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public WorkspacePermissionHandlers(IApplicationDbContext context) => _context = context;

    public async Task<WorkspaceSettingsDto?> Handle(GetWorkspaceSettingsQuery request, CancellationToken cancellationToken)
    {
        var workspace = await _context.Workspaces
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == request.WorkspaceId, cancellationToken);
            
        if (workspace == null) return null;

        return new WorkspaceSettingsDto(
            workspace.CreatePagesPermission,
            workspace.CreateDatabasesPermission,
            workspace.CreateProjectsPermission,
            workspace.DeleteContentPermission,
            workspace.InviteMembersPermission,
            workspace.ManageSettingsPermission,
            workspace.ExportWorkspacePermission
        );
    }

    public async Task<bool> Handle(UpdateWorkspaceSettingsCommand request, CancellationToken cancellationToken)
    {
        var workspace = await _context.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(w => w.Id == request.WorkspaceId && !w.IsDeleted, cancellationToken);
            
        if (workspace == null) return false;

        var isCreator = workspace.UserId == request.CurrentUserId;
        var memberRole = workspace.Members.FirstOrDefault(m => m.UserId == request.CurrentUserId)?.Role;
        var canEdit = isCreator || memberRole == "Owner" || memberRole == "Admin";

        if (!canEdit)
        {
            throw new InvalidOperationException("You do not have permission to modify workspace settings. Only workspace Owners and Admins can update settings.");
        }

        workspace.CreatePagesPermission = request.Settings.CreatePagesPermission;
        workspace.CreateDatabasesPermission = request.Settings.CreateDatabasesPermission;
        workspace.CreateProjectsPermission = request.Settings.CreateProjectsPermission;
        workspace.DeleteContentPermission = request.Settings.DeleteContentPermission;
        workspace.InviteMembersPermission = request.Settings.InviteMembersPermission;
        workspace.ManageSettingsPermission = request.Settings.ManageSettingsPermission;
        workspace.ExportWorkspacePermission = request.Settings.ExportWorkspacePermission;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<List<ResourcePermissionDto>> Handle(GetResourcePermissionsQuery request, CancellationToken cancellationToken)
    {
        return await _context.ResourcePermissions
            .AsNoTracking()
            .Where(p => p.WorkspaceId == request.WorkspaceId)
            .Select(p => new ResourcePermissionDto(
                p.Id,
                p.WorkspaceId,
                p.ResourceType,
                p.ResourceId,
                p.UserId,
                p.Role,
                p.AccessLevel,
                p.CreatedAt
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<ResourcePermissionDto> Handle(SetResourcePermissionCommand request, CancellationToken cancellationToken)
    {
        var existing = await _context.ResourcePermissions
            .FirstOrDefaultAsync(p => p.WorkspaceId == request.WorkspaceId 
                && p.ResourceType == request.ResourceType 
                && p.ResourceId == request.ResourceId
                && p.UserId == request.TargetUserId
                && p.Role == request.TargetRole, cancellationToken);

        if (existing != null)
        {
            existing.AccessLevel = request.AccessLevel;
            await _context.SaveChangesAsync(cancellationToken);
            return new ResourcePermissionDto(existing.Id, existing.WorkspaceId, existing.ResourceType, existing.ResourceId, existing.UserId, existing.Role, existing.AccessLevel, existing.CreatedAt);
        }

        var newPermission = new ResourcePermission
        {
            WorkspaceId = request.WorkspaceId,
            ResourceType = request.ResourceType,
            ResourceId = request.ResourceId,
            UserId = request.TargetUserId,
            Role = request.TargetRole,
            AccessLevel = request.AccessLevel
        };

        _context.ResourcePermissions.Add(newPermission);
        await _context.SaveChangesAsync(cancellationToken);

        return new ResourcePermissionDto(newPermission.Id, newPermission.WorkspaceId, newPermission.ResourceType, newPermission.ResourceId, newPermission.UserId, newPermission.Role, newPermission.AccessLevel, newPermission.CreatedAt);
    }

    public async Task<bool> Handle(RemoveResourcePermissionCommand request, CancellationToken cancellationToken)
    {
        var permission = await _context.ResourcePermissions
            .FirstOrDefaultAsync(p => p.Id == request.PermissionId, cancellationToken);
            
        if (permission == null) return false;

        _context.ResourcePermissions.Remove(permission);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
