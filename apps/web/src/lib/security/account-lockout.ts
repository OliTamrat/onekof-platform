import { prisma } from '@onekof/database';
import { logSecurity, log } from '@/lib/logger';
import { sendAccountLockedEmail } from '@/lib/email';

/**
 * Account Lockout Management
 *
 * SECURITY: Prevents brute force attacks by locking accounts after N failed login attempts
 * Implements exponential backoff for progressive lockout durations
 */

// Lockout configuration
const LOCKOUT_CONFIG = {
  // Number of failed attempts before lockout
  maxAttempts: 5,

  // Lockout durations (in minutes) based on number of lockouts
  lockoutDurations: [
    15,  // 1st lockout: 15 minutes
    30,  // 2nd lockout: 30 minutes
    60,  // 3rd lockout: 1 hour
    240, // 4th lockout: 4 hours
    1440 // 5th+ lockout: 24 hours
  ],

  // Time window to track failed attempts (in minutes)
  attemptWindow: 30,

  // Time after which to reset lockout count (in days)
  resetLockoutAfterDays: 30,
};

/**
 * Record a failed login attempt for a user
 * Returns lockout information if account should be locked
 */
export async function recordFailedLogin(email: string): Promise<{
  locked: boolean;
  attemptsRemaining?: number;
  lockedUntil?: Date;
  lockoutCount?: number;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        accountLockedUntil: true,
        lockoutCount: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists - just return success
      return { locked: false };
    }

    // Check if we should reset the attempt counter
    const now = new Date();
    const windowMs = LOCKOUT_CONFIG.attemptWindow * 60 * 1000;
    const shouldResetAttempts = !user.lastFailedLoginAt ||
      (now.getTime() - user.lastFailedLoginAt.getTime() > windowMs);

    const currentAttempts = shouldResetAttempts ? 0 : (user.failedLoginAttempts || 0);
    const newAttempts = currentAttempts + 1;

    // Check if account should be locked
    if (newAttempts >= LOCKOUT_CONFIG.maxAttempts) {
      const lockoutCount = (user.lockoutCount || 0) + 1;
      const durationIndex = Math.min(lockoutCount - 1, LOCKOUT_CONFIG.lockoutDurations.length - 1);
      const lockoutMinutes = LOCKOUT_CONFIG.lockoutDurations[durationIndex];
      const lockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000);

      // Lock the account
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lastFailedLoginAt: now,
          accountLockedUntil: lockedUntil,
          lockoutCount,
        },
      });

      // Log security event
      logSecurity('account_locked', 'high', {
        userId: user.id,
        email: user.email,
        attempts: newAttempts,
        lockoutCount,
        lockedUntil: lockedUntil.toISOString(),
        lockoutMinutes,
      });

      log.warn('Account locked due to failed login attempts', {
        email: user.email,
        attempts: newAttempts,
        lockedUntil: lockedUntil.toISOString(),
      });

      // Send account locked notification email
      try {
        await sendAccountLockedEmail(user.email, lockedUntil);
        log.info('Account locked notification email sent', { email: user.email });
      } catch (emailError) {
        // Log email error but don't fail the lockout
        log.error('Failed to send account locked email', {
          error: emailError,
          userId: user.id,
        });
        // Continue - account is still locked even if email fails
      }

      return {
        locked: true,
        lockedUntil,
        lockoutCount,
      };
    }

    // Update failed attempt count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        lastFailedLoginAt: now,
      },
    });

    // Log failed attempt
    logSecurity('failed_login_attempt', 'low', {
      userId: user.id,
      email: user.email,
      attempts: newAttempts,
      attemptsRemaining: LOCKOUT_CONFIG.maxAttempts - newAttempts,
    });

    return {
      locked: false,
      attemptsRemaining: LOCKOUT_CONFIG.maxAttempts - newAttempts,
    };
  } catch (error) {
    log.error('Failed to record failed login attempt', { error, email });
    // Don't throw - fail open to avoid blocking legitimate users
    return { locked: false };
  }
}

/**
 * Check if an account is currently locked
 */
