using Microsoft.EntityFrameworkCore;
using PersonalOs.Application.Common.Interfaces;

namespace PersonalOs.Application.Common.Services;

public interface IPermissionEvaluatorService
{
    Task<bool> HasAccessAsync(Guid userId, Guid workspaceId, string resourceType, Guid? resourceId, string requiredAccessLevel, CancellationToken cancellationToken = default);
}

public class PermissionEvaluatorService : IPermissionEvaluatorService
{
    private readonly IApplicationDbContext _context;

    public PermissionEvaluatorService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HasAccessAsync(Guid userId, Guid workspaceId, string resourceType, Guid? resourceId, string requiredAccessLevel, CancellationToken cancellationToken = default)
    {
        var member = await _context.WorkspaceMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId, cancellationToken);
            
        if (member == null) return false;
        
        // Owner/Admin overrides
        if (member.Role == "Owner" || member.Role == "Admin") return true;

        // Note: For a fully functional ACL, we traverse bottom-up.
        // Task -> Database -> Project -> Workspace. (Folder is omitted as it's not in the domain)
        var resourcesToCheck = new List<(string Type, Guid? Id)>();
        
        if (resourceId.HasValue)
        {
            resourcesToCheck.Add((resourceType, resourceId));

            if (resourceType == "Task")
            {
                var task = await _context.Tasks
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.Id == resourceId, cancellationToken);
                    
                if (task != null)
                {
                    if (task.DatabaseId.HasValue) resourcesToCheck.Add(("Database", task.DatabaseId));
                    if (task.ProjectId.HasValue) resourcesToCheck.Add(("Project", task.ProjectId));
                }
            }
            else if (resourceType == "Database")
            {
                var db = await _context.TaskDatabases
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.Id == resourceId, cancellationToken);
                    
                if (db != null && db.ProjectId.HasValue)
                {
                    resourcesToCheck.Add(("Project", db.ProjectId));
                }
            }
        }
        resourcesToCheck.Add(("Workspace", null));

        var permissions = await _context.ResourcePermissions
            .AsNoTracking()
            .Where(p => p.WorkspaceId == workspaceId && 
                        (p.UserId == userId || p.Role == member.Role))
            .ToListAsync(cancellationToken);

        foreach (var res in resourcesToCheck)
        {
            var overridePerm = permissions
                .Where(p => p.ResourceType == res.Type && (p.ResourceId == res.Id || p.ResourceId == null))
                .OrderByDescending(p => p.ResourceId != null ? 1 : 0) // Prefer specific resource override
                .ThenByDescending(p => p.UserId != null ? 1 : 0)      // Prefer specific user override over role override
                .FirstOrDefault();

            if (overridePerm != null)
            {
                if (overridePerm.AccessLevel == requiredAccessLevel || overridePerm.AccessLevel == "Manage")
                {
                    return true;
                }
                if (overridePerm.AccessLevel == "None")
                {
                    return false;
                }
                
                // If it's a View requirement and access level is anything but None, they can view
                if (requiredAccessLevel == "View" && overridePerm.AccessLevel != "None")
                {
                    return true;
                }
                
                // If there's an explicit override that is NOT matching required level (and not Manage),
                // it explicitly restricts access, so we shouldn't fallback to broader permissions
                return false; 
            }
        }

        // Fallback to Workspace defaults based on required access
        var workspace = await _context.Workspaces
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == workspaceId, cancellationToken);
            
        if (workspace == null) return false;

        // Basic workspace default resolution based on requested resource and role
        if (requiredAccessLevel == "Create")
        {
            var allowedRole = resourceType switch
            {
                "Project" => workspace.CreateProjectsPermission,
                "Database" => workspace.CreateDatabasesPermission,
                "Task" => workspace.CreatePagesPermission,
                _ => "Admin"
            };

            return allowedRole == "Everyone" || allowedRole == member.Role;
        }

        // If no explicit grant, default to false (or View if everyone can view)
        return requiredAccessLevel == "View";
    }
}
