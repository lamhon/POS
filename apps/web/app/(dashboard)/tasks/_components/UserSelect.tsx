'use client';

import React, { useMemo, useState } from 'react';
import { useUsers } from '@/lib/api/tasks/hooks';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, X, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSelectProps {
  value?: string | string[]; // AssigneeId or AssigneeIds
  onChange: (value: any) => void;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UserSelect: React.FC<UserSelectProps> = ({ value, onChange, size = 'md', className, disabled, multiple = false }) => {
  const { data: users, isLoading } = useUsers();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedUsers = useMemo(() => {
    if (!users || !value) return [];
    const values = Array.isArray(value) ? value : [value];
    return users.filter(u => values.includes(u.id));
  }, [users, value]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u => 
      u.displayName.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleSelect = (userId: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
      if (currentValues.includes(userId)) {
        onChange(currentValues.filter(id => id !== userId));
      } else {
        onChange([...currentValues, userId]);
      }
    } else {
      onChange(userId);
      setOpen(false);
    }
  };

  const handleUnassignAll = () => {
    onChange(multiple ? [] : undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearchQuery(''); }}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          selectedUsers.length > 0 
            ? 'flex items-center -space-x-1.5 focus:outline-none cursor-pointer hover:opacity-85 transition-opacity'
            : 'flex items-center justify-center rounded-full hover:ring-2 hover:ring-offset-1 hover:ring-primary/50 transition-all focus:outline-none cursor-pointer bg-muted text-muted-foreground border border-dashed border-muted-foreground/50 w-8 h-8',
          size === 'sm' && selectedUsers.length === 0 && 'w-6 h-6',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        title={selectedUsers.length > 0 ? selectedUsers.map(u => u.displayName).join(', ') : 'Assign user'}
      >
        {selectedUsers.length > 0 ? (
          <>
            {selectedUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className={cn(
                  'rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center border-2 border-neutral-950 shrink-0 select-none',
                  size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
                )}
              >
                {getInitials(user.displayName)}
              </div>
            ))}
            {selectedUsers.length > 3 && (
              <div
                className={cn(
                  'rounded-full bg-muted text-muted-foreground font-semibold flex items-center justify-center border-2 border-neutral-950 shrink-0 select-none',
                  size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
                )}
              >
                +{selectedUsers.length - 3}
              </div>
            )}
          </>
        ) : (
          <UserPlus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 flex flex-col gap-2" align="start">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="h-8 pl-8 text-xs bg-muted/50 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground text-center">Loading users...</div>
        ) : (
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
            {(value && (!Array.isArray(value) || value.length > 0)) && (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-destructive h-8 px-2"
                onClick={handleUnassignAll}
              >
                <X className="w-3.5 h-3.5 mr-2" />
                Unassign {multiple ? 'All' : ''}
              </Button>
            )}
            {filteredUsers.length > 0 ? filteredUsers.map((user) => {
              const isSelected = Array.isArray(value) ? value.includes(user.id) : value === user.id;
              return (
                <Button
                  key={user.id}
                  variant="ghost"
                  size="sm"
                  className={cn('justify-start h-8 px-2', isSelected && 'bg-accent text-accent-foreground')}
                  onClick={() => handleSelect(user.id)}
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] mr-2 font-semibold shrink-0">
                    {getInitials(user.displayName)}
                  </div>
                  <span className="truncate flex-1 text-left">{user.displayName}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-2 shrink-0 opacity-70" />}
                </Button>
              );
            }) : (
              <div className="p-4 text-xs text-muted-foreground text-center">No users found</div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
