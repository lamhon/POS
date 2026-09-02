'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTask, useUpdateTask, useCompleteTask, useDeleteTask, useArchiveTask, useTaskActivityLogs, taskKeys, useWorkspaces, useCreateTask } from '@/lib/api/tasks/hooks';
import { UserSelect } from './UserSelect';
import { TaskChecklist } from './TaskChecklist';
import { TaskComments } from './TaskComments';
import { cn } from '@/lib/utils';
import { useQueries } from '@tanstack/react-query';
import { commentKeys } from '@/lib/api/tasks/commentHooks';
import { getTaskComments } from '@/lib/api/tasks/comments';
import {
  CheckCircle2, Circle, Clock, AlertCircle, Flame,
  ArrowUpCircle, Minus, ChevronDown, CalendarDays,
  Plus, Trash2, Archive, ArrowLeft, Timer, MessageSquare,
  User, Edit2, Check, X
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants';
import { toast } from 'sonner';
import * as taskService from '@/lib/api/tasks/service';
import { useQueryClient } from '@tanstack/react-query';

interface TaskDetailDrawerProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskIdChange?: (id: string | null) => void;
}

// Configuration constants imported from constants.tsx

export function TaskDetailDrawer({ taskId, open, onOpenChange, onTaskIdChange }: TaskDetailDrawerProps) {
  const { data: task, isLoading } = useTask(taskId ?? '');
  const { data: parentTask } = useTask(task?.parentTaskId ?? '');
  const { data: workspaces } = useWorkspaces();
  const workspace = workspaces?.find(w => w.id === task?.workspaceId);
  const isWorkspaceArchived = !!workspace?.isArchived;

  const { mutate: complete, isPending: completing } = useCompleteTask();
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask();
  const { mutate: archive } = useArchiveTask();
  const { mutate: updateTask } = useUpdateTask(taskId ?? '');
  const [showActivityLog, setShowActivityLog] = useState(false);
  const { data: activityLogs } = useTaskActivityLogs(taskId ?? '', showActivityLog);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(false);
  
  const { user } = useAuth();
  const isGlobalAdmin = user?.roles?.includes('Admin') || user?.roles?.includes('Super Admin');

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');

  useEffect(() => {
    setIsCommentsCollapsed(false);
    setShowActivityLog(false);
    setIsEditingDescription(false);
  }, [taskId]);

  useEffect(() => {
    if (!isEditingDescription) {
      setDescriptionValue(task?.description ?? '');
    }
  }, [task?.description, isEditingDescription]);

  const [estimateInput, setEstimateInput] = useState<string>('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const { mutate: createTask, isPending: creatingTask } = useCreateTask();
  const queryClient = useQueryClient();

  const subtaskIds = task?.subtasks?.map(s => s.id) || [];
  const subtaskCommentsQueries = useQueries({
    queries: subtaskIds.map(id => ({
      queryKey: commentKeys.list(id),
      queryFn: () => getTaskComments(id),
      enabled: open && !!id,
    }))
  });

  const getSubtaskCommentCount = (id: string) => {
    const index = subtaskIds.indexOf(id);
    return subtaskCommentsQueries[index]?.data?.length || 0;
  };

  const handleReopenReset = () => {
    // Reset subtasks
    if (task && task.subtasks && task.subtasks.length > 0) {
      Promise.all(
        task.subtasks
          .filter(sub => sub.status === 'Done')
          .map(sub => taskService.updateTask(sub.id, { title: sub.title, status: 'Todo' }))
      ).then(() => {
        queryClient.invalidateQueries({ queryKey: taskKeys.task(task.id) });
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      });
    }
  };
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;
    createTask({
      workspaceId: task.workspaceId,
      projectId: task.projectId || undefined,
      parentTaskId: task.id,
      title: newSubtaskTitle.trim(),
      status: 'Todo'
    }, {
      onSuccess: () => {
        setNewSubtaskTitle('');
        toast.success('Subtask created successfully.');
        queryClient.invalidateQueries({ queryKey: taskKeys.task(task.id) });
        queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      }
    });
  };

  const statusCfg = STATUS_CONFIG[task?.status ?? 'Todo'] ?? STATUS_CONFIG['Todo'];
  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
  const isSubtask = !!task?.parentTaskId;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-border">
        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !task ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Task not found.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Back to Parent Task link */}
            {isSubtask && (
              <button
                onClick={() => onTaskIdChange?.(task.parentTaskId ?? null)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-blue-400 transition-colors w-fit -mb-2 group"
              >
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>
                  {parentTask?.title
                    ? `Back to: ${parentTask.title}`
                    : 'Back to Parent Task'
                  }
                </span>
              </button>
            )}
            <DialogHeader className="space-y-3">
              {/* Status badge + Title */}
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    if (task.status !== 'Done') {
                      if (task.status !== 'In Progress') {
                        toast.error('Only tasks in In Progress status can be completed.');
                        return;
                      }
                      const totalSubtasks = Math.max(task.subtasks?.length ?? 0, task.subtaskCount ?? 0);
                      const completedSubtasks = task.subtasks?.length
                        ? Math.max(task.subtasks.filter(sub => sub.status === 'Done').length, task.completedSubtaskCount ?? 0)
                        : (task.completedSubtaskCount ?? 0);
                      if (totalSubtasks > 0 && completedSubtasks < totalSubtasks) {
                        toast.error('All subtasks must be completed before you can complete this task.');
                        return;
                      }
                    }
                    complete(task.id, {
                      onSuccess: (data) => {
                        if (data && data.status === 'Todo') {
                          handleReopenReset();
                        }
                      }
                    });
                  }}
                  disabled={completing || isWorkspaceArchived}
                  className={cn('mt-0.5 flex-shrink-0 hover:opacity-75 transition-opacity', statusCfg.color, isWorkspaceArchived && 'opacity-50 cursor-not-allowed')}
                >
                  {statusCfg.icon}
                </button>
                <DialogTitle className={cn('text-left text-base font-semibold leading-snug', task.status === 'Done' && 'line-through text-muted-foreground')}>
                  {task.title}
                </DialogTitle>
              </div>

              {/* Action row */}
              <div className="flex gap-2">
                <Button
                  variant="ghost" size="sm"
                  className="text-muted-foreground hover:text-emerald-400 h-7 px-2 text-xs"
                  onClick={() => {
                    if (task.status !== 'In Progress') {
                      toast.error('Only tasks in In Progress status can be completed.');
                      return;
                    }
                    const totalSubtasks = Math.max(task.subtasks?.length ?? 0, task.subtaskCount ?? 0);
                    const completedSubtasks = task.subtasks?.length
                      ? Math.max(task.subtasks.filter(sub => sub.status === 'Done').length, task.completedSubtaskCount ?? 0)
                      : (task.completedSubtaskCount ?? 0);
                    if (totalSubtasks > 0 && completedSubtasks < totalSubtasks) {
                      toast.error('All subtasks must be completed before you can complete this task.');
                      return;
                    }
                    complete(task.id);
                  }}
                  disabled={task.status === 'Done' || completing || isWorkspaceArchived}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Complete
                </Button>
                {!isSubtask && (
                  <Button
                    variant="ghost" size="sm"
                    className="text-muted-foreground hover:text-yellow-400 h-7 px-2 text-xs"
                    onClick={() => archive(task.id)}
                    disabled={isWorkspaceArchived}
                  >
                    <Archive className="h-3.5 w-3.5 mr-1" />
                    {task.archivedAt ? 'Unarchive' : 'Archive'}
                  </Button>
                )}
                <Button
                  variant="ghost" size="sm"
                  className="text-muted-foreground hover:text-red-400 h-7 px-2 text-xs ml-auto"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  disabled={deleting || isWorkspaceArchived}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </DialogHeader>

            {/* Overall Progress Bar */}
            {(() => {
              const subtasks = task.subtasks || [];
              const checklist = task.checklistItems || [];
              const total = subtasks.length + checklist.length;
              if (total === 0) return null;

              const completed = subtasks.filter(s => s.status === 'Done').length + checklist.filter(c => c.isCompleted).length;
              const percent = Math.round((completed / total) * 100);

              return (
                <div className="bg-muted/40 border border-border/80 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Overall Progress
                    </span>
                    <span>{percent}% ({completed}/{total})</span>
                  </div>
                  <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Meta info toolbar */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-4 mt-2 bg-muted/40 border border-border/80 rounded-xl p-2.5 shadow-sm">
              
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</span>
                <Select
                  value={task.status}
                  onValueChange={(newStatus) => {
                    if (newStatus) {
                      // 1. If currently Todo, can only move to In Progress, Blocked, Cancelled
                      if (task.status === 'Todo') {
                        if (newStatus !== 'In Progress' && newStatus !== 'Blocked' && newStatus !== 'Cancelled') {
                          toast.error('Tasks in Todo status can only be moved to In Progress, Blocked, or Cancelled.');
                          return;
                        }
                      }

                      // 2. If transitioning to In Progress, must have assignee(s)
                      if (newStatus === 'In Progress' && (!task.assigneeIds || task.assigneeIds.length === 0)) {
                        toast.error('You must assign this task to someone before moving it to In Progress.');
                        return;
                      }

                      // 3. If transitioning to Done (Complete), current status must be In Progress and subtasks completed
                      if (newStatus === 'Done') {
                        if (task.status !== 'In Progress') {
                          toast.error('Only tasks in In Progress status can be completed.');
                          return;
                        }
                        const totalSubtasks = Math.max(task.subtasks?.length ?? 0, task.subtaskCount ?? 0);
                        const completedSubtasks = task.subtasks?.length
                          ? Math.max(task.subtasks.filter(sub => sub.status === 'Done').length, task.completedSubtaskCount ?? 0)
                          : (task.completedSubtaskCount ?? 0);
                        if (totalSubtasks > 0 && completedSubtasks < totalSubtasks) {
                          toast.error('All subtasks must be completed before you can complete this task.');
                          return;
                        }
                      }

                      if (newStatus === 'Todo') {
                        handleReopenReset();
                      }

                      updateTask({ ...task, status: newStatus as any });
                    }
                  }}
                  disabled={isWorkspaceArchived}
                >
                  <SelectTrigger className={cn(
                    "h-7 text-xs font-semibold w-auto bg-muted hover:bg-muted/80 border border-border/50 rounded-md transition-colors px-2.5 cursor-pointer shadow-sm",
                    STATUS_CONFIG[task.status ?? 'Todo']?.color
                  )}>
                    <div className="flex items-center gap-1.5">
                      {STATUS_CONFIG[task.status ?? 'Todo']?.icon}
                      <span>{task.status}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="w-[1px] h-4 bg-border" />

              {/* Assignees */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Assignee</span>
                <UserSelect 
                  multiple
                  value={task.assigneeIds} 
                  onChange={(ids) => updateTask({ ...task, assigneeIds: ids })} 
                  disabled={isWorkspaceArchived}
                  size="sm"
                />
              </div>

              <div className="w-[1px] h-4 bg-border" />

              {/* Due Date */}
              <div className="flex items-center gap-1.5 hover:bg-muted/60 rounded-md px-2 py-0.5 transition-colors cursor-pointer group">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mr-1">Due</span>
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <Input
                  type="date"
                  value={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateTask({ 
                      ...task, 
                      dueDate: val ? new Date(val).toISOString() : undefined 
                    });
                  }}
                  className="h-6 text-xs font-medium w-[110px] bg-transparent border-transparent hover:border-transparent focus:ring-0 shadow-none px-0 cursor-pointer py-0 rounded-none disabled:opacity-50 text-foreground"
                  disabled={isWorkspaceArchived}
                />
                {isOverdue && <span className="text-[9px] uppercase tracking-wider text-red-400 font-bold bg-red-400/10 px-1.5 py-0.5 rounded ml-1">Overdue</span>}
              </div>

              <div className="w-[1px] h-4 bg-border" />

              {/* Priority */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Priority</span>
                <Select
                  value={task.priority ?? 'None'}
                  onValueChange={(newPriority) => updateTask({ ...task, priority: (newPriority || undefined) as any })}
                  disabled={isWorkspaceArchived}
                >
                  <SelectTrigger className={cn(
                    "h-7 text-[11px] font-bold w-auto border-transparent focus:ring-0 shadow-none px-2 cursor-pointer transition-colors rounded-md",
                    task.priority && task.priority !== 'None'
                      ? PRIORITY_CONFIG[task.priority].color
                      : "bg-transparent hover:bg-muted/60 text-muted-foreground"
                  )}>
                    {task.priority && task.priority !== 'None' ? (
                      <div className="flex items-center gap-1.5">
                        {PRIORITY_CONFIG[task.priority].icon}
                        <span>{task.priority}</span>
                      </div>
                    ) : (
                      <span>None</span>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([p, cfg]) => (
                      <SelectItem key={p} value={p} className="cursor-pointer">
                        <span className={cn('flex items-center gap-1.5 w-fit px-1.5 py-0.5 rounded text-[11px] font-bold', cfg.color)}>
                          {cfg.icon}
                          <span>{p}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[1px] h-4 bg-border" />

              {/* Estimate */}
              <div className="flex items-center gap-1 hover:bg-muted/60 rounded-md px-2 py-0.5 transition-colors group">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mr-1">Est</span>
                <Timer className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  defaultValue={task.estimate ?? ''}
                  key={`estimate-${task.id}`}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    const newEstimate = isNaN(val) || val <= 0 ? null : val;
                    if (newEstimate !== (task.estimate ?? null)) {
                      updateTask({ ...task, estimate: newEstimate });
                    }
                  }}
                  className="h-6 text-xs font-medium w-8 bg-transparent border-none focus:ring-0 shadow-none px-0 text-center py-0 disabled:opacity-50 text-foreground"
                  disabled={isWorkspaceArchived}
                />
                <span className="text-xs text-muted-foreground font-medium">h</span>
              </div>

              <div className="hidden sm:block w-[1px] h-4 bg-border ml-auto" />
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">
                Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</h3>
                {!isWorkspaceArchived && (
                  <div className="flex items-center gap-1">
                    {!isEditingDescription ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                          onClick={() => {
                            updateTask({ ...task, description: descriptionValue.trim() || undefined }, {
                              onSuccess: () => {
                                setIsEditingDescription(false);
                                toast.success('Description updated');
                              },
                              onError: () => {
                                toast.error('Failed to update description');
                              }
                            });
                          }}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            setDescriptionValue(task?.description ?? '');
                            setIsEditingDescription(false);
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <Textarea
                key={`${task.id}-${isEditingDescription}`}
                placeholder="Add more details..."
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                disabled={!isEditingDescription || isWorkspaceArchived}
                className="bg-muted border-border text-sm min-h-[80px] resize-none text-foreground placeholder-muted-foreground focus-visible:ring-ring w-full disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}



            {/* Subtasks */}
            {!isSubtask && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subtasks</h3>
                </div>
                <div className="border-t border-border mb-2" />

                {task.subtasks.length > 0 ? (
                  <div className="space-y-0.5 mb-3">
                    {task.subtasks.map(sub => {
                      const subStatusCfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG['Todo'];
                      const count = getSubtaskCommentCount(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className="group flex items-center justify-between p-2 rounded-md hover:bg-muted transition-all cursor-pointer"
                          onClick={() => onTaskIdChange?.(sub.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn('text-sm flex-shrink-0', subStatusCfg.color)}>
                              {sub.status === 'Done' ? '✓' : sub.status === 'In Progress' ? '●' : '○'}
                            </span>
                            <span className={cn('text-sm', sub.status === 'Done' && 'line-through text-muted-foreground')}>
                              {sub.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {count > 0 && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>{count}</span>
                                <span className="text-[13px]">💬</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3 italic">No subtasks created yet.</p>
                )}

              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Add subtask..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  className="h-8 text-sm bg-muted border-border flex-1 disabled:opacity-50"
                  disabled={isWorkspaceArchived || creatingTask}
                />
                <Button type="submit" size="icon" variant="ghost" className="h-8 w-8" disabled={isWorkspaceArchived || !newSubtaskTitle.trim() || creatingTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </div>
            )}

            <TaskChecklist task={task} isWorkspaceArchived={isWorkspaceArchived} />

            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{isSubtask ? "Discussion" : "Activity & Discussion"}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsCommentsCollapsed(!isCommentsCollapsed)}
                >
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isCommentsCollapsed && "transform -rotate-90")} />
                </Button>
              </div>
              <div className="border-t border-border mb-4" />
              {!isCommentsCollapsed && (
                <TaskComments 
                  taskId={task.id} 
                  workspaceId={task.workspaceId} 
                  isSubtask={isSubtask} 
                  subtasks={task.subtasks}
                  subtaskCommentsQueries={subtaskCommentsQueries}
                  onSubtaskClick={(id) => onTaskIdChange?.(id)}
                />
              )}
            </div>

            {/* Activity Logs */}
            {isGlobalAdmin && (
              <div className="mt-8 border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Activity Log</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setShowActivityLog(!showActivityLog)}
                  >
                    {showActivityLog ? 'Hide Logs' : 'Show Logs'}
                  </Button>
                </div>
                {showActivityLog && (
                  <div className="space-y-3">
                    {activityLogs?.map(log => (
                      <div key={log.id} className="text-xs text-muted-foreground flex flex-col gap-1">
                        <div>
                          <span className="text-foreground font-medium">{log.action}</span>
                          {log.oldValue || log.newValue ? (
                            <span className="ml-2 text-muted-foreground">
                              {log.oldValue && `from ${log.oldValue} `}
                              {log.newValue && `to ${log.newValue}`}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[10px] text-muted-foreground/70">
                          {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    ))}
                    {!activityLogs?.length && (
                      <p className="text-xs text-muted-foreground">No activity recorded yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground p-6 rounded-xl">
          <DialogHeader className="gap-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 border border-red-500/20 text-red-500 mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold">Delete Task</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Are you sure you want to delete this task? This action cannot be undone and will permanently remove all associated subtasks and checklist items.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (task) {
                  deleteTask(task.id);
                  setIsConfirmDeleteOpen(false);
                  onOpenChange(false);
                }
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              {deleting ? 'Deleting...' : 'Delete Task'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center min-h-[32px]">
      <div className="w-24 text-xs font-medium text-muted-foreground shrink-0">{label}</div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
