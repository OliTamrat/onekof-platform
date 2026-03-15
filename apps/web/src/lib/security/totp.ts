import * as OTPAuth from 'otpauth';
import crypto from 'crypto';

const ISSUER = 'Onekof';
const ALGORITHM = 'SHA1';
const DIGITS = 6;
const PERIOD = 30;
const BACKUP_CODE_COUNT = 10;

/**
 * Generate a new TOTP secret and provisioning URI
 */
export function generateTOTPSecret(email: string): {
  secret: string;
  uri: string;
} {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD,
    secret: new OTPAuth.Secret({ size: 20 }),
  });

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

/**
 * Verify a TOTP code against a secret
 * Allows a window of +/- 1 period (30 seconds) for clock drift
 */
export function verifyTOTPCode(secret: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: ALGORITHM,
    digits: DIGITS,
    period: PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

/**
 * Generate backup codes for account recovery
 * Returns both plaintext codes (to show user once) and hashed codes (to store in DB)
 */
export function generateBackupCodes(): {
  plaintextCodes: string[];
  hashedCodes: string[];
} {
  const plaintextCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const formatted = `${code.slice(0, 4)}-${code.slice(4)}`;
    plaintextCodes.push(formatted);
    hashedCodes.push(hashBackupCode(formatted));
  }

  return { plaintextCodes, hashedCodes };
}

/**
 * Hash a backup code for storage
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.toUpperCase().replace(/-/g, '')).digest('hex');
}

/**
 * Verify a backup code against stored hashes
 * Returns the index of the matched code (-1 if not found)
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): number {
  const hash = hashBackupCode(code);
  return hashedCodes.findIndex(
    (stored) => crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(stored))
  );
}

/**
 * Encrypt a TOTP secret before storing in the database
 * Uses AES-256-GCM with a key derived from the app secret
 */
export function encryptSecret(secret: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a TOTP secret from the database
 */
export function decryptSecret(encryptedSecret: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encrypted] = encryptedSecret.split(':');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(ivHex, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET || process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-dev-key-change-in-production';
  return crypto.createHash('sha256').update(secret).digest();
}
