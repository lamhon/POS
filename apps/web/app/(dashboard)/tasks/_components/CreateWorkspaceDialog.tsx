'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useCreateWorkspace } from '@/lib/api/tasks/hooks';
import { IconPicker } from '@/components/ui/icon-picker';
import { WORKSPACE_COLORS } from './WorkspaceSettingsDialog';
import { cn } from '@/lib/utils';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const { mutate, isPending } = useCreateWorkspace();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate({ 
      name: name.trim(), 
      description: description.trim() || undefined,
      icon: icon || undefined,
      color: color || undefined
    }, {
      onSuccess: () => {
        setName('');
        setDescription('');
        setIcon('');
        setColor('');
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-muted border-border">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Name</label>
            <Input
              placeholder="e.g. Personal, Work, Military..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Description <span className="text-neutral-600">(optional)</span></label>
            <Input
              placeholder="What is this workspace for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Icon <span className="text-neutral-600">(optional)</span></label>
              <IconPicker
                value={icon}
                onChange={setIcon}
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Accent Color</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {WORKSPACE_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={cn(
                      "w-5 h-5 rounded-full cursor-pointer transition-all border-2",
                      color === c.value ? "border-white scale-110 shadow-sm" : "border-transparent hover:scale-110"
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={color || '#ffffff'}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute opacity-0 w-full h-full cursor-pointer inset-0 z-10"
                    title="Custom Color"
                  />
                  <div 
                    className="w-5 h-5 rounded-full border-2 border-border bg-muted flex items-center justify-center overflow-hidden transition-all hover:scale-110"
                    style={color && !WORKSPACE_COLORS.some(c => c.value === color) ? { backgroundColor: color, borderColor: 'white' } : {}}
                  >
                     <span className="text-[9px] bg-clip-text text-transparent bg-gradient-to-tr from-purple-400 to-pink-500 font-bold">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending ? 'Creating...' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
