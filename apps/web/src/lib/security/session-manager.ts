import { prisma } from '@onekof/database';
import { log, logSecurity } from '@/lib/logger';

/**
 * Session Management Utilities
 * Handles session invalidation, suspicious activity detection, and session security
 */

export interface SessionInvalidationReason {
  reason: 'password_change' | 'logout_all' | 'suspicious_activity' | 'manual_revoke';
  metadata?: Record<string, any>;
}

/**
 * Invalidate all sessions for a user
 * Used when password is changed, account compromised, or user logs out all devices
 */
export async function invalidateAllUserSessions(
  userId: string,
  invalidationReason: SessionInvalidationReason
): Promise<void> {
  try {
    // Delete all active sessions for this user
    // NextAuth stores sessions in the Session table
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });

    // Log the invalidation for audit
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
        accountLockedUntil: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return { shouldInvalidate: true, reason: 'user_not_found' };
    }

    // Invalidate if password was changed after session was created
    if (user.passwordChangedAt && user.passwordChangedAt > sessionCreatedAt) {
      return {
        shouldInvalidate: true,
        reason: 'password_changed_after_session',
      };
    }

    // Invalidate if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      return { shouldInvalidate: true, reason: 'account_locked' };
    }

    return { shouldInvalidate: false };
  } catch (error) {
    log.error('Error checking session invalidation', { userId, error });
    // Fail closed - invalidate session on error
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
  ipAddress: string,
  userAgent: string
): Promise<SuspiciousActivityCheck> {
  const reasons: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  try {
    // Get recent sessions for this user
    const recentSessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Check 1: Multiple concurrent sessions from different IPs
    const uniqueIPs = new Set(
      recentSessions.map((s) => s.sessionToken.split('_')[0] || '')
    );
    if (uniqueIPs.size > 5) {
      reasons.push('multiple_concurrent_ips');
      riskLevel = 'medium';
    }

    // Check 2: Session created from unusual location (requires geo-IP implementation)
    // Placeholder for future enhancement

    // Check 3: Rapid session creation (possible session fixation attack)
    const sessionsLast5Min = recentSessions.filter((s) => {
      const diff = Date.now() - new Date(s.createdAt).getTime();
      return diff < 5 * 60 * 1000; // 5 minutes
    });

    if (sessionsLast5Min.length > 5) {
      reasons.push('rapid_session_creation');
      riskLevel = 'high';
    }

    // Check 4: Suspicious user agent patterns
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
      riskLevel = riskLevel === 'high' ? 'critical' : 'high';
    }

    const isSuspicious = reasons.length > 0;

    if (isSuspicious) {
      logSecurity('suspicious_activity_detected', riskLevel, {
        userId,
        reasons,
        ipAddress,
        userAgent: userAgent.substring(0, 100), // Truncate for logging
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
 * Returns session metadata for "active devices" display
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
        createdAt: true,
        expires: true,
        // Note: sessionToken contains encrypted data, extract metadata if needed
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expires,
      // In production, you'd parse user agent and IP from session metadata
      device: 'Unknown Device',
      location: 'Unknown Location',
      lastActive: session.createdAt,
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
        userId, // Ensure user can only delete their own sessions
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
