import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from './service';
import { GetAdminUsersParams } from './types';
import { toast } from 'sonner';

export const adminKeys = {
    users: (params?: GetAdminUsersParams) => params ? ['admin', 'users', params] as const : ['admin', 'users'] as const,
    user: (id: string) => ['admin', 'user', id] as const,
    sessions: (id: string) => ['admin', 'user', id, 'sessions'] as const,
    warnings: (id: string) => ['admin', 'user', id, 'warnings'] as const,
    reports: (id: string) => ['admin', 'user', id, 'reports'] as const,
    auditLogs: (id?: string) => ['admin', 'audit-logs', id] as const,
    metrics: ['admin', 'metrics'] as const,
};

export const useAdminUsers = (params: GetAdminUsersParams = {}) =>
    useQuery({ queryKey: adminKeys.users(params), queryFn: () => adminService.getAdminUsers(params) });

export const useAdminUserDetail = (userId: string) =>
    useQuery({ queryKey: adminKeys.user(userId), queryFn: () => adminService.getAdminUserDetail(userId), enabled: !!userId });

export const useAdminDashboardMetrics = () =>
    useQuery({ queryKey: adminKeys.metrics, queryFn: adminService.getAdminDashboardMetrics });

export const useAdminUserSessions = (userId: string) =>
    useQuery({ queryKey: adminKeys.sessions(userId), queryFn: () => adminService.getAdminUserSessions(userId), enabled: !!userId });

export const useAdminUserWarnings = (userId: string) =>
    useQuery({ queryKey: adminKeys.warnings(userId), queryFn: () => adminService.getAdminUserWarnings(userId), enabled: !!userId });

export const useAdminUserReports = (userId: string) =>
    useQuery({ queryKey: adminKeys.reports(userId), queryFn: () => adminService.getAdminUserReports(userId), enabled: !!userId });

export const useAdminUserAuditLogs = (userId: string, page = 1) =>
    useQuery({ queryKey: [...adminKeys.auditLogs(userId), page], queryFn: () => adminService.getAdminUserAuditLogs(userId, page), enabled: !!userId });

export const useAuditLogs = (page = 1) =>
    useQuery({ queryKey: [...adminKeys.auditLogs(), page], queryFn: () => adminService.getAuditLogs(page) });

export const useCreateAdminUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Parameters<typeof adminService.createAdminUser>[0]) => adminService.createAdminUser(payload),
        onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success('User created successfully'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create user'),
    });
};

export const useUpdateAdminUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, payload }: { userId: string; payload: Parameters<typeof adminService.updateAdminUser>[1] }) =>
            adminService.updateAdminUser(userId, payload),
        onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: adminKeys.user(v.userId) }); toast.success('User updated'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update user'),
    });
};

export const useChangeUserRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, role, reason }: { userId: string; role: string; reason?: string }) =>
            adminService.changeUserRole(userId, role, reason),
        onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: adminKeys.user(v.userId) }); qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success('Role updated'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to change role'),
    });
};

export const useLockUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => adminService.lockUser(userId, reason),
        onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: adminKeys.user(v.userId) }); qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success('User locked'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to lock user'),
    });
};

export const useUnlockUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => adminService.unlockUser(userId, reason),
        onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: adminKeys.user(v.userId) }); qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success('User unlocked'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to unlock user'),
    });
};

export const useDeleteAdminUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => adminService.deleteAdminUser(userId, reason),
        onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success('User deleted'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete user'),
    });
};

export const useRestoreAdminUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => adminService.restoreAdminUser(userId, reason),
        onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success('User restored'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to restore user'),
    });
};

export const useRevokeSession = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, sessionId }: { userId: string; sessionId: string }) => adminService.revokeSession(userId, sessionId),
        onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: adminKeys.sessions(v.userId) }); toast.success('Session revoked'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to revoke session'),
    });
};

export const useRevokeAllSessions = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => adminService.revokeAllSessions(userId),
        onSuccess: (data, userId) => { qc.invalidateQueries({ queryKey: adminKeys.sessions(userId) }); toast.success(`${data.revokedCount} sessions revoked`); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to revoke sessions'),
    });
};

export const useWarnUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, ...payload }: { userId: string; type: string; title: string; message: string }) =>
            adminService.warnUser(userId, payload),
        onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: adminKeys.warnings(v.userId) }); toast.success('Warning sent'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send warning'),
    });
};

export const useForcePasswordChange = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => adminService.forcePasswordChange(userId),
        onSuccess: (_, userId) => { qc.invalidateQueries({ queryKey: adminKeys.user(userId) }); toast.success('Password change forced'); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useBulkAction = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userIds, action, reason }: { userIds: string[]; action: string; reason?: string }) =>
            adminService.bulkAction(userIds, action, reason),
        onSuccess: (data) => { qc.invalidateQueries({ queryKey: adminKeys.users() }); toast.success(`${data.affectedCount} users affected`); },
        onError: (e: any) => toast.error(e.response?.data?.message || 'Bulk action failed'),
    });
};
