"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Shield, Plus, Search, Copy, Archive, Trash2, MoreVertical,
    ChevronRight, Users, Key, Settings2, ShieldCheck, User,
    RotateCcw, CheckCircle2, RefreshCcw, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoles, useDeleteRole, useDuplicateRole, useToggleArchiveRole } from "@/lib/api/admin/roles-hooks";
import { RoleList } from "@/lib/api/admin/roles-types";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoleEditorDialog from "./_components/RoleEditorDialog";
import RoleDetailDialog from "./_components/RoleDetailDialog";

const TYPE_STYLES: Record<string, string> = {
    System: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
    Custom: "bg-violet-500/10 text-violet-400 border-violet-500/25",
};

const STATUS_STYLES: Record<string, string> = {
    Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    Archived: "bg-neutral-500/10 text-neutral-400 border-neutral-500/25",
};

function RoleCard({
    role,
    onView,
    onEdit,
    onDuplicate,
    onToggleArchive,
    onDelete,
}: {
    role: RoleList;
    onView: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onToggleArchive: () => void;
    onDelete: () => void;
}) {
    return (
        <div
            onClick={onView}
            className={cn(
                "group relative bg-neutral-900 border rounded-xl p-5 transition-all duration-200 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/20 cursor-pointer",
                role.status === "Archived" ? "border-neutral-800 opacity-60" : "border-neutral-800"
            )}
        >
            {/* Top section: icon + name */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-inner"
                        style={{ backgroundColor: role.color ?? "#6366f1", opacity: 0.9 }}
                    >
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white leading-tight">{role.name}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1 max-w-[180px]">{role.description}</p>
                    </div>
                </div>

                <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="w-7 h-7 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer outline-none">
                            <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 w-44">
                            <DropdownMenuItem onClick={onView} className="text-neutral-300 focus:bg-neutral-800 focus:text-white cursor-pointer">
                                <Key className="w-3.5 h-3.5 mr-2" /> View Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onEdit} className="text-neutral-300 focus:bg-neutral-800 focus:text-white cursor-pointer">
                                <Settings2 className="w-3.5 h-3.5 mr-2" /> Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDuplicate} className="text-neutral-300 focus:bg-neutral-800 focus:text-white cursor-pointer">
                                <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-neutral-800" />
                            <DropdownMenuItem onClick={onToggleArchive} disabled={role.type === "System"} className="text-amber-400 focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer">
                                <Archive className="w-3.5 h-3.5 mr-2" /> {role.status === "Archived" ? "Restore" : "Archive"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} disabled={role.type === "System" || role.userCount > 0} className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{role.userCount} {role.userCount === 1 ? "user" : "users"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Key className="w-3.5 h-3.5" />
                    <span>{role.permissionCount} permissions</span>
                </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", TYPE_STYLES[role.type])}>
                    {role.type}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", STATUS_STYLES[role.status])}>
                    {role.status}
                </span>
            </div>
        </div>
    );
}

