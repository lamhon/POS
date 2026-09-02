'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useCreateTask } from '@/lib/api/tasks/hooks';
import { UserSelect } from './UserSelect';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants';
import { cn } from '@/lib/utils';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId?: string;
  parentTaskId?: string;
}

const STATUSES = ['Todo', 'In Progress', 'Done', 'Blocked'];
const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low', 'None'];

export function CreateTaskDialog({ open, onOpenChange, workspaceId, projectId, parentTaskId }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const { mutate, isPending } = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    mutate({
      workspaceId,
      projectId: projectId || undefined,
      parentTaskId: parentTaskId || undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority: priority || undefined,
      assigneeIds,
      tags,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    }, {
      onSuccess: () => {
        setTitle('');
        setDescription('');
        setStatus('Todo');
        setPriority(undefined);
        setAssigneeIds([]);
        setDueDate('');
        setTagsInput('');
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-muted border-border">
        <DialogHeader>
          <DialogTitle>{parentTaskId ? 'Create Subtask' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Title <span className="text-red-400">*</span></label>
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              className="bg-muted border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Description <span className="text-neutral-600">(optional)</span></label>
            <Textarea
              placeholder="Add more details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-muted border-border min-h-[80px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Tags <span className="text-neutral-600">(comma separated)</span></label>
              <Input
                placeholder="backend, api, urgent"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="bg-muted border-border h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Status</label>
              <Select value={status} onValueChange={v => { if (v) setStatus(v); }}>
                <SelectTrigger className="bg-muted border-border h-9 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <SelectItem key={s} value={s} className="cursor-pointer">
                        <span className={cn('flex items-center gap-1.5 text-[11px] font-medium', cfg?.color)}>
                          {cfg?.icon}
                          <span>{s}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Priority</label>
              <Select value={priority ?? ''} onValueChange={v => setPriority(v || undefined)}>
                <SelectTrigger className="bg-muted border-border h-9 cursor-pointer">
                  <SelectValue placeholder="No priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => {
                    const cfg = PRIORITY_CONFIG[p];
                    return (
                      <SelectItem key={p} value={p} className="cursor-pointer">
                        <span className={cn('flex items-center gap-1.5 w-fit px-1.5 py-0.5 rounded text-[11px] font-medium', cfg?.color)}>
                          {cfg?.icon}
                          <span>{p}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-muted border-border h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Assignees</label>
            <div className="flex items-center h-9">
              <UserSelect multiple value={assigneeIds} onChange={setAssigneeIds} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!title.trim() || !workspaceId || isPending}>
              {isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
