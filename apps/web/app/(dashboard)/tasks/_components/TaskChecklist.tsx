import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/lib/api/tasks/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, CheckSquare, Edit2, Check } from 'lucide-react';
import { useCreateChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem } from '@/lib/api/tasks/checklistHooks';
import { UserSelect } from './UserSelect';

interface TaskChecklistProps {
  task: Task;
  isWorkspaceArchived?: boolean;
}

export function TaskChecklist({ task, isWorkspaceArchived }: TaskChecklistProps) {
  const createItem = useCreateChecklistItem(task.id);
  const updateItem = useUpdateChecklistItem(task.id);
  const deleteItem = useDeleteChecklistItem(task.id);

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemAssignee, setNewItemAssignee] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startEditing = (itemId: string, title: string) => {
    setEditingItemId(itemId);
    setEditingTitle(title);
  };

  const saveEdit = async (itemId: string, currentCompleted: boolean, currentAssignee: string | null) => {
    await handleTitleChange(itemId, editingTitle, currentCompleted, currentAssignee);
    setEditingItemId(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    await createItem.mutateAsync({ title: newItemTitle.trim(), assigneeId: newItemAssignee });
    setNewItemTitle('');
    setNewItemAssignee(null);
  };

  const handleToggle = async (itemId: string, isCompleted: boolean, currentTitle: string, currentAssignee: string | null) => {
    await updateItem.mutateAsync({ itemId, data: { title: currentTitle, isCompleted, assigneeId: currentAssignee } });
  };

  const handleTitleChange = async (itemId: string, newTitle: string, currentCompleted: boolean, currentAssignee: string | null) => {
    if (!newTitle.trim()) return;
    await updateItem.mutateAsync({ itemId, data: { title: newTitle.trim(), isCompleted: currentCompleted, assigneeId: currentAssignee } });
  };

  const handleAssigneeChange = async (itemId: string, newAssignee: string | null, currentTitle: string, currentCompleted: boolean) => {
    await updateItem.mutateAsync({ itemId, data: { title: currentTitle, isCompleted: currentCompleted, assigneeId: newAssignee } });
  };

  const checklist = task.checklistItems || [];
  const completedCount = checklist.filter(c => c.isCompleted).length;
  const progress = checklist.length === 0 ? 0 : Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checklist</h3>
        </div>
        {checklist.length > 0 && (
          <span className="text-xs text-muted-foreground font-medium">{progress}%</span>
        )}
      </div>

      {checklist.length > 0 && (
        <div className="mb-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}

      <div className="space-y-2 mb-4">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center group gap-2 min-h-8">
            <Checkbox 
              checked={item.isCompleted} 
              onCheckedChange={(checked) => handleToggle(item.id, checked === true, item.title, item.assigneeId)}
              disabled={isWorkspaceArchived || updateItem.isPending}
              className="h-4 w-4 border-neutral-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0 cursor-pointer"
            />
            {editingItemId === item.id ? (
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveEdit(item.id, item.isCompleted, item.assigneeId);
                  } else if (e.key === 'Escape') {
                    setEditingItemId(null);
                  }
                }}
                className="h-8 text-sm bg-muted border-border flex-1 focus:border-primary px-2"
                disabled={isWorkspaceArchived}
                autoFocus
              />
            ) : (
              <span className={cn("text-sm flex-1 px-2 py-1 rounded truncate", item.isCompleted && "line-through text-muted-foreground")}>
                {item.title}
              </span>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shrink-0">
              <UserSelect
                multiple={false}
                value={item.assigneeId ?? undefined}
                onChange={(val) => handleAssigneeChange(item.id, val || null, item.title, item.isCompleted)}
                disabled={isWorkspaceArchived}
                size="sm"
              />
              {editingItemId === item.id ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-emerald-400"
                  onClick={() => saveEdit(item.id, item.isCompleted, item.assigneeId)}
                  disabled={isWorkspaceArchived || updateItem.isPending}
                  title="Save edit"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-blue-400"
                  onClick={() => startEditing(item.id, item.title)}
                  disabled={isWorkspaceArchived}
                  title="Edit item"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-red-400"
                onClick={() => deleteItem.mutateAsync(item.id)}
                disabled={isWorkspaceArchived || deleteItem.isPending}
                title="Delete item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!isWorkspaceArchived && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 mt-2 ml-6">
          <Input
            placeholder="Add an item..."
            value={newItemTitle}
            onChange={e => setNewItemTitle(e.target.value)}
            className="h-8 text-sm bg-muted border-border flex-1 disabled:opacity-50"
            disabled={createItem.isPending}
          />
          <UserSelect
            multiple={false}
            value={newItemAssignee ?? undefined}
            onChange={(val) => setNewItemAssignee(val || null)}
            disabled={createItem.isPending}
            size="sm"
          />
          <Button type="submit" size="sm" variant="secondary" className="h-8" disabled={!newItemTitle.trim() || createItem.isPending}>
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