export default function RolesPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("Active");
    const [page, setPage] = useState(1);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailRoleId, setDetailRoleId] = useState<string | null>(null);
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [duplicateRoleId, setDuplicateRoleId] = useState<string | null>(null);
    const [duplicateName, setDuplicateName] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const { data: rolesPage, isLoading, refetch } = useRoles({
        search: search || undefined,
        type: typeFilter as any || undefined,
        status: statusFilter as any || undefined,
        pageNumber: page,
        pageSize: 20,
    });

    const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
    const { mutate: duplicateRole, isPending: isDuplicating } = useDuplicateRole();
    const { mutate: toggleArchive, isPending: isArchiving } = useToggleArchiveRole();

    const roles = rolesPage?.items ?? [];
    const totalPages = rolesPage?.totalPages ?? 1;

    const handleDuplicate = (roleId: string, name: string) => {
        setDuplicateRoleId(roleId);
        setDuplicateName(`Copy of ${name}`);
        setDuplicateDialogOpen(true);
    };

    const handleDuplicateConfirm = () => {
        if (!duplicateRoleId || !duplicateName.trim()) return;
        duplicateRole({ id: duplicateRoleId, newName: duplicateName.trim() }, {
            onSuccess: () => setDuplicateDialogOpen(false),
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteConfirmId) return;
        deleteRole(deleteConfirmId, {
            onSuccess: () => setDeleteConfirmId(null),
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        Role Management
                    </h1>
                    <p className="text-sm text-neutral-400 mt-0.5">
                        Manage system and custom roles, assign permissions with data scopes
                    </p>
                </div>
                <Button
                    onClick={() => { setEditorMode("create"); setSelectedRoleId(null); setEditorOpen(true); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> New Role
                </Button>
            </div>

            {/* Admin Sub-nav */}
            <div className="flex items-center gap-1 border-b border-neutral-800 -mt-2 pb-0">
                <a href="/admin/users" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-neutral-600 cursor-pointer">Users</a>
                <a href="/admin/roles" className="px-4 py-2 text-sm font-medium text-white border-b-2 border-indigo-500 cursor-pointer">Roles</a>
                <a href="/admin/audit-logs" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-neutral-600 cursor-pointer">Audit Logs</a>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                        placeholder="Search roles..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 h-9"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="h-9 px-3 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                    <option value="">All Types</option>
                    <option value="System">System</option>
                    <option value="Custom">Custom</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="h-9 px-3 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                </select>
                <button
                    onClick={() => refetch()}
                    className="h-9 w-9 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-colors"
                >
                    <RefreshCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Count summary */}
            {rolesPage && (
                <p className="text-xs text-neutral-500">
                    Showing {roles.length} of {rolesPage.totalCount} roles
                </p>
            )}

            {/* Role grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
                </div>
            ) : roles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                    <ShieldCheck className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">No roles found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onView={() => { setDetailRoleId(role.id); setDetailOpen(true); }}
                            onEdit={() => { setSelectedRoleId(role.id); setEditorMode("edit"); setEditorOpen(true); }}
                            onDuplicate={() => handleDuplicate(role.id, role.name)}
                            onToggleArchive={() => toggleArchive(role.id)}
                            onDelete={() => setDeleteConfirmId(role.id)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border-neutral-800 cursor-pointer">
                        Previous
                    </Button>
                    <span className="text-sm text-neutral-400">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="border-neutral-800 cursor-pointer">
                        Next
                    </Button>
                </div>
            )}

            {/* Role Editor Dialog */}
            {editorOpen && (
                <RoleEditorDialog
                    mode={editorMode}
                    roleId={selectedRoleId}
                    onClose={() => setEditorOpen(false)}
                />
            )}

            {/* Role Detail Dialog */}
            {detailOpen && detailRoleId && (
                <RoleDetailDialog
                    roleId={detailRoleId}
                    onClose={() => setDetailOpen(false)}
                    onEdit={() => { setDetailOpen(false); setSelectedRoleId(detailRoleId); setEditorMode("edit"); setEditorOpen(true); }}
                />
            )}

            {/* Duplicate Dialog */}
            {duplicateDialogOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-white">Duplicate Role</h2>
                            <button onClick={() => setDuplicateDialogOpen(false)} className="text-neutral-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-neutral-400 mb-4">Enter a name for the new role copy.</p>
                        <Input
                            value={duplicateName}
                            onChange={(e) => setDuplicateName(e.target.value)}
                            placeholder="New role name..."
                            className="bg-neutral-800 border-neutral-700 text-white mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setDuplicateDialogOpen(false)} className="cursor-pointer">Cancel</Button>
                            <Button onClick={handleDuplicateConfirm} disabled={!duplicateName.trim() || isDuplicating} className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer">
                                {isDuplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Duplicate"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-white text-red-400">Delete Role</h2>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-neutral-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-neutral-400 mb-6">
                            This action is <strong className="text-white">permanent</strong> and cannot be undone. The role will be deleted along with all its permission assignments.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)} className="cursor-pointer">Cancel</Button>
                            <Button onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-500 text-white cursor-pointer">
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Role"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
