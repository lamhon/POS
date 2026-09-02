'use client';

import { useState } from 'react';
import { useWorkspaces, useProjects, useTasks, useCreateWorkspace, useArchiveWorkspace, useDeleteWorkspace, useUpdateWorkspace } from '@/lib/api/tasks/hooks';
import { Task, TaskStatus, TaskPriority, Workspace } from '@/lib/api/tasks/types';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Plus, Search, LayoutList, LayoutDashboard,
  ChevronRight, Folder, CheckCircle2, Circle,
  AlertCircle, Clock, Flame, ArrowUpCircle, Minus,
  FolderOpen, ChevronDown, Archive, Trash2, MoreVertical,
  Pin, Settings, Pencil
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { getCategoryIconComponent } from '@/components/ui/icon-picker';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskDetailDrawer } from './_components/TaskDetailDrawer';
import { CreateTaskDialog } from './_components/CreateTaskDialog';
import { CreateWorkspaceDialog } from './_components/CreateWorkspaceDialog';
import { RenameWorkspaceDialog } from './_components/RenameWorkspaceDialog';
import { WorkspaceSettingsDialog } from './_components/WorkspaceSettingsDialog';
import { UserSelect } from './_components/UserSelect';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { STATUS_CONFIG, PRIORITY_CONFIG } from './constants';

type ViewMode = 'list' | 'board';

const BOARD_COLUMNS: TaskStatus[] = ['Todo', 'In Progress', 'Done', 'Blocked'];

const WorkspaceIcon = ({ icon, color }: { icon?: string; color?: string }) => {
  const IconComp = getCategoryIconComponent(icon);
  if (IconComp) {
    return <IconComp className="h-4 w-4 shrink-0" style={{ color: color || undefined }} />;
  }
  return <span className="text-base leading-none shrink-0" style={{ color: color || undefined }}>{icon || '📁'}</span>;
};

