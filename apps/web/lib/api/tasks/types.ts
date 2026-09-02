export interface User {
  id: string;
  email: string;
  displayName: string;
  status: string;
  createdAt: string;
  roles?: string[];
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkspaceSettings {
  createPagesPermission: string;
  createDatabasesPermission: string;
  createProjectsPermission: string;
  deleteContentPermission: string;
  inviteMembersPermission: string;
  manageSettingsPermission: string;
  exportWorkspacePermission: string;
}

export interface ResourcePermission {
  id: string;
  workspaceId: string;
  resourceType: string;
  resourceId: string | null;
  userId: string | null;
  role: string | null;
  accessLevel: string;
  createdAt: string;
}

export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    email: string;
    displayName: string;
    role: string;
    createdAt: string;
    phone?: string | null;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  status: string;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt?: string;
}



export interface TaskActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Done' | 'Blocked' | 'Cancelled' | string;
export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low' | 'None' | string;

export interface UserSummary {
  id: string;
  displayName: string;
  email: string;
}

export interface Task {
  id: string;
  userId: string;
  workspaceId: string;
  projectId?: string;
  databaseId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  assigneeName?: string;
  assignees?: UserSummary[];
  assigneeIds?: string[];
  tags: string[];
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt?: string;

  subtasks: Task[];
  subtaskCount: number;
  completedSubtaskCount: number;
  estimate?: number | null;
  checklistItems: import('./checklist').ChecklistItemDto[];
}

export interface CreateTaskPayload {
  workspaceId: string;
  projectId?: string;
  databaseId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  assigneeIds?: string[];
  tags?: string[];
  startDate?: string;
  dueDate?: string;
  estimate?: number | null;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assigneeId?: string;
  assigneeIds?: string[];
  tags?: string[];
  startDate?: string;
  dueDate?: string;
  estimate?: number | null;
}


