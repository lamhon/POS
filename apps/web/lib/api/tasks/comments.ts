import apiClient from '../../api-client';

export interface TaskCommentReactionDto {
  emoji: string;
  userId: string;
  userDisplayName: string;
}

export interface TaskCommentDto {
  id: string;
  taskId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  parentCommentId: string | null;
  repliesCount: number;
  reactions: TaskCommentReactionDto[];
  isImportant: boolean;
  replies?: TaskCommentDto[];
}

export interface CreateTaskCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateTaskCommentRequest {
  content: string;
}

export const getTaskComments = async (taskId: string) => {
  const { data } = await apiClient.get<TaskCommentDto[]>(`/tasks/${taskId}/comments`);
  return data;
};

export const createTaskComment = async (taskId: string, data: CreateTaskCommentRequest) => {
  const { data: res } = await apiClient.post<TaskCommentDto>(`/tasks/${taskId}/comments`, data);
  return res;
};

export const updateTaskComment = async (taskId: string, commentId: string, data: UpdateTaskCommentRequest) => {
  const { data: res } = await apiClient.put<TaskCommentDto>(`/tasks/${taskId}/comments/${commentId}`, data);
  return res;
};

export const deleteTaskComment = async (taskId: string, commentId: string) => {
  await apiClient.delete<void>(`/tasks/${taskId}/comments/${commentId}`);
};

export const toggleCommentReaction = async (taskId: string, commentId: string, emoji: string) => {
  await apiClient.post<void>(`/tasks/${taskId}/comments/${commentId}/reactions`, { emoji });
};

export const toggleCommentImportant = async (taskId: string, commentId: string) => {
  const { data } = await apiClient.post<TaskCommentDto>(`/tasks/${taskId}/comments/${commentId}/toggle-important`);
  return data;
};

export const promoteComment = async (taskId: string, commentId: string) => {
  const { data } = await apiClient.post<TaskCommentDto>(`/tasks/${taskId}/comments/${commentId}/promote`);
  return data;
};
