import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskComments, createTaskComment, updateTaskComment, deleteTaskComment, toggleCommentReaction, toggleCommentImportant, promoteComment, CreateTaskCommentRequest, UpdateTaskCommentRequest } from './comments';

export const commentKeys = {
  all: ['task-comments'] as const,
  list: (taskId: string) => [...commentKeys.all, taskId] as const,
};

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: () => getTaskComments(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTaskComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskCommentRequest) => createTaskComment(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

export function useUpdateTaskComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateTaskCommentRequest }) =>
      updateTaskComment(taskId, commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

export function useDeleteTaskComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteTaskComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

export function useToggleTaskCommentReaction(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) => toggleCommentReaction(taskId, commentId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

export function useToggleCommentImportant(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => toggleCommentImportant(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

export function usePromoteComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => promoteComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}
