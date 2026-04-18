/**
 * Push notification delivery via Expo Push API.
 * Sends push notifications to users' registered devices.
 */

import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

const expo = new Expo();

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
}

/**
 * Send a push notification to all active devices for a user.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  try {
    // Get all active (non-revoked) tokens for this user
    const tokens = await prisma.pushToken.findMany({
      where: { userId, revokedAt: null },
      select: { id: true, token: true },
    });

    if (tokens.length === 0) return;

    const messages: ExpoPushMessage[] = tokens
      .filter(({ token }) => Expo.isExpoPushToken(token))
      .map(({ token }) => ({
        to: token,
        sound: 'default' as const,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        badge: payload.badge,
        priority: 'high' as const,
      }));

    if (messages.length === 0) return;

    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const receipts = await expo.sendPushNotificationsAsync(chunk);

        // Handle invalid tokens — revoke them so we don't keep trying
        for (let i = 0; i < receipts.length; i++) {
          const receipt = receipts[i];
          if (receipt.status === 'error') {
            if (
              receipt.details?.error === 'DeviceNotRegistered' ||
              receipt.details?.error === 'InvalidCredentials'
            ) {
              // Find and revoke the bad token
              const badToken = chunk[i].to as string;
              await prisma.pushToken.updateMany({
                where: { token: badToken },
                data: { revokedAt: new Date() },
              });
              logger.info('Revoked invalid push token', { token: badToken.slice(0, 20) + '...' });
            }
          }
        }
      } catch (err) {
        logger.error('Push chunk send error', { error: err instanceof Error ? err.message : err });
      }
    }
  } catch (err) {
    logger.error('sendPushToUser error', { userId, error: err instanceof Error ? err.message : err });
  }
}

/**
 * Send push notifications to multiple users for a task activity.
 * Called after logActivity creates a UserActivity record.
 */
export async function sendPushForActivity(params: {
  activityId: string;
  actorUserId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  organizationId: string;
  recipientUserIds: string[];
}): Promise<void> {
  const { actorUserId, actorName, action, entityTitle, entityId, entityType, recipientUserIds } = params;

  // Don't notify the actor themselves
  const recipients = recipientUserIds.filter((id) => id !== actorUserId);
  if (recipients.length === 0) return;

  // Build human-readable message
  const verb = action.toLowerCase().replace(/_/g, ' ');
  const title = 'Onekof';
  const body = `${actorName} ${verb} ${entityTitle}`;

  // Deep link data for opening the right screen on tap
  const data: Record<string, string> = {
    type: entityType,
    entityId,
    activityId: params.activityId,
  };

  // Send to all recipients in parallel
  await Promise.allSettled(
    recipients.map((userId) => sendPushToUser(userId, { title, body, data })),
  );
}
