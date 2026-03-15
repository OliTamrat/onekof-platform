import { prisma } from '@onekof/database';
import { log, logSecurity } from '@/lib/logger';

/**
 * Session Management Utilities
 * Handles session invalidation, suspicious activity detection, and session security
 */

export interface SessionInvalidationReason {
  reason: 'password_change' | 'logout_all' | 'suspicious_activity' | 'manual_revoke';
  metadata?: Record<string, unknown>;
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(
  userId: string,
  invalidationReason: SessionInvalidationReason
): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });

    logSecurity('sessions_invalidated', 'medium', {
      userId,
      reason: invalidationReason.reason,
      metadata: invalidationReason.metadata,
    });

    log.info('All sessions invalidated for user', {
      userId,
      reason: invalidationReason.reason,
    });
  } catch (error) {
    log.error('Failed to invalidate user sessions', { userId, error });
    throw new Error('Session invalidation failed');
  }
}

/**
 * Check if a session should be invalidated based on security criteria
 */
export async function shouldInvalidateSession(
  userId: string,
  sessionCreatedAt: Date
): Promise<{ shouldInvalidate: boolean; reason?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordChangedAt: true,
        lockedUntil: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return { shouldInvalidate: true, reason: 'user_not_found' };
    }

    if (user.passwordChangedAt && user.passwordChangedAt > sessionCreatedAt) {
      return {
        shouldInvalidate: true,
        reason: 'password_changed_after_session',
      };
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return { shouldInvalidate: true, reason: 'account_locked' };
    }

    return { shouldInvalidate: false };
  } catch (error) {
    log.error('Error checking session invalidation', { userId, error });
    return { shouldInvalidate: true, reason: 'validation_error' };
  }
}

/**
 * Detect suspicious session activity
 */
export interface SuspiciousActivityCheck {
  isSuspicious: boolean;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export async function detectSuspiciousActivity(
  userId: string,
  _ipAddress: string,
  userAgent: string
): Promise<SuspiciousActivityCheck> {
  const reasons: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  try {
    const recentSessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() },
      },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
      },
      take: 10,
    });

    const uniqueIPs = new Set(
      recentSessions.map((s) => s.sessionToken.split('_')[0] || '')
    );
    if (uniqueIPs.size > 5) {
      reasons.push('multiple_concurrent_ips');
      riskLevel = 'medium';
    }

    const suspiciousAgentPatterns = [
      'bot',
      'crawler',
      'scraper',
      'curl',
      'wget',
      'python-requests',
    ];

    if (
      suspiciousAgentPatterns.some((pattern) =>
        userAgent.toLowerCase().includes(pattern)
      )
    ) {
      reasons.push('suspicious_user_agent');
      riskLevel = (riskLevel as string) === 'high' ? 'critical' : 'high';
    }

    const isSuspicious = reasons.length > 0;

    if (isSuspicious) {
      logSecurity('suspicious_activity_detected', riskLevel, {
        userId,
        reasons,
        ipAddress: _ipAddress,
        userAgent: userAgent.substring(0, 100),
      });
    }

    return {
      isSuspicious,
      reasons,
      riskLevel,
    };
  } catch (error) {
    log.error('Error detecting suspicious activity', { userId, error });
    return {
      isSuspicious: false,
      reasons: [],
      riskLevel: 'low',
    };
  }
}

/**
 * Get active session count for a user
 */
export async function getActiveSessionCount(userId: string): Promise<number> {
  try {
    const count = await prisma.session.count({
      where: {
        userId,
        expires: { gt: new Date() },
      },
    });
    return count;
  } catch (error) {
    log.error('Error counting active sessions', { userId, error });
    return 0;
  }
}

/**
 * List all active sessions for a user
 */
export async function listActiveSessions(userId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() },
      },
      select: {
        id: true,
        expires: true,
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      expiresAt: session.expires,
      device: 'Unknown Device',
      location: 'Unknown Location',
    }));
  } catch (error) {
    log.error('Error listing active sessions', { userId, error });
    return [];
  }
}

/**
 * Revoke a specific session
 */
export async function revokeSession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.session.delete({
      where: {
        id: sessionId,
        userId,
      },
    });

    logSecurity('session_revoked', 'low', {
      userId,
      sessionId,
    });

    return true;
  } catch (error) {
    log.error('Error revoking session', { sessionId, userId, error });
    return false;
  }
}
