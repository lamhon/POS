import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useTaskComments, useCreateTaskComment, useUpdateTaskComment, useDeleteTaskComment, useToggleTaskCommentReaction, useToggleCommentImportant, usePromoteComment } from '@/lib/api/tasks/commentHooks';
import { TaskCommentDto } from '@/lib/api/tasks/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit2, Send, X, Check, MessageSquareReply, Smile, Mail, ShieldAlert, Calendar, Phone, Flag, CornerUpRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CommentMentionList } from './CommentMentionList';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useWorkspaceMembers } from '@/lib/api/tasks/hooks';
import { WorkspaceMember, Task } from '@/lib/api/tasks/types';
import { UseQueryResult } from '@tanstack/react-query';

const EMOJI_SET = ['👍', '❤️', '😄', '🎉', '🚀', '👀', '✅', '❌'];

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Utility to render text with styled mentions
const renderCommentContent = (
  content: string, 
  members: WorkspaceMember[] | undefined, 
  onMentionClick: (member: WorkspaceMember) => void
) => {
  if (!members || members.length === 0) {
    return <span>{content}</span>;
  }

  // Get all possible matchable display names and email prefixes
  const matchableNames: string[] = [];
  members.forEach(m => {
    if (m.displayName) matchableNames.push(m.displayName);
    const emailPrefix = m.email.split('@')[0];
    if (emailPrefix) matchableNames.push(emailPrefix);
  });

  // Unique names sorted by length descending
  const sortedNames = Array.from(new Set(matchableNames))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (sortedNames.length === 0) {
    return <span>{content}</span>;
  }

  // Build a regex matching @ followed by any of these names
  const escapedNames = sortedNames.map(escapeRegExp).join('|');
  const regex = new RegExp(`(@(?:${escapedNames}))`, 'g');

  const parts = content.split(regex);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const usernameOrDisplayName = part.slice(1);
      const matchedMember = members.find(
        m => m.displayName.toLowerCase() === usernameOrDisplayName.toLowerCase() ||
             m.email.split('@')[0].toLowerCase() === usernameOrDisplayName.toLowerCase()
      );

      if (matchedMember) {
        return (
          <button
            key={i}
            onClick={() => onMentionClick(matchedMember)}
            className="text-blue-500 font-bold hover:underline bg-blue-500/10 px-1.5 py-0.5 rounded inline-block cursor-pointer"
          >
            {part}
          </button>
        );
      }
    }
    return <span key={i}>{part}</span>;
  });
};

