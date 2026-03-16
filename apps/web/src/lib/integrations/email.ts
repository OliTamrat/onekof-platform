import { upsertConnection, getConnection, logEvent, deleteConnection } from './store';
import type { EmailConfig, EmailNotificationConfig } from './types';

export async function connectEmail(
  organizationId: string,
  userId: string,
  config?: Partial<EmailConfig>
) {
  const defaultConfig: EmailConfig = {
    digestFrequency: 'daily',
    digestTime: '09:00',
    digestDay: 'monday',
    notifications: {
      taskAssigned: true,
      taskCompleted: true,
      commentAdded: true,
      mentioned: true,
      projectUpdated: false,
      dueDateReminder: true,
      weeklyDigest: true,
    },
    recipients: [],
    ...config,
  };

  const connection = await upsertConnection(organizationId, 'email', {
    status: 'connected',
    accessToken: '',
    refreshToken: null,
    tokenExpiresAt: null,
    externalAccountId: organizationId,
    externalAccountName: 'Email Notifications',
    scopes: [],
    metadata: {},
    configuration: defaultConfig,
    connectedBy: userId,
    connectedAt: new Date(),
  });

  await logEvent(organizationId, {
    connectionId: connection.id,
    type: 'email.connected',
    direction: 'outbound',
    status: 'success',
    payload: { frequency: defaultConfig.digestFrequency },
    response: null,
    error: null,
  });

  return connection;
}

export async function disconnectEmail(organizationId: string): Promise<void> {
  const connection = await getConnection(organizationId, 'email');
  if (connection) {
    await logEvent(organizationId, {
      connectionId: connection.id,
      type: 'email.disconnected',
      direction: 'outbound',
      status: 'success',
      payload: {},
      response: null,
      error: null,
    });
  }

  await deleteConnection(organizationId, 'email');
}

export async function updateEmailConfig(
  organizationId: string,
  updates: Partial<EmailConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'email');
  if (!connection) throw new Error('Email notifications not enabled');

  const currentConfig = connection.configuration as EmailConfig;
  await upsertConnection(organizationId, 'email', {
    configuration: { ...currentConfig, ...updates },
  });
}

export async function updateEmailNotifications(
  organizationId: string,
  notifications: Partial<EmailNotificationConfig>
): Promise<void> {
  const connection = await getConnection(organizationId, 'email');
  if (!connection) throw new Error('Email notifications not enabled');

  const currentConfig = connection.configuration as EmailConfig;
  await upsertConnection(organizationId, 'email', {
    configuration: {
      ...currentConfig,
      notifications: { ...currentConfig.notifications, ...notifications },
    },
  });
}

export async function sendEmailNotification(
  organizationId: string,
  event: {
    type: string;
    subject: string;
    body: string;
    recipientEmails?: string[];
  }
): Promise<void> {
  const connection = await getConnection(organizationId, 'email');
  if (!connection || connection.status !== 'connected') return;

  const config = connection.configuration as EmailConfig;

  const notifKey = {
    'task.assigned': 'taskAssigned',
    'task.completed': 'taskCompleted',
    'comment.added': 'commentAdded',
    'user.mentioned': 'mentioned',
    'project.updated': 'projectUpdated',
    'task.due_reminder': 'dueDateReminder',
  }[event.type] as keyof EmailNotificationConfig | undefined;

  if (notifKey && !config.notifications[notifKey]) return;

  // In production, this would call an email service (SendGrid, SES, Resend, etc.)
  // For now, log the event for delivery by a background job
  await logEvent(organizationId, {
    connectionId: connection.id,
    type: `email.notification.${event.type}`,
    direction: 'outbound',
    status: 'pending',
    payload: {
      subject: event.subject,
      recipientCount: event.recipientEmails?.length || config.recipients.length,
      frequency: config.digestFrequency,
    },
    response: null,
    error: null,
  });
}

export async function testEmailConnection(organizationId: string): Promise<{ success: boolean; error?: string }> {
  const connection = await getConnection(organizationId, 'email');
  if (!connection) return { success: false, error: 'Not configured' };
  // Email doesn't require an external connection test — it's always "connected" once configured
  return { success: true };
}
