import React from 'react';
import { useWorkspaceMembers } from '@/lib/api/tasks/hooks';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentMentionListProps {
  workspaceId: string;
  query: string;
  onSelect: (displayName: string) => void;
  position: { top: number; left: number } | null;
}

export function CommentMentionList({ workspaceId, query, onSelect, position }: CommentMentionListProps) {
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);

  if (!position) return null;

  const filteredMembers = members?.filter(member => {
    const searchString = (member.displayName || member.email).toLowerCase();
    return searchString.includes(query.toLowerCase());
  }) || [];

  if (isLoading) {
    return (
      <div 
        className="absolute z-50 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-md p-2 space-y-2"
        style={{ top: position.top, left: position.left }}
      >
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (filteredMembers.length === 0) return null;

  return (
    <div 
      className="absolute z-50 w-48 bg-neutral-900 border border-neutral-800 rounded-md shadow-md py-1 max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {filteredMembers.map((member, idx) => (
        <button
          key={member.userId}
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-800 transition-colors flex items-center space-x-2"
          onClick={() => onSelect(member.displayName || member.email.split('@')[0])}
        >
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
            {member.displayName?.charAt(0) || member.email.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{member.displayName || member.email}</span>
        </button>
      ))}
    </div>
  );
}
