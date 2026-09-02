import apiClient from "../../api-client";
import { PaginatedResult } from "../finance/types";
import {
    RoleList, RoleDetail, PermissionGroup, EffectivePermission,
    GetRolesParams, CreateRolePayload, UpdateRolePayload
} from "./roles-types";

export const getRoles = async (params: GetRolesParams = {}): Promise<PaginatedResult<RoleList>> => {
    const { data } = await apiClient.get<PaginatedResult<RoleList>>("/admin/roles", { params });
    return data;
};

export const getRoleById = async (id: string): Promise<RoleDetail> => {
    const { data } = await apiClient.get<RoleDetail>(`/admin/roles/${id}`);
    return data;
};

export const getAllPermissions = async (): Promise<PermissionGroup[]> => {
    const { data } = await apiClient.get<PermissionGroup[]>("/admin/permissions");
    return data;
};

export const createRole = async (payload: CreateRolePayload): Promise<RoleDetail> => {
    const { data } = await apiClient.post<RoleDetail>("/admin/roles", payload);
    return data;
};

export const updateRole = async (id: string, payload: UpdateRolePayload): Promise<RoleDetail> => {
    const { data } = await apiClient.put<RoleDetail>(`/admin/roles/${id}`, payload);
    return data;
};

export const duplicateRole = async (id: string, newName: string): Promise<RoleDetail> => {
    const { data } = await apiClient.post<RoleDetail>(`/admin/roles/${id}/duplicate`, { newName });
    return data;
};

export const toggleArchiveRole = async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/roles/${id}/status`);
};

export const deleteRole = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/roles/${id}`);
};

export const getUserEffectivePermissions = async (userId: string): Promise<EffectivePermission[]> => {
    const { data } = await apiClient.get<EffectivePermission[]>(`/admin/users/${userId}/effective-permissions`);
    return data;
};

export const assignUserRoles = async (userId: string, roleIds: string[]): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/roles`, { roleIds });
};
