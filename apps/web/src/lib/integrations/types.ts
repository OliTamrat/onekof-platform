export type IntegrationProvider = 'slack' | 'github' | 'google' | 'microsoft-teams' | 'webhooks' | 'email' | 'google-calendar' | 'jira';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface IntegrationConnection {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  externalAccountId: string | null;
  externalAccountName: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  configuration: IntegrationConfig;
  connectedBy: string;
  connectedAt: Date;
  updatedAt: Date;
}

export interface SlackConfig {
  teamId: string;
  teamName: string;
  defaultChannelId: string | null;
  defaultChannelName: string | null;
  channels: SlackChannel[];
  notifications: SlackNotificationConfig;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  projectId?: string;
}

export interface SlackNotificationConfig {
  taskCreated: boolean;
  taskCompleted: boolean;
  taskAssigned: boolean;
  commentAdded: boolean;
  projectUpdated: boolean;
  dailyDigest: boolean;
  digestTime: string; // HH:mm format
}

export interface GitHubConfig {
  installationId: number | null;
  accountLogin: string;
  accountType: 'User' | 'Organization';
  repositories: GitHubRepo[];
  webhookSecret: string;
  autoLinkPRs: boolean;
  autoCloseOnMerge: boolean;
  branchFormat: string; // e.g., "onekof/{task-key}"
}

export interface GitHubRepo {
  id: number;
  fullName: string;
  name: string;
  private: boolean;
  projectId?: string;
}

export interface GoogleConfig {
  email: string;
  calendarSync: boolean;
  driveSync: boolean;
  selectedCalendars: GoogleCalendar[];
  syncDirection: 'one_way' | 'two_way';
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary: boolean;
  projectId?: string;
}

// Microsoft Teams
export interface TeamsConfig {
  tenantId: string;
  teamId: string;
  teamName: string;
  defaultChannelId: string | null;
  defaultChannelName: string | null;
  channels: TeamsChannel[];
  notifications: TeamsNotificationConfig;
}

export interface TeamsChannel {
  id: string;
  displayName: string;
  projectId?: string;
}

export interface TeamsNotificationConfig {
  taskCreated: boolean;
  taskCompleted: boolean;
  taskAssigned: boolean;
  commentAdded: boolean;
  projectUpdated: boolean;
}

// Webhooks
export interface WebhooksConfig {
  endpoints: WebhookEndpoint[];
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastDeliveryAt: string | null;
  lastDeliveryStatus: 'success' | 'failed' | null;
}

// Email Notifications
export interface EmailConfig {
  digestFrequency: 'realtime' | 'daily' | 'weekly';
  digestTime: string; // HH:mm
  digestDay: string; // for weekly: 'monday' | 'tuesday' etc.
  notifications: EmailNotificationConfig;
  recipients: EmailRecipient[];
}

export interface EmailNotificationConfig {
  taskAssigned: boolean;
  taskCompleted: boolean;
  commentAdded: boolean;
  mentioned: boolean;
  projectUpdated: boolean;
  dueDateReminder: boolean;
  weeklyDigest: boolean;
}

export interface EmailRecipient {
  email: string;
  name: string;
  userId?: string;
}

// Google Calendar (standalone, piggybacks on Google OAuth)
export interface GoogleCalendarConfig {
  email: string;
  selectedCalendars: GoogleCalendar[];
  syncDirection: 'one_way' | 'two_way';
  syncDeadlines: boolean;
  syncMilestones: boolean;
  defaultReminder: number; // minutes before
}

// Jira Import
export interface JiraConfig {
  siteUrl: string;
  email: string;
  projects: JiraProject[];
  importStatus: 'idle' | 'in_progress' | 'completed' | 'failed';
  lastImportAt: string | null;
  statusMapping: Record<string, string>;
  userMapping: Record<string, string>;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  imported: boolean;
  issueCount?: number;
}

export type IntegrationConfig =
  | SlackConfig
  | GitHubConfig
  | GoogleConfig
  | TeamsConfig
  | WebhooksConfig
  | EmailConfig
  | GoogleCalendarConfig
  | JiraConfig;

export interface IntegrationEvent {
  id: string;
  connectionId: string;
  type: string;
  direction: 'inbound' | 'outbound';
  status: 'success' | 'failed' | 'pending';
  payload: Record<string, unknown>;
  response: Record<string, unknown> | null;
  error: string | null;
  createdAt: Date;
}

export interface OAuthState {
  organizationId: string;
  userId: string;
  provider: IntegrationProvider;
  redirectUrl: string;
  nonce: string;
}
