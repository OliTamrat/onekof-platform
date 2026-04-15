/**
 * Shared TypeScript types for the Onekof mobile app.
 * Mirrors the web app's Prisma schema and API response shapes.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
export type TaskType = 'TASK' | 'STORY' | 'BUG' | 'EPIC' | 'SUBTASK';
export type TaskPriority = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'ON_HOLD';
export type ProjectType = 'SOFTWARE' | 'BUSINESS' | 'MARKETING' | 'OPERATIONS' | 'RESEARCH' | 'CONSTRUCTION' | 'CUSTOM';
export type ProjectVisibility = 'PUBLIC' | 'INTERNAL' | 'PRIVATE' | 'CONFIDENTIAL';

export type TeamRole = 'LEAD' | 'MEMBER';
export type ProjectRole = 'ADMIN' | 'MEMBER' | 'VIEWER' | 'CONTRACTOR';
export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  role?: OrgRole;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  status: ProjectStatus;
  type?: ProjectType;
  color: string | null;
  icon?: string | null;
  leadId?: string | null;
  lead?: User | null;
  visibility?: ProjectVisibility;
  startDate?: string | null;
  dueDate?: string | null;
  progress?: number;
  memberCount?: number;
  isFavorite?: boolean;
  _count?: { issues: number };
  taskStats?: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Issue {
  id: string;
  key?: string;
  title: string;
  description?: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  project?: Pick<Project, 'id' | 'name' | 'key' | 'color'>;
  assigneeId?: string | null;
  assignee?: User | null;
  reporterId?: string | null;
  reporter?: User | null;
  parentId?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  estimate?: number | null;
  timeSpent?: number | null;
  labels?: string[];
  backlogOrder?: number;
  commentCount?: number;
  attachmentCount?: number;
  subtasks?: Issue[];
  subtaskProgress?: number;
  comments?: Comment[];
  attachments?: Attachment[];
  watchers?: Watcher[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  taskId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploaderId?: string;
  uploader?: User;
  createdAt?: string;
}

export interface Watcher {
  id?: string;
  userId: string;
  user?: User;
  watchReason?: 'MANUAL' | 'AUTO_ASSIGNED' | 'AUTO_MENTIONED' | 'AUTO_CREATED' | 'AUTO_PARTICIPATED';
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isDefault?: boolean;
  memberCount?: number;
  projectCount?: number;
  members?: TeamMember[];
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  user?: User;
  role: TeamRole;
  joinedAt?: string;
}

export interface Member {
  id: string;
  userId: string;
  user?: User;
  role: ProjectRole;
  addedAt?: string;
}

export interface Activity {
  id: string;
  type: string;
  field?: string;
  oldValue?: string | null;
  newValue?: string | null;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  progress: number;
  targetDate?: string | null;
  ownerId?: string | null;
  owner?: User | null;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  read: boolean;
  issueId?: string | null;
  projectId?: string | null;
  createdAt: string;
}

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  total?: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
  data?: T[];
}

export interface DashboardStats {
  totalIssues?: number;
  completedIssues?: number;
  inProgressIssues?: number;
  todoIssues?: number;
  overdueIssues?: number;
  totalProjects?: number;
  totalMembers?: number;
}

// ─── Form/Create Payloads ────────────────────────────────────────────────────

export interface CreateIssuePayload {
  projectId: string;
  title: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  labels?: string[];
  dueDate?: string;
  estimate?: number;
  parentId?: string;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  labels?: string[];
  dueDate?: string | null;
  estimate?: number | null;
  timeSpent?: number | null;
  backlogOrder?: number;
}

// ─── Display Config ──────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: string }> = {
  BACKLOG: { label: 'Backlog', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', icon: 'inbox' },
  TODO: { label: 'To Do', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: 'circle-o' },
  IN_PROGRESS: { label: 'In Progress', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: 'play-circle' },
  IN_REVIEW: { label: 'In Review', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: 'eye' },
  DONE: { label: 'Done', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: 'check-circle' },
  BLOCKED: { label: 'Blocked', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: 'ban' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; icon: string }> = {
  HIGHEST: { label: 'Highest', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: 'angle-double-up' },
  HIGH: { label: 'High', color: '#F97316', bg: 'rgba(249,115,22,0.1)', icon: 'angle-up' },
  MEDIUM: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: 'minus' },
  LOW: { label: 'Low', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: 'angle-down' },
  LOWEST: { label: 'Lowest', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', icon: 'angle-double-down' },
};

export const TYPE_CONFIG: Record<TaskType, { label: string; color: string; icon: string }> = {
  TASK: { label: 'Task', color: '#3B82F6', icon: 'check-square-o' },
  STORY: { label: 'Story', color: '#22C55E', icon: 'bookmark' },
  BUG: { label: 'Bug', color: '#EF4444', icon: 'bug' },
  EPIC: { label: 'Epic', color: '#8B5CF6', icon: 'bolt' },
  SUBTASK: { label: 'Subtask', color: '#94A3B8', icon: 'level-down' },
};
