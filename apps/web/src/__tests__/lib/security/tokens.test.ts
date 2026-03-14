import { describe, it, expect } from 'vitest';
import {
  generateSecureToken,
  hashToken,
  verifyTokenHash,
  generateTokenPair,
  isTokenExpired,
  generateTokenExpiry,
} from '@/lib/security/tokens';

describe('Security Tokens', () => {
  describe('generateSecureToken', () => {
    it('generates a 64-character hex string', () => {
      const token = generateSecureToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('generates unique tokens on each call', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('hashToken', () => {
    it('returns a SHA-256 hash string', () => {
      const hash = hashToken('test-token');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('produces deterministic hashes', () => {
      const hash1 = hashToken('same-token');
      const hash2 = hashToken('same-token');
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different inputs', () => {
      const hash1 = hashToken('token-a');
      const hash2 = hashToken('token-b');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyTokenHash', () => {
    it('returns true for matching token and hash', () => {
      const token = 'my-secret-token';
      const hash = hashToken(token);
      expect(verifyTokenHash(token, hash)).toBe(true);
    });

    it('returns false for non-matching token', () => {
      const hash = hashToken('correct-token');
      expect(verifyTokenHash('wrong-token', hash)).toBe(false);
    });
  });

  describe('generateTokenPair', () => {
    it('returns a token and its corresponding hash', () => {
      const { token, hash } = generateTokenPair();
      expect(token).toHaveLength(64);
      expect(hash).toHaveLength(64);
      expect(verifyTokenHash(token, hash)).toBe(true);
    });
  });

  describe('isTokenExpired', () => {
    it('returns true for null expiry date', () => {
      expect(isTokenExpired(null)).toBe(true);
    });

    it('returns true for past expiry date', () => {
      const pastDate = new Date(Date.now() - 1000);
      expect(isTokenExpired(pastDate)).toBe(true);
    });

    it('returns false for future expiry date', () => {
      const futureDate = new Date(Date.now() + 60000);
      expect(isTokenExpired(futureDate)).toBe(false);
    });
  });

  describe('generateTokenExpiry', () => {
    it('defaults to 1 hour from now', () => {
      const before = Date.now();
      const expiry = generateTokenExpiry();
      const after = Date.now();

      const expectedMin = before + 60 * 60 * 1000;
      const expectedMax = after + 60 * 60 * 1000;

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMin);
      expect(expiry.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    it('accepts custom hours', () => {
      const before = Date.now();
      const expiry = generateTokenExpiry(24);
      const expected = before + 24 * 60 * 60 * 1000;

      expect(expiry.getTime()).toBeGreaterThanOrEqual(expected - 100);
      expect(expiry.getTime()).toBeLessThanOrEqual(expected + 100);
    });
  });
});
