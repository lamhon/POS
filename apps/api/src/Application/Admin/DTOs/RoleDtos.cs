namespace PersonalOs.Application.Admin.DTOs;

public record RoleListDto(
    Guid Id,
    string Name,
    string Description,
    string? Icon,
    string? Color,
    string Type,
    string Status,
    int UserCount,
    int PermissionCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt
);

public record RoleDetailDto(
    Guid Id,
    string Name,
    string Description,
    string? Icon,
    string? Color,
    string Type,
    string Status,
    List<RolePermissionDto> Permissions,
    int UserCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt
);

public record RolePermissionDto(
    Guid PermissionId,
    string PermissionName,
    string Module,
    string Resource,
    string Action,
    string Scope
);

public record PermissionGroupDto(
    string Module,
    List<PermissionResourceDto> Resources
);

public record PermissionResourceDto(
    string Resource,
    List<PermissionItemDto> Actions
);

public record PermissionItemDto(
    Guid Id,
    string Name,
    string Action,
    string Description
);

public record RolePermissionInputDto(
    Guid PermissionId,
    string Scope = "All"
);

public record CreateRoleRequest(
    string Name,
    string? Description,
    string? Icon,
    string? Color,
    List<RolePermissionInputDto>? Permissions
);

public record UpdateRoleRequest(
    string? Name,
    string? Description,
    string? Icon,
    string? Color,
    List<RolePermissionInputDto>? Permissions
);

public record EffectivePermissionDto(
    string PermissionName,
    string Module,
    string Resource,
    string Action,
    string Scope,
    List<string> GrantedByRoles
);

public record UserRolesDto(
    Guid UserId,
    string UserEmail,
    string UserDisplayName,
    List<RoleListDto> Roles
);

public record AssignUserRolesRequest(
    List<Guid> RoleIds
);
