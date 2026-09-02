'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useAuditLogs } from '@/lib/api/admin/hooks';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
    USER_LOCKED: 'text-red-400 bg-red-500/10',
    USER_UNLOCKED: 'text-emerald-400 bg-emerald-500/10',
    USER_DELETED: 'text-red-500 bg-red-500/10',
    USER_RESTORED: 'text-sky-400 bg-sky-500/10',
    USER_ROLE_CHANGED: 'text-purple-400 bg-purple-500/10',
    USER_WARNED: 'text-amber-400 bg-amber-500/10',
    SESSION_REVOKED: 'text-orange-400 bg-orange-500/10',
    ALL_SESSIONS_REVOKED: 'text-orange-500 bg-orange-500/10',
    PASSWORD_CHANGE_FORCED: 'text-indigo-400 bg-indigo-500/10',
    USER_UPDATED: 'text-neutral-400 bg-neutral-500/10',
};

export default function AuditLogsPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useAuditLogs(page);

    const logs = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;
    const total = data?.totalCount ?? 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <History className="w-6 h-6 text-indigo-400" />
                    Admin Audit Logs
                </h1>
                <p className="text-sm text-neutral-400 mt-0.5">Complete history of all administrative actions</p>
            </div>

            {/* Admin Sub-nav */}
            <div className="flex items-center gap-1 border-b border-neutral-800 -mt-2 pb-0">
                <a href="/admin/users" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-neutral-600 cursor-pointer">Users</a>
                <a href="/admin/roles" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-neutral-600 cursor-pointer">Roles</a>
                <a href="/admin/audit-logs" className="px-4 py-2 text-sm font-medium text-white border-b-2 border-indigo-500 cursor-pointer">Audit Logs</a>
            </div>

            <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-neutral-800/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-neutral-500">Loading audit logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">No audit entries found.</div>
                    ) : logs.map(log => (
                        <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-neutral-800/20 transition-colors">
                            <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0 mt-0.5">
                                {log.adminEmail.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded font-medium ${ACTION_COLORS[log.action] ?? 'text-neutral-400 bg-neutral-500/10'}`}>
                                        {log.action}
                                    </span>
                                    <span className="text-xs text-neutral-400">by <span className="text-neutral-300">{log.adminEmail}</span></span>
                                    <span className="text-xs text-neutral-600">({log.adminRole})</span>
                                </div>
                                <div className="text-xs text-neutral-500">
                                    Target: <span className="font-mono text-neutral-400">{log.targetId}</span>
                                    {log.reason && <> · Reason: <span className="text-neutral-400">{log.reason}</span></>}
                                </div>
                                {(log.beforeData || log.afterData) && (
                                    <div className="mt-1 flex gap-3 text-xs font-mono">
                                        {log.beforeData && <span className="text-red-400/70">before: {log.beforeData}</span>}
                                        {log.afterData && <span className="text-emerald-400/70">after: {log.afterData}</span>}
                                    </div>
                                )}
                                <div className="text-xs text-neutral-600 mt-1">
                                    {format(new Date(log.createdAt), 'PPpp')} · IP: {log.ipAddress || '—'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800">
                    <span className="text-xs text-neutral-500">{total} total entries</span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-8 w-8 p-0"><ChevronLeft className="w-4 h-4" /></Button>
                        <span className="text-xs text-neutral-400">Page {page} of {totalPages}</span>
                        <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
