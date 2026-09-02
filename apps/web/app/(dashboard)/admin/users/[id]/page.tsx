'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    useAdminUserDetail, useAdminUserSessions, useAdminUserWarnings,
    useAdminUserReports, useAdminUserAuditLogs,
    useUpdateAdminUser, useChangeUserRole, useLockUser, useUnlockUser,
    useDeleteAdminUser, useRestoreAdminUser, useForcePasswordChange,
    useRevokeSession, useRevokeAllSessions, useWarnUser
} from '@/lib/api/admin/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft, Lock, Unlock, Trash2, RotateCcw, Shield, MonitorSmartphone,
    AlertTriangle, FileText, History, User, LayoutList, WifiOff
} from 'lucide-react';
import AccessControlTab from './AccessControlTab';

const TABS = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'profile', label: 'Profile', icon: LayoutList },
    { id: 'access', label: 'Access Control', icon: Shield },
    { id: 'sessions', label: 'Sessions', icon: MonitorSmartphone },
    { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'audit', label: 'Admin Logs', icon: History },
];

const STATUS_STYLES: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Locked: 'bg-red-500/10 text-red-400 border-red-500/30',
    Deleted: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30',
};

export default function AdminUserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // Profile edit state
    const [editFullName, setEditFullName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editGender, setEditGender] = useState('');

    // Warn state
    const [warnType, setWarnType] = useState('Spam');
    const [warnTitle, setWarnTitle] = useState('');
    const [warnMessage, setWarnMessage] = useState('');

    // Role state
    const [newRole, setNewRole] = useState('');

    const { data: user, isLoading } = useAdminUserDetail(id);
    const { data: sessions } = useAdminUserSessions(id);
    const { data: warnings } = useAdminUserWarnings(id);
    const { data: reports } = useAdminUserReports(id);
    const { data: auditLogs } = useAdminUserAuditLogs(id);

    const { mutate: updateUser, isPending: isUpdating } = useUpdateAdminUser();
    const { mutate: changeRole, isPending: isChangingRole } = useChangeUserRole();
    const { mutate: lockUser } = useLockUser();
    const { mutate: unlockUser } = useUnlockUser();
    const { mutate: deleteUser } = useDeleteAdminUser();
    const { mutate: restoreUser } = useRestoreAdminUser();
    const { mutate: forcePasswordChange } = useForcePasswordChange();
    const { mutate: revokeSession } = useRevokeSession();
    const { mutate: revokeAll } = useRevokeAllSessions();
    const { mutate: warnUser, isPending: isWarning } = useWarnUser();

    if (isLoading) return <div className="p-8 text-center text-neutral-500">Loading user details...</div>;
    if (!user) return <div className="p-8 text-center text-neutral-500">User not found.</div>;

    const handleProfileSave = () => {
        updateUser({ userId: id, payload: { fullName: editFullName || undefined, username: editUsername || undefined, phone: editPhone || undefined, gender: editGender || undefined } });
    };

    const handleSendWarning = (e: React.FormEvent) => {
        e.preventDefault();
        warnUser({ userId: id, type: warnType, title: warnTitle, message: warnMessage }, {
            onSuccess: () => { setWarnTitle(''); setWarnMessage(''); }
        });
    };

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-neutral-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-white">{user.fullName || user.displayName}</h1>
                    <p className="text-sm text-neutral-400">{user.email}</p>
                </div>
                <span className={cn("text-xs px-3 py-1 rounded-full border font-medium", STATUS_STYLES[user.status])}>
                    {user.status}
                </span>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 bg-neutral-900/50 border border-neutral-800 rounded-xl p-1">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center",
                                activeTab === tab.id ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Info Card */}
                    <div className="lg:col-span-2 bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-neutral-300">Account Info</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {[
                                { label: 'ID', value: user.id },
                                { label: 'Email', value: user.email },
                                { label: 'Display Name', value: user.displayName },
                                { label: 'Username', value: user.username || '—' },
                                { label: 'Phone', value: user.phone || '—' },
                                { label: 'Role', value: user.role || '—' },
                                { label: 'Email Verified', value: user.emailVerified ? '✓ Yes' : '✗ No' },
                                { label: 'Must Change PW', value: user.mustChangePassword ? 'Yes' : 'No' },
                                { label: 'Last Login', value: user.lastLoginAt ? format(new Date(user.lastLoginAt), 'PPpp') : '—' },
                                { label: 'Joined', value: format(new Date(user.createdAt), 'PPpp') },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <div className="text-xs text-neutral-500 mb-0.5">{label}</div>
                                    <div className="text-neutral-200 font-mono text-xs break-all">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-3">
                        <h2 className="text-sm font-semibold text-neutral-300">Quick Actions</h2>
                        {user.status === 'Locked'
                            ? <Button variant="ghost" className="w-full justify-start gap-2 text-emerald-400 hover:bg-emerald-950/30" onClick={() => unlockUser({ userId: id })}><Unlock className="w-4 h-4" /> Unlock User</Button>
                            : <Button variant="ghost" className="w-full justify-start gap-2 text-amber-400 hover:bg-amber-950/30" onClick={() => lockUser({ userId: id })}><Lock className="w-4 h-4" /> Lock User</Button>
                        }
                        <Button variant="ghost" className="w-full justify-start gap-2 text-sky-400 hover:bg-sky-950/30" onClick={() => forcePasswordChange(id)}>
                            <Shield className="w-4 h-4" /> Force Password Change
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-orange-400 hover:bg-orange-950/30" onClick={() => revokeAll(id)}>
                            <WifiOff className="w-4 h-4" /> Revoke All Sessions
                        </Button>
                        {user.status === 'Deleted'
                            ? <Button variant="ghost" className="w-full justify-start gap-2 text-indigo-400 hover:bg-indigo-950/30" onClick={() => restoreUser({ userId: id })}><RotateCcw className="w-4 h-4" /> Restore User</Button>
                            : <Button variant="ghost" className="w-full justify-start gap-2 text-red-400 hover:bg-red-950/30" onClick={() => deleteUser({ userId: id })}><Trash2 className="w-4 h-4" /> Delete User</Button>
                        }

                    </div>
                </div>
            )}

            {/* Access Control Tab */}
            {activeTab === 'access' && (
                <AccessControlTab userId={id} />
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 space-y-5 max-w-xl">
                    <h2 className="text-sm font-semibold text-neutral-300">Edit Profile</h2>
                    <div className="space-y-4">
                        <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Full Name</Label><Input defaultValue={user.fullName || ''} onChange={e => setEditFullName(e.target.value)} className="bg-neutral-950 border-neutral-800" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Username</Label><Input defaultValue={user.username || ''} onChange={e => setEditUsername(e.target.value)} className="bg-neutral-950 border-neutral-800" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Phone</Label><Input defaultValue={user.phone || ''} onChange={e => setEditPhone(e.target.value)} className="bg-neutral-950 border-neutral-800" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Gender</Label>
                            <select defaultValue={user.gender || ''} onChange={e => setEditGender(e.target.value)} className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm focus:outline-none">
                                <option value="">—</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <Button onClick={handleProfileSave} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                        <h2 className="text-sm font-semibold text-neutral-300">Active Sessions</h2>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-950/30" onClick={() => revokeAll(id)}>
                            <WifiOff className="w-4 h-4 mr-1" /> Revoke All
                        </Button>
                    </div>
                    <div className="divide-y divide-neutral-800/50">
                        {!sessions?.length ? <div className="p-6 text-center text-neutral-500 text-sm">No active sessions</div>
                            : sessions.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-4">
                                    <div>
                                        <div className="text-sm font-medium text-white">{s.browser || 'Unknown Browser'} on {s.os || 'Unknown OS'}</div>
                                        <div className="text-xs text-neutral-500">IP: {s.ipAddress || '—'} · Last active: {format(new Date(s.lastActiveAt), 'PPpp')}</div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-950/30 text-xs" onClick={() => revokeSession({ userId: id, sessionId: s.id })}>Revoke</Button>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Warnings Tab */}
            {activeTab === 'warnings' && (
                <div className="space-y-4">
                    <form onSubmit={handleSendWarning} className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-neutral-300">Send Warning</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-neutral-400">Type</Label>
                                <select value={warnType} onChange={e => setWarnType(e.target.value)} className="w-full h-10 px-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm focus:outline-none">
                                    <option value="Spam">Spam</option>
                                    <option value="InappropriateContent">Inappropriate Content</option>
                                    <option value="Abuse">Abuse</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Title</Label><Input value={warnTitle} onChange={e => setWarnTitle(e.target.value)} required className="bg-neutral-950 border-neutral-800" /></div>
                        </div>
                        <div className="space-y-1.5"><Label className="text-xs text-neutral-400">Message</Label><Input value={warnMessage} onChange={e => setWarnMessage(e.target.value)} required className="bg-neutral-950 border-neutral-800" /></div>
                        <Button type="submit" disabled={isWarning}>{isWarning ? 'Sending...' : 'Send Warning'}</Button>
                    </form>

                    <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl divide-y divide-neutral-800/50">
                        {!warnings?.length ? <div className="p-6 text-center text-neutral-500 text-sm">No warnings issued</div>
                            : warnings.map(w => (
                                <div key={w.id} className="p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">{w.type}</span>
                                        <span className="text-sm font-medium text-white">{w.title}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400">{w.message}</p>
                                    <div className="text-xs text-neutral-600 mt-1">By {w.createdByName} · {format(new Date(w.createdAt), 'PPpp')}</div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl divide-y divide-neutral-800/50">
                    {!reports?.length ? <div className="p-6 text-center text-neutral-500 text-sm">No reports against this user</div>
                        : reports.map(r => (
                            <div key={r.id} className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded">{r.reasonCode}</span>
                                        <span className="text-xs text-neutral-500">by {r.reporterEmail}</span>
                                    </div>
                                    <span className="text-xs text-neutral-400">{format(new Date(r.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                                {r.description && <p className="text-xs text-neutral-400 mt-1">{r.description}</p>}
                            </div>
                        ))}
                </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl divide-y divide-neutral-800/50">
                    {!auditLogs?.items?.length ? <div className="p-6 text-center text-neutral-500 text-sm">No admin actions recorded</div>
                        : auditLogs.items.map(log => (
                            <div key={log.id} className="p-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0 mt-0.5">
                                    {log.adminEmail.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">{log.action}</span>
                                        <span className="text-xs text-neutral-500">by {log.adminEmail}</span>
                                    </div>
                                    {log.reason && <p className="text-xs text-neutral-400 mt-1">Reason: {log.reason}</p>}
                                    <div className="text-xs text-neutral-600 mt-0.5">{format(new Date(log.createdAt), 'PPpp')} · IP: {log.ipAddress || '—'}</div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
