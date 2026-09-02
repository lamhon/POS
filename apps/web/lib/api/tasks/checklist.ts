import apiClient from '../../api-client';

export interface ChecklistItemDto {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
}

export interface CreateChecklistItemRequest {
  title: string;
  assigneeId?: string | null;
}

export interface UpdateChecklistItemRequest {
  title: string;
  isCompleted: boolean;
  assigneeId?: string | null;
}

export const createChecklistItem = async (taskId: string, data: CreateChecklistItemRequest) => {
  const response = await apiClient.post<ChecklistItemDto>(`/tasks/${taskId}/checklist`, data);
  return response.data;
};

export const updateChecklistItem = async (taskId: string, itemId: string, data: UpdateChecklistItemRequest) => {
  const response = await apiClient.put<ChecklistItemDto>(`/tasks/${taskId}/checklist/${itemId}`, data);
  return response.data;
};

export const deleteChecklistItem = async (taskId: string, itemId: string) => {
  await apiClient.delete(`/tasks/${taskId}/checklist/${itemId}`);
};
