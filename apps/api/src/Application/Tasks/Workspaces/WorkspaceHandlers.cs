using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Tasks.Workspaces;

// ─── Commands ──────────────────────────────────────────────

public record CreateWorkspaceCommand(Guid UserId, string Name, string? Description, string? Icon, string? Color)
    : IRequest<WorkspaceDto>;

public class CreateWorkspaceCommandHandler : IRequestHandler<CreateWorkspaceCommand, WorkspaceDto>
{
    private readonly IApplicationDbContext _context;
    public CreateWorkspaceCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<WorkspaceDto> Handle(CreateWorkspaceCommand request, CancellationToken cancellationToken)
    {
        var workspace = new Workspace
        {
            UserId = request.UserId,
            Name = request.Name,
            Description = request.Description,
            Icon = request.Icon,
            Color = request.Color
        };
        
        workspace.Members.Add(new WorkspaceMember
        {
            UserId = request.UserId,
            Role = "Owner"
        });

        _context.Workspaces.Add(workspace);
        await _context.SaveChangesAsync(cancellationToken);
        return ToDto(workspace);
    }

    internal static WorkspaceDto ToDto(Workspace w) =>
        new(w.Id, w.Name, w.Description, w.Icon, w.Color, w.IsPinned, w.IsArchived, w.CreatedAt, w.UpdatedAt);
}

public record ArchiveWorkspaceCommand(Guid Id, Guid UserId) : IRequest<WorkspaceDto?>;

public class ArchiveWorkspaceCommandHandler : IRequestHandler<ArchiveWorkspaceCommand, WorkspaceDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ArchiveWorkspaceCommandHandler> _logger;

    public ArchiveWorkspaceCommandHandler(IApplicationDbContext context, ILogger<ArchiveWorkspaceCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<WorkspaceDto?> Handle(ArchiveWorkspaceCommand request, CancellationToken cancellationToken)
    {
        var workspace = await _context.Workspaces
            .FirstOrDefaultAsync(w => w.Id == request.Id && w.UserId == request.UserId && !w.IsDeleted, cancellationToken);
            
        if (workspace == null) return null;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        var userName = user?.DisplayName ?? user?.Email ?? "Unknown";

        workspace.IsArchived = !workspace.IsArchived;
        
        if (workspace.IsArchived)
        {
            workspace.ArchivedAt = DateTimeOffset.UtcNow;
            workspace.ArchivedBy = userName;
            _logger.LogInformation("Workspace {WorkspaceId} archived by {User} at {Time}", workspace.Id, userName, workspace.ArchivedAt);
        }
        else
        {
            _logger.LogInformation("Workspace {WorkspaceId} restored by {User} at {Time}", workspace.Id, userName, DateTimeOffset.UtcNow);
            workspace.ArchivedAt = null;
            workspace.ArchivedBy = null;
        }
        
        await _context.SaveChangesAsync(cancellationToken);
        return CreateWorkspaceCommandHandler.ToDto(workspace);
    }
}

public record DeleteWorkspaceCommand(Guid Id, Guid UserId) : IRequest<bool>;

public class DeleteWorkspaceCommandHandler : IRequestHandler<DeleteWorkspaceCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public DeleteWorkspaceCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<bool> Handle(DeleteWorkspaceCommand request, CancellationToken cancellationToken)
    {
        var workspace = await _context.Workspaces
            .FirstOrDefaultAsync(w => w.Id == request.Id && w.UserId == request.UserId && !w.IsDeleted, cancellationToken);
            
        if (workspace == null) return false;

        // Archived workspaces cannot be deleted
        if (workspace.IsArchived) return false;

        workspace.IsDeleted = true;
        workspace.DeletedAt = DateTimeOffset.UtcNow;
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public record UpdateWorkspaceCommand(
    Guid Id,
    Guid UserId,
    string? Name = null,
    string? Description = null,
    string? Icon = null,
    string? Color = null,
    bool? IsPinned = null
) : IRequest<WorkspaceDto?>;

public class UpdateWorkspaceCommandHandler : IRequestHandler<UpdateWorkspaceCommand, WorkspaceDto?>
{
    private readonly IApplicationDbContext _context;
    public UpdateWorkspaceCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<WorkspaceDto?> Handle(UpdateWorkspaceCommand request, CancellationToken cancellationToken)
    {
        var workspace = await _context.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(w => w.Id == request.Id && !w.IsDeleted, cancellationToken);

        if (workspace == null) return null;

        var isCreator = workspace.UserId == request.UserId;
        var memberRole = workspace.Members.FirstOrDefault(m => m.UserId == request.UserId)?.Role;
        var canEdit = isCreator || memberRole == "Owner" || memberRole == "Admin";

        if (!canEdit)
        {
            throw new InvalidOperationException("You do not have permission to modify this workspace. Only workspace Owners and Admins can edit settings.");
        }

        if (request.Name != null && request.Name != workspace.Name)
        {
            if (workspace.IsArchived)
            {
                throw new InvalidOperationException("Cannot rename an archived workspace.");
            }
            workspace.Name = request.Name;
        }

        if (request.Description != null) workspace.Description = request.Description;
        if (request.Icon != null) workspace.Icon = request.Icon;
        if (request.Color != null) workspace.Color = request.Color;
        if (request.IsPinned.HasValue) workspace.IsPinned = request.IsPinned.Value;

        await _context.SaveChangesAsync(cancellationToken);
        return CreateWorkspaceCommandHandler.ToDto(workspace);
    }
}

// ─── Queries ──────────────────────────────────────────────

public record GetWorkspacesQuery(Guid UserId) : IRequest<List<WorkspaceDto>>;

public class GetWorkspacesQueryHandler : IRequestHandler<GetWorkspacesQuery, List<WorkspaceDto>>
{
    private readonly IApplicationDbContext _context;
    public GetWorkspacesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<WorkspaceDto>> Handle(GetWorkspacesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Workspaces
            .Where(w => !w.IsDeleted && (w.UserId == request.UserId || w.Members.Any(m => m.UserId == request.UserId && !m.IsDeleted)))
            .OrderByDescending(w => w.IsPinned)
            .ThenBy(w => w.CreatedAt)
            .Select(w => CreateWorkspaceCommandHandler.ToDto(w))
            .ToListAsync(cancellationToken);
    }
}
