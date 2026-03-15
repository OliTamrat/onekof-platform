/**
 * Password Security Utilities
 * Implements OWASP password guidelines and security best practices
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number; // 0-100
}

/**
 * Validates password against security requirements
 * Based on OWASP recommendations
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Minimum length: 12 characters (OWASP recommendation)
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  } else {
    score += 25;
    if (password.length >= 16) score += 10; // Bonus for longer passwords
    if (password.length >= 20) score += 10; // Extra bonus
  }

  // Must contain lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 15;
  }

  // Must contain uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 15;
  }

  // Must contain number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  // Must contain special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  } else {
    score += 15;
  }

  // Check for common passwords (basic check)
  const commonPasswords = [
    'password', '123456', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common patterns and is too weak');
    score = Math.min(score, 30); // Cap score if common pattern found
  }

  // Check for sequential characters (123, abc, etc.)
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Password contains sequential characters (abc, 123, etc.)');
    score -= 10;
  }

  // Bonus points for variety
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 10) score += 5;

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'fair';
  else if (score < 80) strength = 'good';
  else strength = 'strong';

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score: Math.min(100, Math.max(0, score))
  };
}

/**
 * Hash password with bcrypt
 * Uses 12 salt rounds (OWASP recommendation)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcrypt');
  const SALT_ROUNDS = 12; // OWASP recommends 10-12
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 * For password reset, email verification, etc.
 */
export function generateSecureToken(length: number = 32): string {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for storage (one-way)
 * Tokens should be hashed before storing in database
 */
export async function hashToken(token: string): Promise<string> {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Check if account is locked due to failed login attempts
 */
export function isAccountLocked(
  failedAttempts: number,
  lastFailedAt: Date | null,
  lockedUntil: Date | null
): { locked: boolean; remainingTime?: number } {
  // Lock account after 5 failed attempts
  if (failedAttempts >= 5) {
    const lockDuration = getLockDuration(failedAttempts);
    const lockUntil = lockedUntil || (lastFailedAt ? new Date(lastFailedAt.getTime() + lockDuration) : null);

    if (lockUntil && lockUntil > new Date()) {
      return {
        locked: true,
        remainingTime: Math.ceil((lockUntil.getTime() - Date.now()) / 1000)
      };
    }
  }

  return { locked: false };
}

/**
 * Calculate lock duration based on number of failed attempts
 * Exponential backoff: 5 attempts = 5 min, 10 = 30 min, 15+ = 1 hour
 */
function getLockDuration(failedAttempts: number): number {
  if (failedAttempts <= 5) return 5 * 60 * 1000; // 5 minutes
  if (failedAttempts <= 10) return 30 * 60 * 1000; // 30 minutes
  return 60 * 60 * 1000; // 1 hour
}

/**
 * Password strength indicator for UI
 */
export function getPasswordStrengthIndicator(password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
  label: string;
  percentage: number;
} {
  const result = validatePassword(password);

  const indicators = {
    weak: { color: '#EF4444', label: 'Weak', percentage: 25 },
    fair: { color: '#F59E0B', label: 'Fair', percentage: 50 },
    good: { color: '#3B82F6', label: 'Good', percentage: 75 },
    strong: { color: '#10B981', label: 'Strong', percentage: 100 },
  };

  return {
    strength: result.strength,
    ...indicators[result.strength]
  };
}
