"use client";

import { cn } from "@/lib/utils";
import { X, Shield, Loader2, Settings2, Users, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoleById, useAllPermissions } from "@/lib/api/admin/roles-hooks";
import PermissionMatrix from "./PermissionMatrix";

interface RoleDetailDialogProps {
    roleId: string;
    onClose: () => void;
    onEdit: () => void;
}

const TYPE_STYLES: Record<string, string> = {
    System: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
    Custom: "bg-violet-500/10 text-violet-400 border-violet-500/25",
};
const STATUS_STYLES: Record<string, string> = {
    Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    Archived: "bg-neutral-500/10 text-neutral-400 border-neutral-500/25",
};

export default function RoleDetailDialog({ roleId, onClose, onEdit }: RoleDetailDialogProps) {
    const { data: role, isLoading } = useRoleById(roleId);
    const { data: permGroups = [], isLoading: loadingPerms } = useAllPermissions();

    const readonlyPermissions = role?.permissions.map((p) => ({
        permissionId: p.permissionId,
        scope: p.scope,
    })) ?? [];

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-end">
            <div className="h-full w-full max-w-2xl bg-neutral-950 border-l border-neutral-800 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: role?.color ?? "#6366f1" }}
                        >
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">{role?.name ?? "Loading..."}</h2>
                            <p className="text-xs text-neutral-400 line-clamp-1">{role?.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onEdit}
                            className="text-neutral-400 hover:text-white gap-1.5 cursor-pointer"
                        >
                            <Settings2 className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
                    </div>
                ) : role ? (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center">
                                <div className="text-xl font-bold text-white">{role.userCount}</div>
                                <div className="text-xs text-neutral-400 mt-0.5 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Users</div>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center">
                                <div className="text-xl font-bold text-white">{role.permissionCount}</div>
                                <div className="text-xs text-neutral-400 mt-0.5 flex items-center justify-center gap-1"><Key className="w-3 h-3" /> Permissions</div>
                            </div>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center">
                                <div className="flex flex-wrap justify-center gap-1 mt-1">
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", TYPE_STYLES[role.type])}>{role.type}</span>
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full border", STATUS_STYLES[role.status])}>{role.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Permission Matrix (read-only) */}
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-300 mb-3">Granted Permissions</h3>
                            {loadingPerms ? (
                                <div className="flex items-center justify-center h-24"><Loader2 className="w-5 h-5 animate-spin text-neutral-600" /></div>
                            ) : (
                                <PermissionMatrix
                                    groups={permGroups}
                                    value={readonlyPermissions}
                                    onChange={() => {}}
                                    readOnly={true}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-neutral-500">Role not found</div>
                )}
            </div>
        </div>
    );
}