export default function TasksPage() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dueDateFrom, setDueDateFrom] = useState<string>('');
  const [dueDateTo, setDueDateTo] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);
  const [workspaceToRename, setWorkspaceToRename] = useState<Workspace | null>(null);
  const [workspaceToSettings, setWorkspaceToSettings] = useState<Workspace | null>(null);

  const { data: workspaces, isLoading: loadingWorkspaces } = useWorkspaces();
  const archiveWorkspace = useArchiveWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const updateWorkspace = useUpdateWorkspace();

  const selectedWorkspace = workspaces?.find(w => w.id === selectedWorkspaceId);
  const isSelectedWorkspaceArchived = selectedWorkspace?.isArchived;

  const activeWorkspaces = (workspaces ?? []).filter(w => !w.isArchived);
  const archivedWorkspaces = (workspaces ?? []).filter(w => w.isArchived);
  const { data: projects } = useProjects(selectedWorkspaceId ?? '');
  const { data: taskData, isLoading: loadingTasks } = useTasks({
    workspaceId: selectedWorkspaceId,
    projectId: selectedProjectId,
    search: search || undefined,
    assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    dueDateFrom: dueDateFrom ? new Date(dueDateFrom).toISOString() : undefined,
    dueDateTo: dueDateTo ? new Date(dueDateTo).toISOString() : undefined,
    includeArchived,
    pageSize: 50,
  });

  const tasks = taskData?.items ?? [];

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-background overflow-y-auto">
        <div className="p-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspaces</span>
          <Button
            variant="ghost" size="icon"
            className="h-6 w-6"
            onClick={() => setIsCreateWorkspaceOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {loadingWorkspaces ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : (
          <>
            {activeWorkspaces.map(ws => (
              <div key={ws.id}>
                <div
                  className={cn(
                    'w-full flex items-center pr-2 hover:bg-muted/70 transition-colors group/ws relative cursor-pointer',
                    selectedWorkspaceId === ws.id && !selectedProjectId ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  )}
                  onClick={() => {
                    toggleWorkspace(ws.id);
                    setSelectedWorkspaceId(ws.id);
                    setSelectedProjectId(undefined);
                  }}
                >
                  <div className="flex-1 flex items-center gap-2 px-4 py-2 text-sm">
                    <WorkspaceIcon icon={ws.icon} color={ws.color} />
                    <span className="flex-1 truncate text-left flex items-center gap-2">
                      {ws.name}
                      {ws.isPinned && <Pin className="h-3.5 w-3.5 text-muted-foreground shrink-0 fill-neutral-400" />}
                    </span>
                    <ChevronRight className={cn('h-3.5 w-3.5 transition-transform mr-6', expandedWorkspaces.has(ws.id) && 'rotate-90')} />
                  </div>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/ws:opacity-100 transition-all z-20 flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <button
                          type="button"
                          className="h-6 w-6 hover:bg-muted/80 flex items-center justify-center rounded text-muted-foreground hover:text-foreground pointer-events-none group-hover/ws:pointer-events-auto cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          title="Workspace Options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      } />
                      <DropdownMenuContent align="end" className="w-40 bg-muted border border-border text-foreground rounded-lg p-1 shadow-lg mt-1 z-30">
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md cursor-pointer transition-colors text-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceToRename(ws);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md cursor-pointer transition-colors text-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateWorkspace.mutate({ id: ws.id, payload: { isPinned: !ws.isPinned } });
                          }}
                        >
                          <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{ws.isPinned ? 'Unpin' : 'Pin to top'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md cursor-pointer transition-colors text-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceToSettings(ws);
                          }}
                        >
                          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <div className="h-px bg-muted my-1" />
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded-md cursor-pointer transition-colors text-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveWorkspace.mutate(ws.id);
                          }}
                        >
                          <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Archive</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-red-950/20 rounded-md cursor-pointer transition-colors text-red-400 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkspaceToDelete(ws.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Projects under workspace */}
                {expandedWorkspaces.has(ws.id) && (projects ?? [])
                  .filter(p => p.workspaceId === ws.id)
                  .map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => { setSelectedWorkspaceId(ws.id); setSelectedProjectId(proj.id); }}
                      className={cn(
                        'w-full flex items-center gap-2 pl-8 pr-4 py-1.5 text-sm hover:bg-muted/70 transition-colors',
                        selectedProjectId === proj.id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <Folder className="h-3.5 w-3.5" />
                      <span className="flex-1 truncate text-left">{proj.name}</span>
                    </button>
                  ))
                }
              </div>
            ))}

            {archivedWorkspaces.length > 0 && (
              <div className="mt-6">
                <div className="p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Archived Workspaces</span>
                </div>
                {archivedWorkspaces.map(ws => (
                  <div key={ws.id}>
                    <div
                      className={cn(
                        'w-full flex items-center hover:bg-muted/70 transition-colors cursor-pointer',
                        selectedWorkspaceId === ws.id && !selectedProjectId ? 'bg-muted text-foreground' : 'text-muted-foreground opacity-60'
                      )}
                      onClick={() => {
                        toggleWorkspace(ws.id);
                        setSelectedWorkspaceId(ws.id);
                        setSelectedProjectId(undefined);
                      }}
                    >
                      <div className="flex-1 flex items-center gap-2 px-4 py-2 text-sm">
                        <WorkspaceIcon icon={ws.icon} color={ws.color} />
                        <span className="flex-1 truncate text-left">{ws.name}</span>
                        <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', expandedWorkspaces.has(ws.id) && 'rotate-90')} />
                      </div>
                    </div>

                    {/* Projects under workspace */}
                    {expandedWorkspaces.has(ws.id) && (projects ?? [])
                      .filter(p => p.workspaceId === ws.id)
                      .map(proj => (
                        <button
                          key={proj.id}
                          onClick={() => { setSelectedWorkspaceId(ws.id); setSelectedProjectId(proj.id); }}
                          className={cn(
                            'w-full flex items-center gap-2 pl-8 pr-4 py-1.5 text-sm hover:bg-muted/70 transition-colors opacity-60',
                            selectedProjectId === proj.id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          <Folder className="h-3.5 w-3.5" />
                          <span className="flex-1 truncate text-left">{proj.name}</span>
                        </button>
                      ))
                    }
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </aside>

      {/* ─── Main Panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold">
              {selectedProjectId
                ? (projects?.find(p => p.id === selectedProjectId)?.name ?? 'Project')
                : selectedWorkspaceId
                  ? (workspaces?.find(w => w.id === selectedWorkspaceId)?.name ?? 'Workspace')
                  : 'All Tasks'}
            </h1>
            {taskData && (
              <span className="text-xs text-muted-foreground">{taskData.totalCount} tasks</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Show Archived Toggle */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={e => setIncludeArchived(e.target.checked)}
                className="rounded border-border bg-muted text-primary focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
              />
              Show Archived
            </label>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 w-44 text-sm bg-muted border-border"
              />
            </div>

            <div className="flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn('px-2.5 py-1.5 transition-colors', viewMode === 'list' ? 'bg-muted/80 text-foreground' : 'text-muted-foreground hover:bg-muted')}
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={cn('px-2.5 py-1.5 transition-colors', viewMode === 'board' ? 'bg-muted/80 text-foreground' : 'text-muted-foreground hover:bg-muted')}
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setIsCreateOpen(true)}
              disabled={!selectedWorkspaceId || isSelectedWorkspaceArchived}
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Archived Workspace Banner */}
        {selectedWorkspaceId && isSelectedWorkspaceArchived && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-amber-400">Workspace has been archived</span>
                <span className="text-xs text-amber-500/90">
                  This workspace is in read-only mode for creating new items. You can restore the workspace to continue working.
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 shrink-0 ml-4 h-8"
              onClick={() => archiveWorkspace.mutate(selectedWorkspaceId)}
              disabled={archiveWorkspace.isPending}
            >
              Restore Workspace
            </Button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="px-6 py-2 border-b border-border bg-background/50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Assignees:</span>
            <UserSelect multiple value={assigneeIds} onChange={setAssigneeIds} size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? 'all')}>
              <SelectTrigger className="h-7 text-xs w-[145px] bg-muted border-border cursor-pointer">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  <span className="text-muted-foreground">All Status</span>
                </SelectItem>
                {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                  <SelectItem key={s} value={s} className="cursor-pointer">
                    <span className={cn('flex items-center gap-1.5 text-[11px] font-medium', cfg.color)}>
                      {cfg.icon}
                      <span>{s}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Priority:</span>
            <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val ?? 'all')}>
              <SelectTrigger className="h-7 text-xs w-[130px] bg-muted border-border cursor-pointer">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  <span className="text-muted-foreground">All Priority</span>
                </SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([p, cfg]) => (
                  <SelectItem key={p} value={p} className="cursor-pointer">
                    <span className={cn('flex items-center gap-1.5 w-fit px-1.5 py-0.5 rounded text-[11px] font-medium', cfg.color)}>
                      {cfg.icon}
                      <span>{p}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Due Date:</span>
            <Input type="date" value={dueDateFrom} onChange={e => setDueDateFrom(e.target.value)} className="h-7 text-xs w-[140px] bg-muted border-border cursor-pointer py-0 px-2 rounded-md" />
            <span className="text-xs text-muted-foreground">-</span>
            <Input type="date" value={dueDateTo} onChange={e => setDueDateTo(e.target.value)} className="h-7 text-xs w-[140px] bg-muted border-border cursor-pointer py-0 px-2 rounded-md" />
          </div>

          {(assigneeIds.length > 0 || statusFilter !== 'all' || priorityFilter !== 'all' || dueDateFrom || dueDateTo) && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground px-2 ml-auto" onClick={() => {
              setAssigneeIds([]);
              setStatusFilter('all');
              setPriorityFilter('all');
              setDueDateFrom('');
              setDueDateTo('');
            }}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Task Content */}
        <div className="flex-1 overflow-auto">
          {!selectedWorkspaceId ? (
            <EmptyState
              icon="🗂️"
              title="Select a workspace"
              description="Choose a workspace from the sidebar to view tasks, or create a new one."
              action={<Button size="sm" onClick={() => setIsCreateWorkspaceOpen(true)}>Create Workspace</Button>}
            />
          ) : loadingTasks ? (
            <div className="flex items-center justify-center h-full"><Spinner /></div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon="✅"
              title={isSelectedWorkspaceArchived ? "No tasks in archived workspace" : "No tasks yet"}
              description={isSelectedWorkspaceArchived ? "Tasks cannot be created in archived workspaces." : "Create your first task to get started."}
              action={<Button size="sm" onClick={() => setIsCreateOpen(true)} disabled={isSelectedWorkspaceArchived}>New Task</Button>}
            />
          ) : viewMode === 'list' ? (
            <ListView tasks={tasks} onTaskClick={handleTaskClick} />
          ) : (
            <BoardView tasks={tasks} onTaskClick={handleTaskClick} />
          )}
        </div>
      </div>

      {/* ─── Task Detail Drawer ───────────────────────────────────────────── */}
      <TaskDetailDrawer
        taskId={selectedTask?.id ?? null}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onTaskIdChange={(id) => {
          console.log('onTaskIdChange called in page.tsx with ID:', id);
          if (id) {
            // Navigate to a different task/subtask in the drawer
            console.log('Setting selectedTask to:', id);
            setSelectedTask({ id } as any);
          } else {
            console.log('No ID provided, closing drawer');
            setIsDetailOpen(false);
          }
        }}
      />

      {/* ─── Create Task Dialog ───────────────────────────────────────────── */}
      <CreateTaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        workspaceId={selectedWorkspaceId ?? ''}
        projectId={selectedProjectId}
      />

      {/* ─── Create Workspace Dialog ──────────────────────────────────────── */}
      <CreateWorkspaceDialog
        open={isCreateWorkspaceOpen}
        onOpenChange={setIsCreateWorkspaceOpen}
      />

      <RenameWorkspaceDialog
        workspace={workspaceToRename}
        open={!!workspaceToRename}
        onOpenChange={(open) => !open && setWorkspaceToRename(null)}
      />

      <WorkspaceSettingsDialog
        workspace={workspaceToSettings}
        open={!!workspaceToSettings}
        onOpenChange={(open) => !open && setWorkspaceToSettings(null)}
      />

      {/* ─── Delete Workspace Confirmation ─────────────────────────────────── */}
      <Dialog open={!!workspaceToDelete} onOpenChange={(open) => !open && setWorkspaceToDelete(null)}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this workspace? All projects and tasks inside will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setWorkspaceToDelete(null)} disabled={deleteWorkspace.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-foreground hover:bg-red-700"
              onClick={() => {
                if (workspaceToDelete) {
                  deleteWorkspace.mutate(workspaceToDelete, {
                    onSuccess: () => setWorkspaceToDelete(null)
                  });
                }
              }}
              disabled={deleteWorkspace.isPending}
            >
              {deleteWorkspace.isPending ? <Spinner className="mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function AssigneeAvatars({ assignees, className }: { assignees?: { displayName: string }[], className?: string }) {
  if (!assignees || assignees.length === 0) return null;
  const displayAssignees = assignees.slice(0, 3);
  const extraCount = assignees.length - 3;

  return (
    <div className={cn("flex items-center -space-x-1.5", className)}>
      {displayAssignees.map((assignee, i) => {
        const parts = assignee.displayName.split(' ');
        const initials = parts.length === 1 ? parts[0].substring(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return (
          <div key={i} className="w-5 h-5 flex-shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-semibold border border-border" title={assignee.displayName}>
            {initials}
          </div>
        );
      })}
      {extraCount > 0 && (
        <div className="w-5 h-5 flex-shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-semibold border border-border" title={`${extraCount} more`}>
          +{extraCount}
        </div>
      )}
    </div>
  );
}

const calculateProgress = (task: Task): number => {
  const totalSubtasks = task.subtaskCount || 0;
  const completedSubtasks = task.completedSubtaskCount || 0;

  if (totalSubtasks === 0) {
    return task.status === 'Done' ? 100 : 0;
  }

  return Math.round((completedSubtasks / totalSubtasks) * 100);
};

function ListView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (t: Task) => void }) {
  return (
    <div className="divide-y divide-neutral-800/50">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_100px_160px_120px_100px_110px] px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <span>Task</span>
        <span>Progress</span>
        <span>Assignees</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Due Date</span>
      </div>
      {tasks.map(task => <TaskRow key={task.id} task={task} onClick={() => onTaskClick(task)} />)}
    </div>
  );
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG['Todo'];
  const priorityCfg = PRIORITY_CONFIG[task.priority ?? 'None'] ?? PRIORITY_CONFIG['None'];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const progress = calculateProgress(task);

  return (
    <div
      onClick={onClick}
      className={cn(
        "grid grid-cols-[1fr_100px_160px_120px_100px_110px] px-6 py-3 hover:bg-muted/40 cursor-pointer transition-colors group items-center",
        task.archivedAt && "opacity-50"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={cn('flex-shrink-0', statusCfg.color)}>{statusCfg.icon}</span>
        <div className="min-w-0 flex items-center gap-2">
          <p className={cn('text-sm font-medium truncate', task.status === 'Done' && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          {task.archivedAt && (
            <Badge variant="outline" className="text-[9px] h-3.5 border-yellow-500/30 text-yellow-500 px-1 py-0 rounded">
              Archived
            </Badge>
          )}
          {task.subtaskCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {task.completedSubtaskCount}/{task.subtaskCount} subtasks
            </p>
          )}
        </div>
        {task.tags.slice(0, 3).map(tag => (
          <Badge key={tag} variant="outline" className="text-[10px] h-4 hidden group-hover:inline-flex">
            {tag}
          </Badge>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{progress}%</span>
          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden hidden sm:block">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="min-w-0">
        {task.assignees && task.assignees.length > 0 ? (
          <div className="flex items-center gap-2 min-w-0">
            <AssigneeAvatars assignees={task.assignees} />
            <span className="text-xs text-muted-foreground truncate max-w-[90px] hidden md:inline" title={task.assignees.map(a => a.displayName).join(', ')}>
              {task.assignees.map(a => a.displayName).join(', ')}
            </span>
          </div>
        ) : (
          <span className="text-xs text-neutral-600">—</span>
        )}
      </div>

      <div>
        <span className={cn('text-xs font-medium flex items-center gap-1', statusCfg.color)}>
          {task.status}
        </span>
      </div>

      <div>
        {task.priority && (
          <span className={cn('text-xs font-medium flex items-center gap-1 w-fit px-1.5 py-0.5 rounded', priorityCfg.color)}>
            {priorityCfg.icon}
            {task.priority}
          </span>
        )}
      </div>

      <div>
        {task.dueDate && (
          <span className={cn('text-xs', isOverdue ? 'text-red-400' : 'text-muted-foreground')}>
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Board View (Kanban) ──────────────────────────────────────────────────────

function BoardView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (t: Task) => void }) {
  const tasksByStatus = BOARD_COLUMNS.reduce<Record<string, Task[]>>((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {});

  const otherStatuses = [...new Set(tasks.map(t => t.status))].filter(s => !BOARD_COLUMNS.includes(s as TaskStatus));
  otherStatuses.forEach(s => { tasksByStatus[s] = tasks.filter(t => t.status === s); });

  const columns = [...BOARD_COLUMNS, ...otherStatuses];

  return (
    <div className="flex gap-4 p-6 overflow-x-auto h-full">
      {columns.map(status => {
        const colTasks = tasksByStatus[status] ?? [];
        const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['Todo'];
        return (
          <div key={status} className="flex-shrink-0 w-72 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className={statusCfg.color}>{statusCfg.icon}</span>
              <span className="text-sm font-medium">{status}</span>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 min-h-[100px]">
              {colTasks.map(task => <KanbanCard key={task.id} task={task} onClick={() => onTaskClick(task)} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const priorityCfg = PRIORITY_CONFIG[task.priority ?? 'None'] ?? PRIORITY_CONFIG['None'];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-muted border border-border rounded-lg p-3 cursor-pointer hover:border-neutral-600 hover:bg-muted/70 transition-all",
        task.archivedAt && "opacity-50 border-dashed"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        {task.archivedAt && (
          <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1 py-0.5 rounded flex-shrink-0">
            Archived
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {task.priority && task.priority !== 'None' && (
            <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded', priorityCfg.color)}>
              {priorityCfg.icon}
            </span>
          )}

          <span className="text-[10px] text-primary bg-primary/10 px-1 py-0.5 rounded font-medium">
            {calculateProgress(task)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={cn(isOverdue && 'text-red-400')}>
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          <AssigneeAvatars assignees={task.assignees} />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
      <span className="text-5xl">{icon}</span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {action}
    </div>
  );
}
