export interface AdminUserList {
    id: string;
    email: string;
    displayName: string;
    fullName: string | null;
    username: string | null;
    phone: string | null;
    avatarUrl: string | null;
    status: 'Active' | 'Pending' | 'Locked' | 'Deleted';
    role: string | null;
    emailVerified: boolean;
    lastLoginAt: string | null;
    createdAt: string;
}

export interface AdminUserDetail extends AdminUserList {
    gender: string | null;
    dateOfBirth: string | null;
    phoneVerified: boolean;
    mustChangePassword: boolean;
    updatedAt: string | null;
}

export interface AdminSession {
    id: string;
    device: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    lastActiveAt: string;
    expiresAt: string;
    isActive: boolean;
    createdAt: string;
}

export interface AdminUserWarning {
    id: string;
    type: string;
    title: string;
    message: string;
    createdByName: string | null;
    createdAt: string;
}

export interface AdminUserReport {
    id: string;
    reporterEmail: string;
    reasonCode: string;
    description: string | null;
    status: 'Pending' | 'Resolved' | 'Dismissed';
    resolution: string | null;
    createdAt: string;
    resolvedAt: string | null;
}

export interface AuditLog {
    id: string;
    adminEmail: string;
    adminRole: string;
    action: string;
    targetType: string;
    targetId: string;
    beforeData: string | null;
    afterData: string | null;
    reason: string | null;
    ipAddress: string | null;
    createdAt: string;
}

export interface AdminDashboardMetrics {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    lockedUsers: number;
    deletedUsers: number;
    newUsersToday: number;
    newUsersThisMonth: number;
    unverifiedUsers: number;
}

export interface GetAdminUsersParams {
    search?: string;
    role?: string;
    status?: string;
    verified?: boolean;
    createdFrom?: string;
    createdTo?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
}
