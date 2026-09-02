import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as taskService from './service';
import { GetTasksParams } from './service';
import { CreateTaskPayload, UpdateTaskPayload } from './types';
import { toast } from 'sonner';

export const taskKeys = {
  all: ['tasks'] as const,
  users: () => [...taskKeys.all, 'users'] as const,
  workspaces: () => [...taskKeys.all, 'workspaces'] as const,
  projects: (workspaceId: string) => [...taskKeys.all, 'projects', workspaceId] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  tasks: (params?: GetTasksParams) => [...taskKeys.lists(), params] as const,
  task: (id: string) => [...taskKeys.all, 'detail', id] as const,
};

// ─── Users ──────────────────────────────────────────────────

const getErrorMessage = (error: any, fallbackMessage: string) => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.title) return data.title;
    if (typeof data === 'string' && data.trim()) return data;
  }
  if (error?.response?.status) {
    const status = error.response.status;
    if (status === 404) return 'Lỗi 404: Không tìm thấy không gian làm việc hoặc bạn không có quyền truy cập.';
    if (status === 403) return 'Lỗi 403: Bạn không có quyền thực hiện thao tác này.';
    if (status === 400) return 'Lỗi 400: Yêu cầu không hợp lệ.';
    return `Lỗi ${status}: ${error.response.statusText || fallbackMessage}`;
  }
  return error?.message || fallbackMessage;
};

export const useUsers = () =>
  useQuery({ queryKey: taskKeys.users(), queryFn: taskService.getUsers });

// ─── Workspaces ─────────────────────────────────────────────

export const useWorkspaces = () =>
  useQuery({ queryKey: taskKeys.workspaces(), queryFn: taskService.getWorkspaces });

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.workspaces() });
      toast.success('Workspace created successfully');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to create workspace'));
    }
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof taskService.updateWorkspace>[1] }) => taskService.updateWorkspace(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.workspaces() });
      toast.success('Workspace updated successfully');
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, 'Failed to update workspace'));
    }
  });
};

export const useArchiveWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.archiveWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.workspaces() });
      toast.success('Workspace status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update workspace status');
    }
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.workspaces() });
      toast.success('Workspace deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete workspace');
    }
  });
};

// --- Workspace Member Hooks ---

export function useWorkspaceMembers(workspaceId: string) {
    return useQuery({
        queryKey: ['workspace-members', workspaceId],
        queryFn: () => taskService.getWorkspaceMembers(workspaceId),
        enabled: !!workspaceId,
    });
}

export function useAddWorkspaceMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ workspaceId, email, role }: { workspaceId: string; email: string; role: string }) =>
            taskService.addWorkspaceMember(workspaceId, { email, role }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workspace-members', variables.workspaceId] });
        },
    });
}

export function useUpdateWorkspaceMemberRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ workspaceId, userId, role }: { workspaceId: string; userId: string; role: string }) =>
            taskService.updateWorkspaceMemberRole(workspaceId, userId, { role }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workspace-members', variables.workspaceId] });
        },
    });
}

export function useRemoveWorkspaceMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
            taskService.removeWorkspaceMember(workspaceId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workspace-members', variables.workspaceId] });
        },
    });
}

// ─── Projects ────────────────────────────────────────────────

export const useProjects = (workspaceId: string) =>
  useQuery({
    queryKey: taskKeys.projects(workspaceId),
    queryFn: () => taskService.getProjects(workspaceId),
    enabled: !!workspaceId,
  });

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof taskService.createProject>[1]) =>
      taskService.createProject(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.projects(workspaceId) });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create project');
    }
  });
};

// ─── Tasks ───────────────────────────────────────────────────

export const useTasks = (params?: GetTasksParams) =>
  useQuery({
    queryKey: taskKeys.tasks(params),
    queryFn: () => taskService.getTasks(params),
    enabled: true,
  });

export const useTask = (id: string) =>
  useQuery({
    queryKey: taskKeys.task(id),
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create task');
    }
  });
};

export const useUpdateTask = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => taskService.updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.task(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update task');
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete task');
    }
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.completeTask,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.task(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success(data.status === 'Done' ? 'Task completed' : 'Task reopened');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update task');
    }
  });
};

export const useArchiveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.archiveTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success(data.archivedAt ? 'Task archived' : 'Task unarchived');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to archive task');
    }
  });
};

// ─── Checklist ───────────────────────────────────────────────

export const useTaskActivityLogs = (taskId: string, enabled = true) =>
  useQuery({
    queryKey: [...taskKeys.task(taskId), 'activity'],
    queryFn: () => taskService.getTaskActivityLogs(taskId),
    enabled: !!taskId && enabled,
  });

export const useWorkspaceSettings = (workspaceId: string) =>
  useQuery({
    queryKey: ['workspaceSettings', workspaceId],
    queryFn: () => taskService.getWorkspaceSettings(workspaceId),
    enabled: !!workspaceId,
  });

export const useUpdateWorkspaceSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, settings }: { workspaceId: string; settings: any }) =>
      taskService.updateWorkspaceSettings(workspaceId, settings),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaceSettings', workspaceId] });
      toast.success('Settings updated');
    },
    onError: (error: any) => toast.error(getErrorMessage(error, 'Failed to update settings')),
  });
};

export const useResourcePermissions = (workspaceId: string) =>
  useQuery({
    queryKey: ['resourcePermissions', workspaceId],
    queryFn: () => taskService.getResourcePermissions(workspaceId),
    enabled: !!workspaceId,
  });

export const useSetResourcePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, payload }: { workspaceId: string; payload: any }) =>
      taskService.setResourcePermission(workspaceId, payload),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['resourcePermissions', workspaceId] });
      toast.success('Permission saved');
    },
    onError: () => toast.error('Failed to save permission'),
  });
};

export const useRemoveResourcePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, permissionId }: { workspaceId: string; permissionId: string }) =>
      taskService.removeResourcePermission(workspaceId, permissionId),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['resourcePermissions', workspaceId] });
      toast.success('Permission removed');
    },
    onError: () => toast.error('Failed to remove permission'),
  });
};
