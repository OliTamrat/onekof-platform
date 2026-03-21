import { prisma } from '@onekof/database';
import { logSecurity, log } from '@/lib/logger';
import { sendAccountLockedEmail } from '@/lib/email';

/**
 * Account Lockout Management
 *
 * Prevents brute force attacks by locking accounts after N failed login attempts.
 * Uses failedLoginAttempts and lockedUntil fields from the User model.
 */

const LOCKOUT_CONFIG = {
  maxAttempts: 5,
  lockoutDurations: [15, 30, 60, 240, 1440],
  attemptWindow: 30,
  resetLockoutAfterDays: 30,
};

/**
 * Record a failed login attempt for a user
 */
export async function recordFailedLogin(email: string): Promise<{
  locked: boolean;
  attemptsRemaining?: number;
  lockedUntil?: Date;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        lastFailedLoginAt: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return { locked: false };
    }

    const now = new Date();
    const windowMs = LOCKOUT_CONFIG.attemptWindow * 60 * 1000;
    const shouldResetAttempts = !user.lastFailedLoginAt ||
      (now.getTime() - user.lastFailedLoginAt.getTime() > windowMs);

    const currentAttempts = shouldResetAttempts ? 0 : (user.failedLoginAttempts || 0);
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= LOCKOUT_CONFIG.maxAttempts) {
      const lockoutCount = Math.floor(newAttempts / LOCKOUT_CONFIG.maxAttempts) - 1;
      const durationIndex = Math.min(Math.max(0, lockoutCount), LOCKOUT_CONFIG.lockoutDurations.length - 1);
      const lockoutMinutes = LOCKOUT_CONFIG.lockoutDurations[durationIndex];
      const lockedUntil = new Date(now.getTime() + lockoutMinutes * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lastFailedLoginAt: now,
          lockedUntil: lockedUntil,
        },
      });

      logSecurity('account_locked', 'high', {
        userId: user.id,
        email: user.email,
        attempts: newAttempts,
        lockedUntil: lockedUntil.toISOString(),
        lockoutMinutes,
      });

      log.warn('Account locked due to failed login attempts', {
        email: user.email,
        attempts: newAttempts,
        lockedUntil: lockedUntil.toISOString(),
      });

      try {
        await sendAccountLockedEmail(user.email, lockedUntil);
        log.info('Account locked notification email sent', { email: user.email });
      } catch (emailError) {
        log.error('Failed to send account locked email', {
          error: emailError,
          userId: user.id,
        });
      }

      return {
        locked: true,
        lockedUntil,
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        lastFailedLoginAt: now,
      },
    });

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
        lockedUntil: true,
      },
    });

    if (!user || !user.lockedUntil) {
      return { locked: false };
    }

    const now = new Date();

    if (user.lockedUntil < now) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: null,
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

    const minutesRemaining = Math.ceil(
      (user.lockedUntil.getTime() - now.getTime()) / (60 * 1000)
    );

    return {
      locked: true,
      lockedUntil: user.lockedUntil,
      minutesRemaining,
    };
  } catch (error) {
    log.error('Failed to check account lockout status', { error, email });
    return { locked: true, minutesRemaining: LOCKOUT_CONFIG.lockoutDurations[0] };
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
      select: { id: true, lockedUntil: true },
    });

    if (!user) return false;

    if (!user.lockedUntil) {
      log.info('Attempted to unlock account that was not locked', { email });
      return false;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
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
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return {
        isLocked: false,
        failedAttempts: 0,
        attemptsRemaining: LOCKOUT_CONFIG.maxAttempts,

      };
    }

    const now = new Date();
    const isLocked = user.lockedUntil ? user.lockedUntil > now : false;

    return {
      isLocked,
      failedAttempts: user.failedLoginAttempts || 0,
      attemptsRemaining: Math.max(0, LOCKOUT_CONFIG.maxAttempts - (user.failedLoginAttempts || 0)),
      lockedUntil: isLocked ? user.lockedUntil! : undefined,
    };
  } catch (error) {
    log.error('Failed to get account lockout info', { error, email });
    return {
      isLocked: false,
      failedAttempts: 0,
      attemptsRemaining: LOCKOUT_CONFIG.maxAttempts,
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
