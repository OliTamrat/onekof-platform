/**
 * Utility functions for parsing @mentions in text and managing auto-watch
 */

import { prisma } from '@onekof/database';

/**
 * Extracts @mentions from text content
 * Supports formats: @username, @email@domain.com
 * Returns array of unique mention strings without the @ symbol
 */
export function extractMentions(content: string): string[] {
  if (!content) return [];

  // Match @username (alphanumeric + underscore + dot) or @email@domain.com
  const mentionRegex = /@([\w.]+(?:@[\w.-]+)?)/g;
  const matches = content.match(mentionRegex);

  if (!matches) return [];

  // Remove @ symbol and get unique mentions
  const mentions = matches.map(m => m.substring(1));
  return Array.from(new Set(mentions));
}

/**
 * Resolves mention strings to user IDs
 * Attempts to match by:
 * 1. Email (if mention looks like email@domain.com)
 * 2. Name (case-insensitive partial match)
 *
 * Returns array of unique user IDs
 */
export async function resolveMentionsToUserIds(
  mentions: string[],
  organizationId: string
): Promise<string[]> {
  if (mentions.length === 0) return [];

  // Split mentions into emails and potential usernames
  const emails = mentions.filter(m => m.includes('@'));
  const usernames = mentions.filter(m => !m.includes('@'));

  const userIds: string[] = [];

  // Find users by email
  if (emails.length > 0) {
    const usersByEmail = await prisma.user.findMany({
      where: {
        email: { in: emails },
        organizations: {
          some: {
            organizationId,
          },
        },
      },
      select: { id: true },
    });
    userIds.push(...usersByEmail.map(u => u.id));
  }

  // Find users by name (case-insensitive, partial match)
  if (usernames.length > 0) {
    const usersByName = await prisma.user.findMany({
      where: {
        OR: usernames.map(username => ({
          name: {
            contains: username,
            mode: 'insensitive' as const,
          },
        })),
        organizations: {
          some: {
            organizationId,
          },
        },
      },
      select: { id: true },
    });
    userIds.push(...usersByName.map(u => u.id));
  }

  // Return unique user IDs
  return Array.from(new Set(userIds));
}

/**
 * Auto-watches mentioned users on a task
 * Creates TaskWatcher records with AUTO_MENTIONED reason
 */
export async function autoWatchMentionedUsers(
  taskId: string,
  content: string,
  organizationId: string,
  addedById: string
): Promise<number> {
  // Extract mentions from content
  const mentions = extractMentions(content);
  if (mentions.length === 0) return 0;

  // Resolve mentions to user IDs
  const userIds = await resolveMentionsToUserIds(mentions, organizationId);
  if (userIds.length === 0) return 0;

  // Create watchers for mentioned users (upsert to avoid duplicates)
  let watchersAdded = 0;
  for (const userId of userIds) {
    try {
      await prisma.taskWatcher.upsert({
        where: {
          taskId_userId: {
            taskId,
            userId,
          },
        },
        create: {
          taskId,
          userId,
          watchReason: 'AUTO_MENTIONED',
          addedBy: addedById,
        },
        update: {}, // Keep existing preferences if already watching
      });
      watchersAdded++;
    } catch (error) {
      // Continue on error (user might not have permission, etc.)
      console.error(`Failed to auto-watch user ${userId}:`, error);
    }
  }

  return watchersAdded;
}