export async function isAccountLocked(email: string): Promise<{
  locked: boolean;
  lockedUntil?: Date;
  minutesRemaining?: number;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        accountLockedUntil: true,
      },
    });

    if (!user || !user.accountLockedUntil) {
      return { locked: false };
    }

    const now = new Date();

    // Check if lockout has expired
    if (user.accountLockedUntil < now) {
      // Lockout expired - unlock account
      await prisma.user.update({
        where: { id: user.id },
        data: {
          accountLockedUntil: null,
          failedLoginAttempts: 0,
        },
      });

      logSecurity('account_unlocked_auto', 'low', {
        userId: user.id,
        email: user.email,
        reason: 'lockout_expired',
      });

      return { locked: false };
    }

    // Account is still locked
    const minutesRemaining = Math.ceil(
      (user.accountLockedUntil.getTime() - now.getTime()) / (60 * 1000)
    );

    return {
      locked: true,
      lockedUntil: user.accountLockedUntil,
      minutesRemaining,
    };
  } catch (error) {
    log.error('Failed to check account lockout status', { error, email });
    // Fail open - don't block if we can't check
    return { locked: false };
  }
}

/**
 * Reset failed login attempts after successful login
 */
export async function resetFailedAttempts(email: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        // Keep lockoutCount for progressive lockout
      },
    });

    logSecurity('login_attempts_reset', 'low', {
      userId: user.id,
      email,
      reason: 'successful_login',
    });
  } catch (error) {
    log.error('Failed to reset failed login attempts', { error, email });
  }
}

/**
 * Manually unlock an account (admin function)
 */
export async function unlockAccount(
  email: string,
  unlockedBy: string,
  reason?: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, accountLockedUntil: true },
    });

    if (!user) return false;

    if (!user.accountLockedUntil) {
      log.info('Attempted to unlock account that was not locked', { email });
      return false;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountLockedUntil: null,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
        lockoutCount: 0, // Reset lockout count on manual unlock
      },
    });

    logSecurity('account_unlocked_manual', 'medium', {
      userId: user.id,
      email,
      unlockedBy,
      reason: reason || 'manual_unlock',
    });

    log.info('Account manually unlocked', {
      email,
      unlockedBy,
      reason,
    });

    return true;
  } catch (error) {
    log.error('Failed to unlock account', { error, email });
    return false;
  }
}

/**
 * Get account lockout status for display purposes
 */
export async function getAccountLockoutInfo(email: string): Promise<{
  isLocked: boolean;
  failedAttempts: number;
  attemptsRemaining: number;
  lockedUntil?: Date;
  lockoutCount: number;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        failedLoginAttempts: true,
        accountLockedUntil: true,
        lockoutCount: true,
      },
    });

    if (!user) {
      return {
        isLocked: false,
        failedAttempts: 0,
        attemptsRemaining: LOCKOUT_CONFIG.maxAttempts,
        lockoutCount: 0,
      };
    }

    const now = new Date();
    const isLocked = user.accountLockedUntil ? user.accountLockedUntil > now : false;

    return {
      isLocked,
      failedAttempts: user.failedLoginAttempts || 0,
      attemptsRemaining: Math.max(0, LOCKOUT_CONFIG.maxAttempts - (user.failedLoginAttempts || 0)),
      lockedUntil: isLocked ? user.accountLockedUntil! : undefined,
      lockoutCount: user.lockoutCount || 0,
    };
  } catch (error) {
    log.error('Failed to get account lockout info', { error, email });
    return {
      isLocked: false,
      failedAttempts: 0,
      attemptsRemaining: LOCKOUT_CONFIG.maxAttempts,
      lockoutCount: 0,
    };
  }
}

/**
 * Configuration getters for frontend display
 */
export const getLockoutConfig = () => ({
  maxAttempts: LOCKOUT_CONFIG.maxAttempts,
  attemptWindowMinutes: LOCKOUT_CONFIG.attemptWindow,
  lockoutDurations: LOCKOUT_CONFIG.lockoutDurations,
});
