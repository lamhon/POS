import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as rolesService from "./roles-service";
import { GetRolesParams, CreateRolePayload, UpdateRolePayload } from "./roles-types";
import { toast } from "sonner";

export const roleKeys = {
    roles: (params?: GetRolesParams) => params ? ["admin", "roles", params] as const : ["admin", "roles"] as const,
    role: (id: string) => ["admin", "role", id] as const,
    permissions: ["admin", "permissions"] as const,
    effectivePermissions: (userId: string) => ["admin", "user", userId, "effective-permissions"] as const,
};

export const useRoles = (params: GetRolesParams = {}) =>
    useQuery({ queryKey: roleKeys.roles(params), queryFn: () => rolesService.getRoles(params) });

export const useRoleById = (id: string) =>
    useQuery({ queryKey: roleKeys.role(id), queryFn: () => rolesService.getRoleById(id), enabled: !!id });

export const useAllPermissions = () =>
    useQuery({ queryKey: roleKeys.permissions, queryFn: rolesService.getAllPermissions, staleTime: 5 * 60 * 1000 });

export const useUserEffectivePermissions = (userId: string) =>
    useQuery({ queryKey: roleKeys.effectivePermissions(userId), queryFn: () => rolesService.getUserEffectivePermissions(userId), enabled: !!userId });

export const useCreateRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRolePayload) => rolesService.createRole(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "roles"] });
            toast.success("Role created successfully");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to create role"),
    });
};

export const useUpdateRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) => rolesService.updateRole(id, payload),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["admin", "roles"] });
            qc.invalidateQueries({ queryKey: ["admin", "role", data.id] });
            toast.success("Role updated successfully");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to update role"),
    });
};

export const useDuplicateRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, newName }: { id: string; newName: string }) => rolesService.duplicateRole(id, newName),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "roles"] });
            toast.success("Role duplicated successfully");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to duplicate role"),
    });
};

export const useToggleArchiveRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => rolesService.toggleArchiveRole(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "roles"] });
            toast.success("Role status updated");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to update role status"),
    });
};

export const useDeleteRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => rolesService.deleteRole(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "roles"] });
            toast.success("Role deleted successfully");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to delete role"),
    });
};

export const useAssignUserRoles = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) => rolesService.assignUserRoles(userId, roleIds),
        onSuccess: (_data, { userId }) => {
            qc.invalidateQueries({ queryKey: ["admin", "user", userId] });
            qc.invalidateQueries({ queryKey: ["admin", "user", userId, "effective-permissions"] });
            toast.success("Roles assigned successfully");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to assign roles"),
    });
};