export function TaskComments({ 
  taskId, 
  workspaceId, 
  isSubtask,
  subtasks = [],
  subtaskCommentsQueries = [],
  onSubtaskClick
}: { 
  taskId: string; 
  workspaceId: string; 
  isSubtask?: boolean;
  subtasks?: Task[];
  subtaskCommentsQueries?: UseQueryResult<TaskCommentDto[], Error>[];
  onSubtaskClick?: (id: string) => void;
}) {
  const { data: comments, isLoading } = useTaskComments(taskId);
  const createComment = useCreateTaskComment(taskId);
  const updateComment = useUpdateTaskComment(taskId);
  const deleteComment = useDeleteTaskComment(taskId);
  const toggleReaction = useToggleTaskCommentReaction(taskId);
  const toggleImportant = useToggleCommentImportant(taskId);
  const promote = usePromoteComment(taskId);
  const { user } = useAuth();

  const { data: members } = useWorkspaceMembers(workspaceId);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'this_task' | 'subtasks' | 'all'>('this_task');
  const [showRepliesFor, setShowRepliesFor] = useState<Set<string>>(new Set());

  const toggleReplies = (commentId: string) => {
    const newSet = new Set(showRepliesFor);
    if (newSet.has(commentId)) newSet.delete(commentId);
    else newSet.add(commentId);
    setShowRepliesFor(newSet);
  };

  let displayComments: (TaskCommentDto & { subtaskTitle?: string; subtaskId?: string })[] = [];
  
  const parentComments = comments || [];
  
  const subtaskComments = subtasks.flatMap((sub, index) => {
    const query = subtaskCommentsQueries[index];
    const subComments = query?.data || [];
    return subComments.map(c => ({
      ...c,
      subtaskTitle: sub.title,
      subtaskId: sub.id,
    }));
  });

  if (isSubtask) {
    displayComments = parentComments;
  } else if (activeTab === 'this_task') {
    displayComments = parentComments;
  } else if (activeTab === 'subtasks') {
    displayComments = subtaskComments;
  } else if (activeTab === 'all') {
    displayComments = [...parentComments, ...subtaskComments];
  }

  // Sort chronologically
  displayComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Mentions State
  const [mentionQuery, setMentionQuery] = useState<{ query: string; active: boolean; cursorIdx: number; activeTextarea: 'new' | 'reply' | 'edit' | null }>({ query: '', active: false, cursorIdx: -1, activeTextarea: null });
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const textareaRefs = {
    new: useRef<HTMLTextAreaElement>(null),
    reply: useRef<HTMLTextAreaElement>(null),
    edit: useRef<HTMLTextAreaElement>(null),
  };

  const handleCreate = async () => {
    if (!newComment.trim()) return;
    try {
      await createComment.mutateAsync({ content: newComment.trim() });
      setNewComment('');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;
    try {
      await createComment.mutateAsync({ content: replyContent.trim(), parentCommentId });
      setReplyContent('');
      setReplyingToId(null);
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      await updateComment.mutateAsync({ commentId, data: { content: editContent.trim() } });
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteComment.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleToggleReaction = async (commentId: string, emoji: string) => {
    try {
      await toggleReaction.mutateAsync({ commentId, emoji });
    } catch (error) {
      toast.error('Failed to toggle reaction');
    }
  };

  const handleToggleImportant = async (commentId: string) => {
    try {
      await toggleImportant.mutateAsync(commentId);
    } catch (error) {
      toast.error('Failed to toggle important status');
    }
  };

  const handlePromote = async (commentId: string) => {
    try {
      await promote.mutateAsync(commentId);
      toast.success('Comment shared to parent task');
    } catch (error) {
      toast.error('Failed to share comment');
    }
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>, 
    setValue: React.Dispatch<React.SetStateAction<string>>,
    type: 'new' | 'reply' | 'edit'
  ) => {
    const val = e.target.value;
    setValue(val);
    
    // Check for @ symbol
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const isNewWord = lastAtPos === 0 || textBeforeCursor[lastAtPos - 1] === ' ' || textBeforeCursor[lastAtPos - 1] === '\n';
      if (isNewWord) {
        const query = textBeforeCursor.slice(lastAtPos + 1);
        if (!query.includes(' ')) {
          // Trigger mention
          // Calculate approx position (simple approach)
          // For a real implementation, use getCaretCoordinates package, but we can fake it or use fixed offset relative to wrapper
          setMentionQuery({ query, active: true, cursorIdx: lastAtPos, activeTextarea: type });
          
          // Fallback simple position (ideally calculate based on caret, but standard bottom right of input is okay for MVP)
          const rect = e.target.getBoundingClientRect();
          setMentionPosition({ top: - 200, left: 10 }); // Render above or below appropriately (needs a relative wrapper)
          return;
        }
      }
    }
    setMentionQuery({ query: '', active: false, cursorIdx: -1, activeTextarea: null });
  };

  const insertMention = (username: string, setValue: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    if (mentionQuery.activeTextarea) {
      const beforeAt = value.slice(0, mentionQuery.cursorIdx);
      const afterCursor = value.slice(mentionQuery.cursorIdx + mentionQuery.query.length + 1);
      const newValue = `${beforeAt}@${username} ${afterCursor}`;
      setValue(newValue);
      setMentionQuery({ query: '', active: false, cursorIdx: -1, activeTextarea: null });
    }
  };

  const renderComment = (comment: TaskCommentDto & { subtaskTitle?: string; subtaskId?: string }, isReply = false) => {
    return (
      <div key={comment.id} className={cn("group relative", !isReply && "mb-4")}>
        {comment.subtaskTitle && !isReply && (
          <div className="text-[13px] font-semibold text-foreground mb-2 mt-4 first:mt-0 flex items-center">
            <span 
              className="hover:text-white cursor-pointer transition-colors" 
              onClick={() => onSubtaskClick?.(comment.subtaskId!)}
            >
              {comment.subtaskTitle}
            </span>
          </div>
        )}
        <div className={cn("flex space-x-3 rounded-md transition-colors", isReply ? "mt-3" : "p-2", comment.isImportant && !isReply && "bg-amber-950/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]")}>
        {comment.isImportant && !isReply && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-md" />
        )}
        <div className={cn("rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary shrink-0", isReply ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs z-10")}>
          {comment.userDisplayName?.charAt(0) || comment.userEmail.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 space-y-1 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={cn("font-medium", isReply ? "text-xs" : "text-sm", comment.isImportant && "text-amber-500")}>{comment.userDisplayName || comment.userEmail}</span>
              {comment.isImportant && (
                <span className="flex items-center text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Important
                </span>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                {comment.updatedAt && new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime() && (
                  <span className="italic text-[10px]">(edited)</span>
                )}
              </span>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
              {!isReply && (
                <>
                  {isSubtask && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-blue-400"
                      title="Share to parent task"
                      onClick={() => handlePromote(comment.id)}
                      disabled={promote.isPending}
                    >
                      <CornerUpRight className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6", comment.isImportant ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-amber-500")}
                    title={comment.isImportant ? "Unmark as important" : "Mark as important"}
                    onClick={() => handleToggleImportant(comment.id)}
                    disabled={toggleImportant.isPending}
                  >
                    <Flag className={cn("h-3 w-3", comment.isImportant && "fill-current")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setReplyingToId(comment.id);
                      setReplyContent('');
                    }}
                  >
                    <MessageSquareReply className="h-3 w-3" />
                  </Button>
                </>
              )}
              <Popover>
                <PopoverTrigger className="h-6 w-6 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                  <Smile className="h-3 w-3" />
                </PopoverTrigger>
                <PopoverContent className="w-fit p-2 flex gap-1 bg-muted border-border" align="end">
                  {EMOJI_SET.map(emoji => (
                    <button 
                      key={emoji} 
                      className="hover:bg-muted/80 p-1 rounded text-lg transition-colors"
                      onClick={() => handleToggleReaction(comment.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {user?.id === comment.userId && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteConfirmId(comment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {editingId === comment.id ? (
            <div className="space-y-2 mt-2 relative">
              <Textarea
                ref={textareaRefs.edit}
                value={editContent}
                onChange={(e) => handleTextareaChange(e, setEditContent, 'edit')}
                className="min-h-[60px] text-sm bg-background border-border"
              />
              {mentionQuery.active && mentionQuery.activeTextarea === 'edit' && (
                <CommentMentionList 
                  workspaceId={workspaceId} 
                  query={mentionQuery.query} 
                  position={{ top: -150, left: 0 }}
                  onSelect={(u) => insertMention(u, setEditContent, editContent)} 
                />
              )}
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={() => handleUpdate(comment.id)} disabled={!editContent.trim() || updateComment.isPending}>
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-foreground bg-muted/30 rounded-md p-3 whitespace-pre-wrap">
              {renderCommentContent(comment.content, members, setSelectedMember)}
            </div>
          )}

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(
                comment.reactions.reduce((acc, curr) => {
                  acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([emoji, count]) => {
                const userReacted = comment.reactions.some(r => r.userId === user?.id && r.emoji === emoji);
                return (
                  <button
                    key={emoji}
                    onClick={() => handleToggleReaction(comment.id, emoji)}
                    className={cn(
                      "flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border transition-colors",
                      userReacted ? "bg-primary/20 border-primary/30 text-primary-foreground" : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <span>{emoji}</span>
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Replies Toggle */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              <button 
                onClick={() => toggleReplies(comment.id)}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            </div>
          )}

          {/* Replies */}
          {!isReply && comment.replies && comment.replies.length > 0 && showRepliesFor.has(comment.id) && (
            <div className="pl-4 border-l-2 border-border mt-2 space-y-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}

          {/* Reply Input */}
          {!isReply && replyingToId === comment.id && (
             <div className="pl-4 border-l-2 border-border mt-3 flex space-x-2 relative">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                  <Textarea
                    ref={textareaRefs.reply}
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => handleTextareaChange(e, setReplyContent, 'reply')}
                    className="min-h-[60px] text-sm resize-y bg-background border-border"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleReply(comment.id);
                      }
                    }}
                  />
                  {mentionQuery.active && mentionQuery.activeTextarea === 'reply' && (
                    <CommentMentionList 
                      workspaceId={workspaceId} 
                      query={mentionQuery.query} 
                      position={{ top: -150, left: 0 }}
                      onSelect={(u) => insertMention(u, setReplyContent, replyContent)} 
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Cmd/Ctrl + Enter to send</span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setReplyingToId(null)}>Cancel</Button>
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleReply(comment.id)} disabled={!replyContent.trim() || createComment.isPending}>
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isSubtask && (
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => setActiveTab('this_task')}
            className={cn("text-xs font-semibold pb-1 border-b-2 transition-colors cursor-pointer", activeTab === 'this_task' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            [This task]
          </button>
          <button 
            onClick={() => setActiveTab('subtasks')}
            className={cn("text-xs font-semibold pb-1 border-b-2 transition-colors cursor-pointer", activeTab === 'subtasks' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            [Subtasks]
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={cn("text-xs font-semibold pb-1 border-b-2 transition-colors cursor-pointer", activeTab === 'all' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            [All]
          </button>
        </div>
      )}

      <div className="space-y-4 divide-y divide-border/60">
        {displayComments?.map((comment, idx) => (
          <div key={comment.id} className={idx > 0 ? "pt-4" : ""}>
            {renderComment(comment)}
          </div>
        ))}
        {displayComments?.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Start the conversation!
          </div>
        )}
      </div>

      <div className="flex space-x-3 mt-4 relative">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
          {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRefs.new}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => handleTextareaChange(e, setNewComment, 'new')}
            className="min-h-[80px] text-sm resize-y bg-muted border-border"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleCreate();
              }
            }}
          />
          {mentionQuery.active && mentionQuery.activeTextarea === 'new' && (
            <CommentMentionList 
              workspaceId={workspaceId} 
              query={mentionQuery.query} 
              position={{ top: -150, left: 0 }}
              onSelect={(u) => insertMention(u, setNewComment, newComment)} 
            />
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Pro tip: press Cmd/Ctrl + Enter to send</span>
            <Button size="sm" onClick={handleCreate} disabled={!newComment.trim() || createComment.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground p-6 rounded-xl">
          <DialogHeader className="gap-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 border border-red-500/20 text-red-500 mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold">Delete Comment</DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmId(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteComment.isPending}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              {deleteComment.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedMember !== null} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground p-6 rounded-xl">
          <DialogHeader className="gap-2 text-center">
            <DialogTitle className="text-lg font-semibold">User Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                {selectedMember.displayName?.charAt(0) || selectedMember.email?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">{selectedMember.displayName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Workspace Member</p>
              </div>
              
              <div className="w-full space-y-3 bg-muted/50 border border-border/80 rounded-xl p-4 text-sm mt-2">
                <div className="flex items-center space-x-2.5 text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{selectedMember.email}</span>
                </div>
                <div className="flex items-center space-x-2.5 text-foreground">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  <span>Role: <strong className="text-white">{selectedMember.role}</strong></span>
                </div>
                {selectedMember.phone && (
                  <div className="flex items-center space-x-2.5 text-foreground">
                     <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>Phone: <strong className="text-white">{selectedMember.phone}</strong></span>
                  </div>
                )}
                <div className="flex items-center space-x-2.5 text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined: <strong className="text-white">{format(new Date(selectedMember.createdAt), 'MMM d, yyyy')}</strong></span>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedMember(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
