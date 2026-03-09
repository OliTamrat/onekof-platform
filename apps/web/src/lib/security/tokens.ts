import crypto from 'crypto';

/**
 * Security Utilities for Token Management
 *
 * CRITICAL: All tokens (password reset, email verification) MUST be hashed
 * before storage to prevent database breach attacks.
 */

/**
 * Generate a cryptographically secure random token
 * @returns {string} 64-character hex string
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token using SHA-256
 * Used for storing password reset tokens and verification tokens
 *
 * @param {string} token - The plaintext token to hash
 * @returns {string} SHA-256 hash of the token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a token against a stored hash
 *
 * @param {string} providedToken - The token provided by the user
 * @param {string} storedHash - The hash stored in the database
 * @returns {boolean} True if token matches hash
 */
export function verifyTokenHash(providedToken: string, storedHash: string): boolean {
  const providedHash = hashToken(providedToken);
  return crypto.timingSafeEqual(
    Buffer.from(providedHash),
    Buffer.from(storedHash)
  );
}

/**
 * Generate token and its hash
 * Use this for creating password reset or verification tokens
 *
 * @returns {{ token: string, hash: string }} Token and its hash
 */
export function generateTokenPair(): { token: string; hash: string } {
  const token = generateSecureToken();
  const hash = hashToken(token);
  return { token, hash };
}

/**
 * Check if a token has expired
 *
 * @param {Date | null} expiryDate - The expiry date from the database
 * @returns {boolean} True if token has expired or is null
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}

/**
 * Generate a token expiry date
 *
 * @param {number} hours - Number of hours until expiry (default: 1)
 * @returns {Date} Expiry date
 */
export function generateTokenExpiry(hours: number = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
