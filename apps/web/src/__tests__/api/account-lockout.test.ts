import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock prisma
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@onekof/database', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logSecurity: vi.fn(),
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendAccountLockedEmail: vi.fn().mockResolvedValue(undefined),
}));

import {
  recordFailedLogin,
  isAccountLocked,
  resetFailedAttempts,
  getLockoutConfig,
} from '@/lib/security/account-lockout';

describe('Account Lockout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({});
  });

  describe('recordFailedLogin', () => {
    it('returns locked: false when user not found', async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await recordFailedLogin('unknown@test.com');
      expect(result.locked).toBe(false);
    });

    it('increments failed attempts for existing user', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        failedLoginAttempts: 1,
        lastFailedLoginAt: new Date(),
        lockedUntil: null,
      });

      const result = await recordFailedLogin('test@test.com');

      expect(result.locked).toBe(false);
      expect(result.attemptsRemaining).toBe(3); // 5 max - 2 attempts
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            failedLoginAttempts: 2,
          }),
        })
      );
    });

    it('locks account after 5 failed attempts with correct initial duration', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        failedLoginAttempts: 4,
        lastFailedLoginAt: new Date(),
        lockedUntil: null,
      });

      const result = await recordFailedLogin('test@test.com');

      expect(result.locked).toBe(true);
      expect(result.lockedUntil).toBeDefined();

      // Verify lockout duration is 15 minutes (first tier)
      const lockoutMs = result.lockedUntil!.getTime() - Date.now();
      expect(lockoutMs).toBeGreaterThan(14 * 60 * 1000); // at least ~14 min
      expect(lockoutMs).toBeLessThanOrEqual(15 * 60 * 1000 + 1000); // at most ~15 min + buffer
    });

    it('escalates lockout duration on repeated lockouts (Math.min fix)', async () => {
      // Simulate 10th failed attempt (2nd lockout = index 1 = 30 minutes)
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        failedLoginAttempts: 9,
        lastFailedLoginAt: new Date(),
        lockedUntil: null,
      });

      const result = await recordFailedLogin('test@test.com');

      expect(result.locked).toBe(true);
      expect(result.lockedUntil).toBeDefined();

      // Verify lockout duration is 30 minutes (second tier, index 1)
      const lockoutMs = result.lockedUntil!.getTime() - Date.now();
      expect(lockoutMs).toBeGreaterThan(29 * 60 * 1000);
      expect(lockoutMs).toBeLessThanOrEqual(30 * 60 * 1000 + 1000);
    });

    it('escalates to third tier on 15th attempt', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        failedLoginAttempts: 14,
        lastFailedLoginAt: new Date(),
        lockedUntil: null,
      });

      const result = await recordFailedLogin('test@test.com');

      expect(result.locked).toBe(true);
      // 3rd lockout = index 2 = 60 minutes
      const lockoutMs = result.lockedUntil!.getTime() - Date.now();
      expect(lockoutMs).toBeGreaterThan(59 * 60 * 1000);
      expect(lockoutMs).toBeLessThanOrEqual(60 * 60 * 1000 + 1000);
    });

    it('caps lockout at maximum duration', async () => {
      // 25th attempt = 5th lockout = index 4 = 1440 min (24h), which is max
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        failedLoginAttempts: 24,
        lastFailedLoginAt: new Date(),
        lockedUntil: null,
      });

      const result = await recordFailedLogin('test@test.com');

      expect(result.locked).toBe(true);
      const lockoutMs = result.lockedUntil!.getTime() - Date.now();
      // Index clamped to max (4) = 1440 minutes = 24 hours
      expect(lockoutMs).toBeGreaterThan(1439 * 60 * 1000);
      expect(lockoutMs).toBeLessThanOrEqual(1440 * 60 * 1000 + 1000);
    });

    it('resets attempt count when outside attempt window', async () => {
      const oldDate = new Date(Date.now() - 31 * 60 * 1000); // 31 min ago, window is 30

      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        failedLoginAttempts: 4,
        lastFailedLoginAt: oldDate,
        lockedUntil: null,
      });

      const result = await recordFailedLogin('test@test.com');

      expect(result.locked).toBe(false);
      expect(result.attemptsRemaining).toBe(4); // Reset to 0 + 1 = 1 attempt, remaining = 4
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 1,
          }),
        })
      );
    });
  });

  describe('isAccountLocked', () => {
    it('returns locked: false when user not found', async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await isAccountLocked('unknown@test.com');
      expect(result.locked).toBe(false);
    });

    it('returns locked: false when no lockedUntil', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        lockedUntil: null,
      });
      const result = await isAccountLocked('test@test.com');
      expect(result.locked).toBe(false);
    });

    it('returns locked: true when lock is active', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        lockedUntil: futureDate,
      });

      const result = await isAccountLocked('test@test.com');

      expect(result.locked).toBe(true);
      expect(result.lockedUntil).toEqual(futureDate);
      expect(result.minutesRemaining).toBeGreaterThan(0);
      expect(result.minutesRemaining).toBeLessThanOrEqual(10);
    });

    it('clears expired lock and returns locked: false', async () => {
      const pastDate = new Date(Date.now() - 60 * 1000); // 1 min ago

      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        lockedUntil: pastDate,
      });

      const result = await isAccountLocked('test@test.com');

      expect(result.locked).toBe(false);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            lockedUntil: null,
            failedLoginAttempts: 0,
          },
        })
      );
    });

    it('fails CLOSED on database error (returns locked: true)', async () => {
      mockFindUnique.mockRejectedValue(new Error('DB connection failed'));

      const result = await isAccountLocked('test@test.com');

      expect(result.locked).toBe(true);
      expect(result.minutesRemaining).toBe(15); // First lockout duration
    });
  });

  describe('resetFailedAttempts', () => {
    it('resets attempts after successful login', async () => {
      mockFindUnique.mockResolvedValue({ id: 'user-1' });

      await resetFailedAttempts('test@test.com');

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            failedLoginAttempts: 0,
            lastFailedLoginAt: null,
          },
        })
      );
    });

    it('does nothing for unknown user', async () => {
      mockFindUnique.mockResolvedValue(null);

      await resetFailedAttempts('unknown@test.com');

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('getLockoutConfig', () => {
    it('returns expected configuration', () => {
      const config = getLockoutConfig();
      expect(config.maxAttempts).toBe(5);
      expect(config.attemptWindowMinutes).toBe(30);
      expect(config.lockoutDurations).toEqual([15, 30, 60, 240, 1440]);
    });
  });
});
