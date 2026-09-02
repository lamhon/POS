using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Tasks.Workspaces;

// ─── Queries ──────────────────────────────────────────────

public record GetWorkspaceMembersQuery(Guid UserId, Guid WorkspaceId) : IRequest<List<WorkspaceMemberDto>>;

public class GetWorkspaceMembersQueryHandler : IRequestHandler<GetWorkspaceMembersQuery, List<WorkspaceMemberDto>>
{
    private readonly IApplicationDbContext _context;
    public GetWorkspaceMembersQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<WorkspaceMemberDto>> Handle(GetWorkspaceMembersQuery request, CancellationToken cancellationToken)
    {
        var isMember = await _context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == request.WorkspaceId && m.UserId == request.UserId && !m.IsDeleted, cancellationToken);
            
        if (!isMember) throw new UnauthorizedAccessException("You do not have access to this workspace.");

        return await _context.WorkspaceMembers
            .Include(m => m.User)
            .Where(m => m.WorkspaceId == request.WorkspaceId && !m.IsDeleted)
            .Select(m => new WorkspaceMemberDto(
                m.Id,
                m.WorkspaceId,
                m.UserId,
                m.User.Email,
                m.User.DisplayName,
                m.Role,
                m.CreatedAt,
                m.User.Phone))
            .ToListAsync(cancellationToken);
    }
}

// ─── Commands ──────────────────────────────────────────────

public record AddWorkspaceMemberCommand(Guid CurrentUserId, Guid WorkspaceId, string Email, string Role) : IRequest<WorkspaceMemberDto>;

public class AddWorkspaceMemberCommandHandler : IRequestHandler<AddWorkspaceMemberCommand, WorkspaceMemberDto>
{
    private readonly IApplicationDbContext _context;
    public AddWorkspaceMemberCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<WorkspaceMemberDto> Handle(AddWorkspaceMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserMember = await _context.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == request.WorkspaceId && m.UserId == request.CurrentUserId && !m.IsDeleted, cancellationToken);
            
        if (currentUserMember == null || (currentUserMember.Role != "Owner" && currentUserMember.Role != "Admin"))
            throw new UnauthorizedAccessException("Only Owner or Admin can add members.");

        var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsDeleted, cancellationToken);
        if (targetUser == null) throw new InvalidOperationException("User with this email not found in PersonalOS.");

        var existingMember = await _context.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == request.WorkspaceId && m.UserId == targetUser.Id, cancellationToken);

        if (existingMember != null)
        {
            if (!existingMember.IsDeleted) throw new InvalidOperationException("User is already a member of this workspace.");
            
            // Restore soft-deleted member
            existingMember.IsDeleted = false;
            existingMember.DeletedAt = null;
            existingMember.Role = request.Role;
            await _context.SaveChangesAsync(cancellationToken);
            
            return new WorkspaceMemberDto(existingMember.Id, existingMember.WorkspaceId, existingMember.UserId, targetUser.Email, targetUser.DisplayName, existingMember.Role, existingMember.CreatedAt, targetUser.Phone);
        }

        var newMember = new WorkspaceMember
        {
            WorkspaceId = request.WorkspaceId,
            UserId = targetUser.Id,
            Role = request.Role
        };

        _context.WorkspaceMembers.Add(newMember);
        await _context.SaveChangesAsync(cancellationToken);

        return new WorkspaceMemberDto(newMember.Id, newMember.WorkspaceId, newMember.UserId, targetUser.Email, targetUser.DisplayName, newMember.Role, newMember.CreatedAt, targetUser.Phone);
    }
}

public record RemoveWorkspaceMemberCommand(Guid CurrentUserId, Guid WorkspaceId, Guid MemberUserId) : IRequest<bool>;

public class RemoveWorkspaceMemberCommandHandler : IRequestHandler<RemoveWorkspaceMemberCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public RemoveWorkspaceMemberCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(RemoveWorkspaceMemberCommand request, CancellationToken cancellationToken)
    {
        var currentUserMember = await _context.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == request.WorkspaceId && m.UserId == request.CurrentUserId && !m.IsDeleted, cancellationToken);
            
        if (currentUserMember == null) throw new UnauthorizedAccessException("You do not have access to this workspace.");

        var targetMember = await _context.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == request.WorkspaceId && m.UserId == request.MemberUserId && !m.IsDeleted, cancellationToken);

        if (targetMember == null) return false;

        if (targetMember.Role == "Owner") throw new InvalidOperationException("Cannot remove the Owner of the workspace.");

        if (request.CurrentUserId != request.MemberUserId)
        {
            if (currentUserMember.Role != "Owner" && currentUserMember.Role != "Admin")
                throw new UnauthorizedAccessException("Only Owner or Admin can remove members.");
        }

        targetMember.IsDeleted = true;
        targetMember.DeletedAt = DateTimeOffset.UtcNow;
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record UpdateWorkspaceMemberRoleCommand(Guid CurrentUserId, Guid WorkspaceId, Guid MemberUserId, string Role) : IRequest<WorkspaceMemberDto?>;

public class UpdateWorkspaceMemberRoleCommandHandler : IRequestHandler<UpdateWorkspaceMemberRoleCommand, WorkspaceMemberDto?>
{
    private readonly IApplicationDbContext _context;
    public UpdateWorkspaceMemberRoleCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<WorkspaceMemberDto?> Handle(UpdateWorkspaceMemberRoleCommand request, CancellationToken cancellationToken)
    {
        var currentUserMember = await _context.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == request.WorkspaceId && m.UserId == request.CurrentUserId && !m.IsDeleted, cancellationToken);
            
        if (currentUserMember == null || (currentUserMember.Role != "Owner" && currentUserMember.Role != "Admin"))
            throw new UnauthorizedAccessException("Only Owner or Admin can update member roles.");

        var targetMember = await _context.WorkspaceMembers
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.WorkspaceId == request.WorkspaceId && m.UserId == request.MemberUserId && !m.IsDeleted, cancellationToken);

        if (targetMember == null) return null;

        if (targetMember.Role == "Owner") throw new InvalidOperationException("Cannot change the role of the workspace Owner.");
        if (request.Role == "Owner" && currentUserMember.Role != "Owner") throw new InvalidOperationException("Only the Owner can transfer ownership.");
        
        targetMember.Role = request.Role;
        await _context.SaveChangesAsync(cancellationToken);

        return new WorkspaceMemberDto(targetMember.Id, targetMember.WorkspaceId, targetMember.UserId, targetMember.User.Email, targetMember.User.DisplayName, targetMember.Role, targetMember.CreatedAt, targetMember.User.Phone);
    }
}
