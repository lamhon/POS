"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Shield, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAllPermissions, useRoleById, useCreateRole, useUpdateRole } from "@/lib/api/admin/roles-hooks";
import { RolePermissionInput } from "@/lib/api/admin/roles-types";
import PermissionMatrix from "./PermissionMatrix";

const PRESET_COLORS = [
    "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#10b981", "#06b6d4", "#0ea5e9", "#3b82f6",
    "#6b7280", "#78716c",
];

interface RoleEditorDialogProps {
    mode: "create" | "edit";
    roleId: string | null;
    onClose: () => void;
}

export default function RoleEditorDialog({ mode, roleId, onClose }: RoleEditorDialogProps) {
    const { data: roleDetail, isLoading: loadingRole } = useRoleById(roleId ?? "");
    const { data: permissionGroups = [], isLoading: loadingPerms } = useAllPermissions();
    const { mutate: createRole, isPending: creating } = useCreateRole();
    const { mutate: updateRole, isPending: updating } = useUpdateRole();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("shield");
    const [color, setColor] = useState("#6366f1");
    const [permissions, setPermissions] = useState<RolePermissionInput[]>([]);

    // Populate form when editing
    useEffect(() => {
        if (mode === "edit" && roleDetail) {
            setName(roleDetail.name);
            setDescription(roleDetail.description);
            setIcon(roleDetail.icon ?? "shield");
            setColor(roleDetail.color ?? "#6366f1");
            setPermissions(roleDetail.permissions.map((p) => ({ permissionId: p.permissionId, scope: p.scope })));
        }
    }, [mode, roleDetail]);

    const isLoading = loadingPerms || (mode === "edit" && loadingRole);
    const isSaving = creating || updating;
    const isSystemRole = mode === "edit" && roleDetail?.type === "System";

    const handleSave = () => {
        const payload = { name, description, icon, color, permissions };
        if (mode === "create") {
            createRole(payload, { onSuccess: onClose });
        } else if (roleId) {
            updateRole({ id: roleId, payload: { description, icon, color, permissions } }, { onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-end">
            <div className="h-full w-full max-w-3xl bg-neutral-950 border-l border-neutral-800 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">{mode === "create" ? "Create New Role" : `Edit: ${roleDetail?.name ?? ""}`}</h2>
                            <p className="text-xs text-neutral-400">{mode === "create" ? "Define a custom role with specific permissions" : "Modify role description, icon and permissions"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 pb-36 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-neutral-300">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs text-neutral-400">Role Name</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isSystemRole}
                                        placeholder="e.g. Content Manager"
                                        className="bg-neutral-800 border-neutral-700 text-white"
                                    />
                                    {isSystemRole && <p className="text-xs text-amber-500">System role names cannot be changed.</p>}
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs text-neutral-400">Description</Label>
                                    <Input
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of this role's purpose"
                                        className="bg-neutral-800 border-neutral-700 text-white"
                                    />
                                </div>
                            </div>

                            {/* Color picker */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-neutral-400">Role Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={cn("w-7 h-7 rounded-full transition-all cursor-pointer border-2", color === c ? "border-white scale-110" : "border-transparent hover:border-neutral-500")}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Permission Matrix */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-neutral-300">Permissions</h3>
                                <span className="text-xs text-neutral-500">
                                    {permissions.length} granted &nbsp;·&nbsp; Click scope to change data access level
                                </span>
                            </div>
                            <PermissionMatrix
                                groups={permissionGroups}
                                value={permissions}
                                onChange={setPermissions}
                                readOnly={false}
                            />
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 shrink-0">
                    <Button variant="ghost" onClick={onClose} className="cursor-pointer">Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 cursor-pointer"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {mode === "create" ? "Create Role" : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
