import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}));

describe('Email Module', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.RESEND_API_KEY;
  });

  describe('sendPasswordResetEmail (dev mode - no API key)', () => {
    it('logs to console instead of sending when no API key', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { sendPasswordResetEmail } = await import('@/lib/email');

      await sendPasswordResetEmail('user@test.com', 'https://example.com/reset?token=abc');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('PASSWORD RESET EMAIL')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('sendVerificationEmail (dev mode - no API key)', () => {
    it('logs to console instead of sending when no API key', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { sendVerificationEmail } = await import('@/lib/email');

      await sendVerificationEmail('user@test.com', 'https://example.com/verify?token=abc');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('EMAIL VERIFICATION')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('sendWelcomeEmail (dev mode - no API key)', () => {
    it('logs to console instead of sending when no API key', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { sendWelcomeEmail } = await import('@/lib/email');

      await sendWelcomeEmail('user@test.com', 'John');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('WELCOME EMAIL')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('sendAccountLockedEmail (dev mode - no API key)', () => {
    it('logs to console instead of sending when no API key', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { sendAccountLockedEmail } = await import('@/lib/email');

      const unlockTime = new Date(Date.now() + 15 * 60 * 1000);
      await sendAccountLockedEmail('user@test.com', unlockTime);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ACCOUNT LOCKED EMAIL')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('sendInvitationEmail (dev mode - no API key)', () => {
    it('logs to console instead of sending when no API key', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { sendInvitationEmail } = await import('@/lib/email');

      await sendInvitationEmail(
        'invitee@test.com',
        'John Doe',
        'Test Org',
        'https://example.com/accept?token=abc'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('INVITATION EMAIL')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('sendBudgetAlertEmail (dev mode - no API key)', () => {
    it('logs to console instead of sending when no API key', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { sendBudgetAlertEmail } = await import('@/lib/email');

      await sendBudgetAlertEmail(
        'user@test.com',
        'Highway Project',
        'FY2024 Budget',
        85,
        'https://example.com/budgets/123'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('BUDGET ALERT EMAIL')
      );
      consoleSpy.mockRestore();
    });
  });

  describe('email functions exist and are callable', () => {
    it('exports all required email functions', async () => {
      const emailModule = await import('@/lib/email');
      expect(typeof emailModule.sendPasswordResetEmail).toBe('function');
      expect(typeof emailModule.sendVerificationEmail).toBe('function');
      expect(typeof emailModule.sendWelcomeEmail).toBe('function');
      expect(typeof emailModule.sendAccountLockedEmail).toBe('function');
      expect(typeof emailModule.sendInvitationEmail).toBe('function');
      expect(typeof emailModule.sendBudgetAlertEmail).toBe('function');
    });
  });
});
