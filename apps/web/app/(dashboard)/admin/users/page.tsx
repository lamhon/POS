'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUsers, useAdminDashboardMetrics, useLockUser, useUnlockUser, useDeleteAdminUser, useRestoreAdminUser, useBulkAction, useCreateAdminUser, useAdminUserDetail, useUpdateAdminUser, useChangeUserRole } from '@/lib/api/admin/hooks';
import { AdminUserList } from '@/lib/api/admin/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
    Search, Filter, ShieldCheck, Users, UserCheck, Lock, Trash2,
    MoreVertical, Eye, Unlock, RotateCcw, RefreshCcw, ChevronLeft, ChevronRight,
    CheckSquare, Square, TriangleAlert, Plus, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const STATUS_STYLES: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Locked: 'bg-red-500/10 text-red-400 border-red-500/30',
    Deleted: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30',
};

const ROLE_STYLES: Record<string, string> = {
    'Super Admin': 'bg-purple-500/10 text-purple-400',
    Admin: 'bg-indigo-500/10 text-indigo-400',
    Moderator: 'bg-sky-500/10 text-sky-400',
    User: 'bg-neutral-500/10 text-neutral-400',
};

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
                <div className="text-xs text-neutral-400">{label}</div>
            </div>
        </div>
    );
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [role, setRole] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const { data: usersPage, isLoading } = useAdminUsers({ search, status: status || undefined, role: role || undefined, pageNumber: page, pageSize: 20 });
    const { data: metrics } = useAdminDashboardMetrics();
    const { mutate: lockUser } = useLockUser();
    const { mutate: unlockUser } = useUnlockUser();
    const { mutate: deleteUser } = useDeleteAdminUser();
    const { mutate: restoreUser } = useRestoreAdminUser();
    const { mutate: bulk } = useBulkAction();
    const { mutate: createUser, isPending: isCreating } = useCreateAdminUser();
    const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateAdminUser();
    const { mutateAsync: changeRole, isPending: isChangingRole } = useChangeUserRole();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDetailUserId, setSelectedDetailUserId] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [createForm, setCreateForm] = useState({
        email: '', password: '', displayName: '', fullName: '', username: '', phone: '', role: 'User', status: 'Active'
    });

    const { data: detailUser, isLoading: isLoadingDetail } = useAdminUserDetail(selectedDetailUserId || '');

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: '', username: '', phone: '', role: '' });

    const handleEditStart = () => {
        if (!detailUser) return;
        setEditForm({
            fullName: detailUser.fullName || '',
            username: detailUser.username || '',
            phone: detailUser.phone || '',
            role: detailUser.role || 'User'
        });
        setIsEditing(true);
    };

    const handleEditSave = async () => {
        if (!detailUser) return;
        
        try {
            if (editForm.fullName !== (detailUser.fullName || '') ||
                editForm.username !== (detailUser.username || '') ||
                editForm.phone !== (detailUser.phone || '')) {
                await updateUser({
                    userId: detailUser.id,
                    payload: {
                        fullName: editForm.fullName,
                        username: editForm.username,
                        phone: editForm.phone
                    }
                });
            }

            if (editForm.role !== (detailUser.role || '')) {
                await changeRole({
                    userId: detailUser.id,
                    role: editForm.role
                });
            }

            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    const handleClose = () => {
        setIsCreateModalOpen(false);
        setConfirmPassword('');
        setCreateForm({
            email: '', password: '', displayName: '', fullName: '', username: '', phone: '', role: 'User', status: 'Active'
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (createForm.password !== confirmPassword) {
            return;
        }
        createUser(createForm, {
            onSuccess: () => {
                handleClose();
            }
        });
    };

    const users = usersPage?.items ?? [];
    const total = usersPage?.totalCount ?? 0;
    const totalPages = usersPage?.totalPages ?? 1;

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === users.length) setSelected(new Set());
        else setSelected(new Set(users.map(u => u.id)));
    };

    return (
        <div className="space-y-6 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        Admin — User Management
                    </h1>
                    <p className="text-sm text-neutral-400 mt-0.5">Manage all user accounts, roles and access levels</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 h-9">
                    <Plus className="w-4 h-4" />
                    Create User
                </Button>
            </div>

            {/* Admin Sub-nav */}
            <div className="flex items-center gap-1 border-b border-neutral-800 -mt-2 pb-0">
                <a href="/admin/users" className="px-4 py-2 text-sm font-medium text-white border-b-2 border-indigo-500 cursor-pointer">Users</a>
                <a href="/admin/roles" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-neutral-600 cursor-pointer">Roles</a>
                <a href="/admin/audit-logs" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-neutral-600 cursor-pointer">Audit Logs</a>
            </div>

            {/* Metrics */}
            {metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Total Users" value={metrics.totalUsers} icon={Users} color="bg-indigo-500/10 text-indigo-400" />
                    <MetricCard label="Active" value={metrics.activeUsers} icon={UserCheck} color="bg-emerald-500/10 text-emerald-400" />
                    <MetricCard label="Locked" value={metrics.lockedUsers} icon={Lock} color="bg-red-500/10 text-red-400" />
                    <MetricCard label="New Today" value={metrics.newUsersToday} icon={RefreshCcw} color="bg-sky-500/10 text-sky-400" />
                </div>
            )}

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-neutral-900/50 border border-neutral-800 rounded-xl p-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                        placeholder="Search by name, email, username…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 bg-neutral-950 border-neutral-800 h-9"
                    />
                </div>
                <select
                    value={status}
                    onChange={e => { setStatus(e.target.value); setPage(1); }}
                    className="h-9 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-white"
                >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Locked">Locked</option>
                    <option value="Deleted">Deleted</option>
                </select>
                <select
                    value={role}
                    onChange={e => { setRole(e.target.value); setPage(1); }}
                    className="h-9 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-white"
                >
                    <option value="">All Roles</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Moderator">Moderator</option>
                    <option value="User">User</option>
                </select>

                {selected.size > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-neutral-400">{selected.size} selected</span>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-amber-400 hover:bg-amber-950/30" onClick={() => bulk({ userIds: [...selected], action: 'lock' })}>Lock</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-400 hover:bg-emerald-950/30" onClick={() => bulk({ userIds: [...selected], action: 'unlock' })}>Unlock</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-red-400 hover:bg-red-950/30" onClick={() => bulk({ userIds: [...selected], action: 'delete' })}>Delete</Button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-800 text-left">
                                <th className="p-3 w-10">
                                    <button onClick={toggleAll} className="text-neutral-400 hover:text-white">
                                        {selected.size === users.length && users.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </th>
                                <th className="p-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">User</th>
                                <th className="p-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Role</th>
                                <th className="p-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                                <th className="p-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Verified</th>
                                <th className="p-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Last Login</th>
                                <th className="p-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {isLoading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-neutral-500">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-neutral-500">No users found.</td></tr>
                            ) : users.map((user: AdminUserList) => (
                                <tr key={user.id} className={cn("hover:bg-neutral-800/20 transition-colors", selected.has(user.id) && "bg-indigo-950/20")}>
                                    <td className="p-3">
                                        <button onClick={() => toggleSelect(user.id)} className="text-neutral-400 hover:text-white">
                                            {selected.has(user.id) ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4" />}
                                        </button>
                                    </td>
                                    <td className="p-3">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer group w-fit"
                                            onClick={() => setSelectedDetailUserId(user.id)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0 group-hover:border-indigo-500 transition-colors">
                                                {(user.fullName || user.displayName).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white text-sm group-hover:text-indigo-400 group-hover:underline transition-colors">{user.fullName || user.displayName}</div>
                                                <div className="text-xs text-neutral-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium", ROLE_STYLES[user.role ?? ''] ?? 'text-neutral-400')}>
                                            {user.role ?? '—'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", STATUS_STYLES[user.status] ?? 'text-neutral-400')}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={cn("text-xs", user.emailVerified ? 'text-emerald-400' : 'text-neutral-500')}>
                                            {user.emailVerified ? '✓ Verified' : '✗ Unverified'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-xs text-neutral-400">
                                        {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'HH:mm dd/MM/yyyy') : '—'}
                                    </td>
                                    <td className="p-3 text-xs text-neutral-400">
                                        {format(new Date(user.createdAt), 'HH:mm dd/MM/yyyy')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800">
                    <span className="text-xs text-neutral-500">Showing {users.length} of {total} users</span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-8 w-8 p-0">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-neutral-400">Page {page} of {totalPages}</span>
                        <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">Create New User</h2>
                            <button onClick={handleClose} className="text-neutral-500 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                            <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Email *</Label><Input type="email" required value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} className="bg-neutral-950 border-neutral-800" /></div>
                            <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Display Name *</Label><Input required value={createForm.displayName} onChange={e => setCreateForm(f => ({ ...f, displayName: e.target.value }))} className="bg-neutral-950 border-neutral-800" /></div>
                            <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Password *</Label><Input type="password" required value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} className="bg-neutral-950 border-neutral-800" /></div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-neutral-400 font-medium">Re-enter password *</Label>
                                <Input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className={cn(
                                        "bg-neutral-950 border-neutral-800",
                                        confirmPassword && createForm.password !== confirmPassword && "border-red-500 focus-visible:ring-red-500 text-red-400 focus-visible:border-red-500"
                                    )}
                                />
                                {confirmPassword && createForm.password !== confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">Passwords do not match.</p>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Full Name</Label><Input value={createForm.fullName} onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))} className="bg-neutral-950 border-neutral-800" /></div>
                                <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Username</Label><Input value={createForm.username} onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))} className="bg-neutral-950 border-neutral-800" /></div>
                            </div>
                            <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Phone</Label><Input type="tel" value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} className="bg-neutral-950 border-neutral-800" /></div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                                <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Role</Label>
                                    <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))} className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm focus:outline-none cursor-pointer">
                                        <option value="User">User</option>
                                        <option value="Moderator">Moderator</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Super Admin">Super Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Status</Label>
                                    <select value={createForm.status} onChange={e => setCreateForm(f => ({ ...f, status: e.target.value }))} className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm focus:outline-none cursor-pointer">
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-neutral-800 mt-4">
                                <Button type="button" variant="ghost" onClick={handleClose} className="cursor-pointer">Cancel</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" disabled={isCreating || (confirmPassword !== '' && createForm.password !== confirmPassword)}>
                                    {isCreating ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* User Detail Modal */}
            {selectedDetailUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-white">{isEditing ? 'Edit User Details' : 'User Details'}</h2>
                            <button onClick={() => { setIsEditing(false); setSelectedDetailUserId(null); }} className="text-neutral-500 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {isLoadingDetail ? (
                            <div className="p-10 text-center text-neutral-500">Loading details...</div>
                        ) : !detailUser ? (
                            <div className="p-10 text-center text-neutral-500">User not found.</div>
                        ) : (
                            <div className="p-6 space-y-6">
                                {/* Header Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl font-bold text-neutral-300">
                                        {(detailUser.fullName || detailUser.displayName).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.fullName}
                                                onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                                                className="bg-neutral-950 border-neutral-800 h-8 font-bold mt-1"
                                                placeholder="Full Name"
                                            />
                                        ) : (
                                            <h3 className="text-lg font-bold text-white">{detailUser.fullName || detailUser.displayName}</h3>
                                        )}
                                        <p className="text-sm text-neutral-400 mt-1">{detailUser.email}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 text-sm bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-4">
                                    <div>
                                        <span className="text-xs text-neutral-500 block font-medium">Username</span>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.username}
                                                onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                                                className="bg-neutral-950 border-neutral-800 h-8 mt-1"
                                                placeholder="Username"
                                            />
                                        ) : (
                                            <span className="text-neutral-200 font-medium inline-block mt-1">{detailUser.username || '—'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-500 block font-medium">Phone</span>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.phone}
                                                onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                                className="bg-neutral-950 border-neutral-800 h-8 mt-1"
                                                placeholder="Phone"
                                            />
                                        ) : (
                                            <span className="text-neutral-200 font-medium inline-block mt-1">{detailUser.phone || '—'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-500 block font-medium">Role</span>
                                        {isEditing ? (
                                            <select
                                                value={editForm.role}
                                                onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                                                className="w-full h-8 px-2 rounded-md bg-neutral-950 border border-neutral-800 text-sm focus:outline-none mt-1"
                                            >
                                                <option value="User">User</option>
                                                <option value="Moderator">Moderator</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Super Admin">Super Admin</option>
                                            </select>
                                        ) : (
                                            <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium inline-block mt-1", ROLE_STYLES[detailUser.role ?? ''] ?? 'text-neutral-400')}>
                                                {detailUser.role ?? '—'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-500 block font-medium">Status</span>
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium inline-block mt-1", STATUS_STYLES[detailUser.status] ?? 'text-neutral-400')}>
                                            {detailUser.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-500 block font-medium">Verified</span>
                                        <span className={cn("text-xs font-semibold mt-1 inline-block", detailUser.emailVerified ? 'text-emerald-400' : 'text-neutral-500')}>
                                            {detailUser.emailVerified ? '✓ Verified' : '✗ Unverified'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-neutral-500 block font-medium">Joined</span>
                                        <span className="text-neutral-300 text-xs mt-1 block">
                                            {format(new Date(detailUser.createdAt), 'HH:mm dd/MM/yyyy')}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex justify-between items-center border-t border-neutral-800">
                                    {isEditing ? (
                                        <>
                                            <div />
                                            <div className="flex items-center gap-3">
                                                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                                <Button
                                                    onClick={handleEditSave}
                                                    disabled={isUpdating || isChangingRole}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                >
                                                    {(isUpdating || isChangingRole) ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Button type="button" variant="outline" onClick={handleEditStart} className="border-neutral-700 hover:bg-neutral-800">
                                                Edit
                                            </Button>
                                            <div className="flex gap-3">
                                                {detailUser.status === 'Locked' ? (
                                                    <Button
                                                        onClick={() => {
                                                            unlockUser({ userId: detailUser.id }, { onSuccess: () => setSelectedDetailUserId(null) });
                                                        }}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                                                    >
                                                        <Unlock className="w-4 h-4" /> Unlock
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => {
                                                            lockUser({ userId: detailUser.id }, { onSuccess: () => setSelectedDetailUserId(null) });
                                                        }}
                                                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                                                    >
                                                        <Lock className="w-4 h-4" /> Lock
                                                    </Button>
                                                )}

                                                {detailUser.status === 'Deleted' ? (
                                                    <Button
                                                        onClick={() => {
                                                            restoreUser({ userId: detailUser.id }, { onSuccess: () => setSelectedDetailUserId(null) });
                                                        }}
                                                        className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2"
                                                    >
                                                        <RotateCcw className="w-4 h-4" /> Restore
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => {
                                                            deleteUser({ userId: detailUser.id }, { onSuccess: () => setSelectedDetailUserId(null) });
                                                        }}
                                                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </Button>
                                                )}
                                                <Button type="button" variant="ghost" onClick={() => setSelectedDetailUserId(null)}>Close</Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
