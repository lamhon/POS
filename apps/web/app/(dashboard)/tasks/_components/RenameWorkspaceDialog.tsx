'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useUpdateWorkspace } from '@/lib/api/tasks/hooks';
import { Workspace } from '@/lib/api/tasks/types';

interface RenameWorkspaceDialogProps {
  workspace: Workspace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameWorkspaceDialog({ workspace, open, onOpenChange }: RenameWorkspaceDialogProps) {
  const [name, setName] = useState('');
  const { mutate, isPending } = useUpdateWorkspace();

  useEffect(() => {
    if (workspace && open) {
      setName(workspace.name);
    }
  }, [workspace, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === workspace?.name || !workspace) {
      onOpenChange(false);
      return;
    }
    mutate({ id: workspace.id, payload: { name: name.trim() } }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-muted border-border">
        <DialogHeader>
          <DialogTitle>Rename Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Name</label>
            <Input
              placeholder="Workspace name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="bg-muted border-border"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || isPending || name.trim() === workspace?.name}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
