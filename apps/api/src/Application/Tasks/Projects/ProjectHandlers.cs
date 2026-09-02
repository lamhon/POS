using MediatR;
using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;
using PersonalOs.Application.Tasks.DTOs;
using PersonalOs.Domain.Entities;

namespace PersonalOs.Application.Tasks.Projects;

// ─── Commands ──────────────────────────────────────────────

public record CreateProjectCommand(
    Guid UserId,
    Guid WorkspaceId,
    string Name,
    string? Description,
    string? Icon,
    string? Color,
    string? Priority,
    DateTimeOffset? StartDate,
    DateTimeOffset? DueDate
) : IRequest<ProjectDto>;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, ProjectDto>
{
    private readonly IApplicationDbContext _context;
    public CreateProjectCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<ProjectDto> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        // Verify workspace ownership
        var workspace = await _context.Workspaces
            .FirstOrDefaultAsync(w => w.Id == request.WorkspaceId && w.UserId == request.UserId && !w.IsDeleted, cancellationToken)
            ?? throw new InvalidOperationException("Workspace not found.");

        var project = new Project
        {
            UserId = request.UserId,
            WorkspaceId = request.WorkspaceId,
            Name = request.Name,
            Description = request.Description,
            Icon = request.Icon,
            Color = request.Color,
            Priority = request.Priority,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            Status = "Active"
        };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync(cancellationToken);
        return ToDto(project);
    }

    internal static ProjectDto ToDto(Project p) =>
        new(p.Id, p.WorkspaceId, p.Name, p.Description, p.Icon, p.Color, p.Status, p.Priority,
            p.StartDate, p.DueDate, p.IsArchived, p.CreatedAt, p.UpdatedAt);
}

// ─── Queries ──────────────────────────────────────────────

public record GetProjectsQuery(Guid UserId, Guid WorkspaceId) : IRequest<List<ProjectDto>>;

public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, List<ProjectDto>>
{
    private readonly IApplicationDbContext _context;
    public GetProjectsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<ProjectDto>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Projects
            .Where(p => p.UserId == request.UserId && p.WorkspaceId == request.WorkspaceId && !p.IsDeleted)
            .OrderBy(p => p.CreatedAt)
            .Select(p => CreateProjectCommandHandler.ToDto(p))
            .ToListAsync(cancellationToken);
    }
}
