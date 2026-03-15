import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment before imports
vi.stubEnv('NEXTAUTH_SECRET', 'test-secret-for-encryption-32chars!');

import {
  generateTOTPSecret,
  verifyTOTPCode,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  encryptSecret,
  decryptSecret,
} from '@/lib/security/totp';

describe('TOTP Utilities', () => {
  describe('generateTOTPSecret', () => {
    it('generates a secret and URI for the given email', () => {
      const result = generateTOTPSecret('user@example.com');
      expect(result.secret).toBeDefined();
      expect(result.secret.length).toBeGreaterThan(0);
      expect(result.uri).toContain('otpauth://totp/');
      expect(result.uri).toContain('user%40example.com');
      expect(result.uri).toContain('Onekof');
    });

    it('generates unique secrets for different calls', () => {
      const result1 = generateTOTPSecret('user1@example.com');
      const result2 = generateTOTPSecret('user2@example.com');
      expect(result1.secret).not.toBe(result2.secret);
    });
  });

  describe('verifyTOTPCode', () => {
    it('verifies a valid TOTP code', () => {
      // Generate a secret and then verify using the same library
      const OTPAuth = require('otpauth');
      const secret = new OTPAuth.Secret({ size: 20 });
      const totp = new OTPAuth.TOTP({
        issuer: 'Onekof',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret,
      });

      const validCode = totp.generate();
      expect(verifyTOTPCode(secret.base32, validCode)).toBe(true);
    });

    it('rejects an invalid TOTP code', () => {
      const { secret } = generateTOTPSecret('test@example.com');
      expect(verifyTOTPCode(secret, '000000')).toBe(false);
    });
  });

  describe('generateBackupCodes', () => {
    it('generates 10 backup codes by default', () => {
      const { plaintextCodes, hashedCodes } = generateBackupCodes();
      expect(plaintextCodes).toHaveLength(10);
      expect(hashedCodes).toHaveLength(10);
    });

    it('generates codes in XXXX-XXXX format', () => {
      const { plaintextCodes } = generateBackupCodes();
      for (const code of plaintextCodes) {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
      }
    });

    it('generates unique codes', () => {
      const { plaintextCodes } = generateBackupCodes();
      const uniqueCodes = new Set(plaintextCodes);
      expect(uniqueCodes.size).toBe(plaintextCodes.length);
    });

    it('hashed codes correspond to plaintext codes', () => {
      const { plaintextCodes, hashedCodes } = generateBackupCodes();
      for (let i = 0; i < plaintextCodes.length; i++) {
        expect(hashBackupCode(plaintextCodes[i])).toBe(hashedCodes[i]);
      }
    });
  });

  describe('hashBackupCode', () => {
    it('produces deterministic hashes', () => {
      const hash1 = hashBackupCode('ABCD-1234');
      const hash2 = hashBackupCode('ABCD-1234');
      expect(hash1).toBe(hash2);
    });

    it('normalizes input (removes dashes, uppercases)', () => {
      const hash1 = hashBackupCode('abcd-1234');
      const hash2 = hashBackupCode('ABCD1234');
      expect(hash1).toBe(hash2);
    });
  });

  describe('verifyBackupCode', () => {
    it('returns index of matching backup code', () => {
      const { plaintextCodes, hashedCodes } = generateBackupCodes();
      const index = verifyBackupCode(plaintextCodes[3], hashedCodes);
      expect(index).toBe(3);
    });

    it('returns -1 for non-matching code', () => {
      const { hashedCodes } = generateBackupCodes();
      const index = verifyBackupCode('ZZZZ-ZZZZ', hashedCodes);
      expect(index).toBe(-1);
    });
  });

  describe('encryptSecret / decryptSecret', () => {
    it('encrypts and decrypts a secret correctly', () => {
      const original = 'JBSWY3DPEHPK3PXP';
      const encrypted = encryptSecret(original);
      expect(encrypted).not.toBe(original);
      expect(encrypted).toContain(':');

      const decrypted = decryptSecret(encrypted);
      expect(decrypted).toBe(original);
    });

    it('produces different ciphertexts for same input (different IV)', () => {
      const secret = 'TESTBASE32SECRET';
      const encrypted1 = encryptSecret(secret);
      const encrypted2 = encryptSecret(secret);
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(decryptSecret(encrypted1)).toBe(secret);
      expect(decryptSecret(encrypted2)).toBe(secret);
    });
  });
});
