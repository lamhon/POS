"use client";

import { useState, useEffect } from "react";
import { useRoles, useAssignUserRoles, useUserEffectivePermissions } from "@/lib/api/admin/roles-hooks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Shield, Key } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AccessControlTab({ userId }: { userId: string }) {
    const { data: rolesPage, isLoading: loadingRoles } = useRoles({ pageSize: 100 });
    const { data: effectivePerms, isLoading: loadingPerms } = useUserEffectivePermissions(userId);
    const { mutate: assignRoles, isPending: isAssigning } = useAssignUserRoles();

    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

    const handleSave = () => {
        assignRoles({ userId, roleIds: Array.from(selectedRoles) });
    };

    const roles = rolesPage?.items ?? [];

    const toggleRole = (roleId: string) => {
        setSelectedRoles((prev) => {
            const next = new Set(prev);
            if (next.has(roleId)) next.delete(roleId);
            else next.add(roleId);
            return next;
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles Selection */}
            <div className="lg:col-span-1 bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4 h-fit">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Assigned Roles
                    </h2>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isAssigning}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-xs cursor-pointer"
                    >
                        {isAssigning ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Save
                    </Button>
                </div>
                
                <div className="space-y-2">
                    {loadingRoles ? (
                        <div className="text-sm text-neutral-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading roles...</div>
                    ) : roles.length === 0 ? (
                        <div className="text-sm text-neutral-500">No roles available.</div>
                    ) : (
                        roles.map((role) => (
                            <label
                                key={role.id}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                                    selectedRoles.has(role.id)
                                        ? "bg-indigo-500/10 border-indigo-500/30"
                                        : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                                )}
                            >
                                <Checkbox
                                    checked={selectedRoles.has(role.id)}
                                    onCheckedChange={() => toggleRole(role.id)}
                                />
                                <div>
                                    <div className="text-sm font-medium text-white">{role.name}</div>
                                    <div className="text-xs text-neutral-500">{role.type}</div>
                                </div>
                            </label>
                        ))
                    )}
                </div>
            </div>

            {/* Effective Permissions */}
            <div className="lg:col-span-2 bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    Effective Permissions
                </h2>
                <p className="text-xs text-neutral-500">
                    This is the union of all permissions granted by the user's assigned roles.
                </p>

                {loadingPerms ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-neutral-600" /></div>
                ) : (
                    <div className="bg-neutral-950 rounded-lg p-4 max-h-[600px] overflow-y-auto border border-neutral-800">
                        {effectivePerms?.length === 0 ? (
                            <div className="text-sm text-neutral-500 text-center py-4">No permissions granted.</div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(
                                    (effectivePerms ?? []).reduce((acc, p) => {
                                        if (!acc[p.module]) acc[p.module] = [];
                                        acc[p.module]!.push(p);
                                        return acc;
                                    }, {} as Record<string, typeof effectivePerms>)
                                ).map(([module, perms]) => (
                                    <div key={module}>
                                        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{module}</h4>
                                        <div className="space-y-2 pl-2 border-l border-neutral-800">
                                            {perms?.map((p, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <span className="text-white capitalize min-w-24">{p.resource}</span>
                                                    <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-xs">{p.action}</span>
                                                    <span className="text-neutral-500 text-xs">— Scope: <span className="text-amber-400">{p.scope}</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
