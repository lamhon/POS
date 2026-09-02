export interface RoleList {
    id: string;
    name: string;
    description: string;
    icon: string | null;
    color: string | null;
    type: 'System' | 'Custom';
    status: 'Active' | 'Archived';
    userCount: number;
    permissionCount: number;
    createdAt: string;
    updatedAt: string | null;
}

export interface RolePermission {
    permissionId: string;
    permissionName: string;
    module: string;
    resource: string;
    action: string;
    scope: PermissionScope;
}

export interface RoleDetail extends RoleList {
    permissions: RolePermission[];
}

export type PermissionScope =
    | 'All'
    | 'Workspace'
    | 'Organization'
    | 'Department'
    | 'Team'
    | 'Assigned'
    | 'Own'
    | 'Custom';

export interface PermissionItem {
    id: string;
    name: string;
    action: string;
    description: string;
}

export interface PermissionResource {
    resource: string;
    actions: PermissionItem[];
}

export interface PermissionGroup {
    module: string;
    resources: PermissionResource[];
}

export interface EffectivePermission {
    permissionName: string;
    module: string;
    resource: string;
    action: string;
    scope: PermissionScope;
    grantedByRoles: string[];
}

export interface RolePermissionInput {
    permissionId: string;
    scope?: PermissionScope;
}

export interface CreateRolePayload {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    permissions?: RolePermissionInput[];
}

export interface UpdateRolePayload {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    permissions?: RolePermissionInput[];
}

export interface GetRolesParams {
    search?: string;
    type?: 'System' | 'Custom';
    status?: 'Active' | 'Archived';
    pageNumber?: number;
    pageSize?: number;
}
