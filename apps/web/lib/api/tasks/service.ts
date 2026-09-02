import apiClient from '../../api-client';
import {
  Workspace, Project, Task,
  CreateTaskPayload, UpdateTaskPayload, User, TaskActivityLog, WorkspaceMember, WorkspaceSettings, ResourcePermission
} from './types';
import { PaginatedResult } from '../finance/types';

// ─── Users ────────────────────────────────────────────────

export const getUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<User[]>('/users');
  return data;
};

// ─── Workspaces ────────────────────────────────────────────

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const { data } = await apiClient.get<Workspace[]>('/workspaces');
  return data;
};

export const createWorkspace = async (payload: { name: string; description?: string; icon?: string; color?: string }): Promise<Workspace> => {
  const { data } = await apiClient.post<Workspace>('/workspaces', payload);
  return data;
};

export const updateWorkspace = async (id: string, payload: { name?: string; description?: string; icon?: string; color?: string; isPinned?: boolean }): Promise<Workspace> => {
  const { data } = await apiClient.put<Workspace>(`/workspaces/${id}`, payload);
  return data;
};

export const archiveWorkspace = async (id: string): Promise<Workspace> => {
  const { data } = await apiClient.post<Workspace>(`/workspaces/${id}/archive`);
  return data;
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  await apiClient.delete(`/workspaces/${id}`);
};

// ─── Projects ─────────────────────────────────────────────

export const getProjects = async (workspaceId: string): Promise<Project[]> => {
  const { data } = await apiClient.get<Project[]>(`/workspaces/${workspaceId}/projects`);
  return data;
};

export const createProject = async (workspaceId: string, payload: {
  name: string; description?: string; icon?: string; color?: string;
  priority?: string; startDate?: string; dueDate?: string;
}): Promise<Project> => {
  const { data } = await apiClient.post<Project>(`/workspaces/${workspaceId}/projects`, payload);
  return data;
};

// ─── Tasks ────────────────────────────────────────────────

export interface GetTasksParams {
  workspaceId?: string;
  projectId?: string;
  parentTaskId?: string;
  status?: string;
  priority?: string;
  search?: string;
  assigneeIds?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  includeArchived?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export const getTasks = async (params: GetTasksParams = {}): Promise<PaginatedResult<Task>> => {
  const { data } = await apiClient.get<PaginatedResult<Task>>('/tasks', { params });
  return data;
};

export const getTaskById = async (id: string): Promise<Task> => {
  const { data } = await apiClient.get<Task>(`/tasks/${id}`);
  return data;
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const { data } = await apiClient.post<Task>('/tasks', payload);
  return data;
};

export const updateTask = async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

export const completeTask = async (id: string): Promise<Task> => {
  const { data } = await apiClient.post<Task>(`/tasks/${id}/complete`);
  return data;
};

export const archiveTask = async (id: string): Promise<Task> => {
  const { data } = await apiClient.post<Task>(`/tasks/${id}/archive`);
  return data;
};


export const getTaskActivityLogs = async (taskId: string): Promise<TaskActivityLog[]> => {
  const { data } = await apiClient.get<TaskActivityLog[]>(`/tasks/${taskId}/activity`);
  return data;
};

// ─── Workspace Members ─────────────────────────────────────

export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  const { data } = await apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
  return data;
};

export const addWorkspaceMember = async (workspaceId: string, payload: { email: string; role: string }): Promise<WorkspaceMember> => {
  const { data } = await apiClient.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, payload);
  return data;
};

export const updateWorkspaceMemberRole = async (workspaceId: string, userId: string, payload: { role: string }): Promise<WorkspaceMember> => {
  const { data } = await apiClient.put<WorkspaceMember>(`/workspaces/${workspaceId}/members/${userId}`, payload);
  return data;
};

export const removeWorkspaceMember = async (workspaceId: string, userId: string): Promise<boolean> => {
  await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
  return true;
};

export const getWorkspaceSettings = async (workspaceId: string): Promise<WorkspaceSettings> => {
  const { data } = await apiClient.get<WorkspaceSettings>(`/workspaces/${workspaceId}/settings`);
  return data;
};

export const updateWorkspaceSettings = async (workspaceId: string, settings: WorkspaceSettings): Promise<boolean> => {
  await apiClient.put(`/workspaces/${workspaceId}/settings`, settings);
  return true;
};

export const getResourcePermissions = async (workspaceId: string): Promise<ResourcePermission[]> => {
  const { data } = await apiClient.get<ResourcePermission[]>(`/workspaces/${workspaceId}/resource-permissions`);
  return data;
};

export const setResourcePermission = async (
  workspaceId: string, 
  payload: { resourceType: string; resourceId: string | null; targetUserId: string | null; targetRole: string | null; accessLevel: string }
): Promise<ResourcePermission> => {
  const { data } = await apiClient.post<ResourcePermission>(`/workspaces/${workspaceId}/resource-permissions`, payload);
  return data;
};

export const removeResourcePermission = async (workspaceId: string, permissionId: string): Promise<boolean> => {
  await apiClient.delete(`/workspaces/${workspaceId}/resource-permissions/${permissionId}`);
  return true;
};
