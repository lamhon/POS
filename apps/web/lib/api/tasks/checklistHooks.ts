import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChecklistItem, updateChecklistItem, deleteChecklistItem, CreateChecklistItemRequest, UpdateChecklistItemRequest } from './checklist';
import { taskKeys } from './hooks';

export function useCreateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChecklistItemRequest) => createChecklistItem(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateChecklistItemRequest }) => updateChecklistItem(taskId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useDeleteChecklistItem(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteChecklistItem(taskId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.task(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
