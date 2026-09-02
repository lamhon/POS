import apiClient from '../../api-client';
import {
    AdminUserList, AdminUserDetail, AdminSession, AdminUserWarning,
    AdminUserReport, AuditLog, AdminDashboardMetrics, GetAdminUsersParams
} from './types';
import { PaginatedResult } from '../finance/types';

export const getAdminUsers = async (params: GetAdminUsersParams = {}): Promise<PaginatedResult<AdminUserList>> => {
    const { data } = await apiClient.get<PaginatedResult<AdminUserList>>('/admin/users', { params });
    return data;
};

export const getAdminUserDetail = async (userId: string): Promise<AdminUserDetail> => {
    const { data } = await apiClient.get<AdminUserDetail>(`/admin/users/${userId}`);
    return data;
};

export const createAdminUser = async (payload: any): Promise<AdminUserDetail> => {
    const { data } = await apiClient.post<AdminUserDetail>('/admin/users', payload);
    return data;
};

export const updateAdminUser = async (userId: string, payload: Partial<{
    fullName: string; username: string; phone: string;
    avatarUrl: string; gender: string; dateOfBirth: string; reason: string;
}>): Promise<AdminUserDetail> => {
    const { data } = await apiClient.patch<AdminUserDetail>(`/admin/users/${userId}`, payload);
    return data;
};

export const changeUserRole = async (userId: string, role: string, reason?: string): Promise<void> => {
    await apiClient.patch(`/admin/users/${userId}/role`, { role, reason });
};

export const lockUser = async (userId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/lock`, { reason });
};

export const unlockUser = async (userId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/unlock`, { reason });
};

export const deleteAdminUser = async (userId: string, reason?: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`, { data: { reason } });
};

export const restoreAdminUser = async (userId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/restore`, { reason });
};

export const forcePasswordChange = async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/force-password-change`);
};

export const getAdminUserSessions = async (userId: string): Promise<AdminSession[]> => {
    const { data } = await apiClient.get<AdminSession[]>(`/admin/users/${userId}/sessions`);
    return data;
};

export const revokeSession = async (userId: string, sessionId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}/sessions/${sessionId}`);
};

export const revokeAllSessions = async (userId: string): Promise<{ revokedCount: number }> => {
    const { data } = await apiClient.delete<{ revokedCount: number }>(`/admin/users/${userId}/sessions`);
    return data;
};

export const warnUser = async (userId: string, payload: { type: string; title: string; message: string }): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/warn`, payload);
};

export const getAdminUserWarnings = async (userId: string): Promise<AdminUserWarning[]> => {
    const { data } = await apiClient.get<AdminUserWarning[]>(`/admin/users/${userId}/warnings`);
    return data;
};

export const getAdminUserReports = async (userId: string): Promise<AdminUserReport[]> => {
    const { data } = await apiClient.get<AdminUserReport[]>(`/admin/users/${userId}/reports`);
    return data;
};

export const getAdminUserAuditLogs = async (userId: string, pageNumber = 1, pageSize = 20): Promise<PaginatedResult<AuditLog>> => {
    const { data } = await apiClient.get<PaginatedResult<AuditLog>>(`/admin/users/${userId}/audit-logs`, { params: { pageNumber, pageSize } });
    return data;
};

export const getAuditLogs = async (pageNumber = 1, pageSize = 20): Promise<PaginatedResult<AuditLog>> => {
    const { data } = await apiClient.get<PaginatedResult<AuditLog>>('/admin/audit-logs', { params: { pageNumber, pageSize } });
    return data;
};

export const getAdminDashboardMetrics = async (): Promise<AdminDashboardMetrics> => {
    const { data } = await apiClient.get<AdminDashboardMetrics>('/admin/dashboard/metrics');
    return data;
};

export const bulkAction = async (userIds: string[], action: string, reason?: string): Promise<{ affectedCount: number }> => {
    const { data } = await apiClient.post<{ affectedCount: number }>('/admin/users/bulk-action', { userIds, action, reason });
    return data;
};
