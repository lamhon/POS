"use client";

import { cn } from "@/lib/utils";
import { PermissionGroup, RolePermission, RolePermissionInput, PermissionScope } from "@/lib/api/admin/roles-types";
import { Check, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SCOPE_OPTIONS: PermissionScope[] = ["All", "Workspace", "Organization", "Department", "Team", "Assigned", "Own", "Custom"];

const SCOPE_COLORS: Record<PermissionScope, string> = {
    All: "text-emerald-400",
    Workspace: "text-sky-400",
    Organization: "text-blue-400",
    Department: "text-violet-400",
    Team: "text-purple-400",
    Assigned: "text-amber-400",
    Own: "text-orange-400",
    Custom: "text-neutral-400",
};

function ActionCell({
    permissionId,
    action,
    scope,
    isGranted,
    onToggle,
    onScopeChange,
}: {
    permissionId: string;
    action: string;
    scope: PermissionScope;
    isGranted: boolean;
    onToggle: () => void;
    onScopeChange: (scope: PermissionScope) => void;
}) {

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={onToggle}
                className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border",
                    isGranted
                        ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25"
                        : "bg-neutral-800/50 text-neutral-500 border-neutral-700/50 hover:bg-neutral-700/50 hover:text-neutral-300"
                )}
            >
                {isGranted && <Check className="w-3 h-3" />}
                {action}
            </button>
            {isGranted && (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className={cn("text-xs px-1.5 py-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-0.5 outline-none", SCOPE_COLORS[scope])}
                    >
                        {scope}
                        <ChevronDown className="w-2.5 h-2.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-neutral-900 border-neutral-700 w-32">
                        {SCOPE_OPTIONS.map((s) => (
                            <DropdownMenuItem
                                key={s}
                                onClick={() => onScopeChange(s)}
                                className={cn("text-xs cursor-pointer flex items-center justify-between focus:bg-neutral-800", SCOPE_COLORS[s], scope === s ? "font-bold bg-neutral-800/60" : "")}
                            >
                                <span>{s}</span>
                                {scope === s && <Check className="w-3.5 h-3.5" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

export default function PermissionMatrix({
    groups,
    value,
    onChange,
    readOnly = false,
}: {
    groups: PermissionGroup[];
    value: RolePermissionInput[];
    onChange: (value: RolePermissionInput[]) => void;
    readOnly?: boolean;
}) {
    const grantedMap = new Map(value.map((p) => [p.permissionId, p.scope ?? "All"]));

    const toggle = (permissionId: string) => {
        if (grantedMap.has(permissionId)) {
            onChange(value.filter((p) => p.permissionId !== permissionId));
        } else {
            onChange([...value, { permissionId, scope: "All" }]);
        }
    };

    const setScope = (permissionId: string, scope: PermissionScope) => {
        onChange(value.map((p) => p.permissionId === permissionId ? { ...p, scope } : p));
    };

    const toggleAll = (ids: string[], shouldGrant: boolean) => {
        if (shouldGrant) {
            const existing = new Set(value.map((p) => p.permissionId));
            const toAdd = ids.filter((id) => !existing.has(id)).map((id) => ({ permissionId: id, scope: "All" as PermissionScope }));
            onChange([...value, ...toAdd]);
        } else {
            onChange(value.filter((p) => !ids.includes(p.permissionId)));
        }
    };

    if (groups.length === 0) {
        return <div className="text-neutral-500 text-sm text-center py-8">No permissions available</div>;
    }

    return (
        <div className="space-y-4">
            {groups.map((group) => {
                const allIds = group.resources.flatMap((r) => r.actions.map((a) => a.id));
                const grantedCount = allIds.filter((id) => grantedMap.has(id)).length;
                const allGranted = grantedCount === allIds.length;

                return (
                    <div key={group.module} className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-visible">
                        {/* Module header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-800/40 border-b border-neutral-800 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wide">{group.module}</span>
                                <span className="text-xs text-neutral-500">{grantedCount}/{allIds.length} granted</span>
                            </div>
                            {!readOnly && (
                                <button
                                    onClick={() => toggleAll(allIds, !allGranted)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                                >
                                    {allGranted ? "Revoke all" : "Grant all"}
                                </button>
                            )}
                        </div>

                        {/* Resources */}
                        <div className="divide-y divide-neutral-800/50">
                            {group.resources.map((resource) => {
                                const resourceIds = resource.actions.map((a) => a.id);
                                const resourceGranted = resourceIds.filter((id) => grantedMap.has(id)).length;
                                const allResourceGranted = resourceGranted === resourceIds.length;

                                return (
                                    <div key={resource.resource} className="flex items-start gap-4 px-4 py-3">
                                        {/* Resource name */}
                                        <div className="w-28 shrink-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-neutral-300 capitalize">{resource.resource}</span>
                                            </div>
                                            {!readOnly && (
                                                <button
                                                    onClick={() => toggleAll(resourceIds, !allResourceGranted)}
                                                    className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer"
                                                >
                                                    {allResourceGranted ? "Revoke all" : "All"}
                                                </button>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {resource.actions.map((action) => {
                                                const isGranted = grantedMap.has(action.id);
                                                const scope = (grantedMap.get(action.id) ?? "All") as PermissionScope;
                                                return (
                                                    <ActionCell
                                                        key={action.id}
                                                        permissionId={action.id}
                                                        action={action.action}
                                                        scope={scope}
                                                        isGranted={isGranted}
                                                        onToggle={readOnly ? () => {} : () => toggle(action.id)}
                                                        onScopeChange={readOnly ? () => {} : (s) => setScope(action.id, s)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
