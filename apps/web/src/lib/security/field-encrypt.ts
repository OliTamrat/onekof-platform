/**
 * Field-level AES-256-GCM encryption for PII at rest.
 *
 * INSA / SOC-2 requirement: sensitive PII fields (phone, IP addresses)
 * must be encrypted before persisting to the database.
 *
 * Setup: generate a 32-byte key and store as FIELD_ENCRYPTION_KEY (hex, 64 chars):
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Encrypted value format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 *
 * Backward compatibility: decryptField() returns the value as-is when it
 * does NOT start with the "enc:v1:" prefix, so existing plaintext rows
 * continue to work after enabling encryption.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const PREFIX    = 'enc:v1:';
const IV_LENGTH = 16; // bytes

function getKey(): Buffer {
  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex) {
    // In development without the key, return a deterministic dummy key so the
    // app still starts. Encryption silently becomes a no-op passthrough.
    if (process.env.NODE_ENV !== 'production') {
      return Buffer.alloc(32, 0);
    }
    throw new Error('FIELD_ENCRYPTION_KEY is not set. Cannot encrypt PII in production.');
  }
  const key = Buffer.from(hex, 'hex');
  if (key.length !== 32) {
    throw new Error('FIELD_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).');
  }
  return key;
}

/**
 * Encrypt a plaintext string. Returns the encrypted token.
 * If FIELD_ENCRYPTION_KEY is not set in development, returns plaintext unchanged.
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getKey();
  // Zero key = dev passthrough
  if (key.every((b) => b === 0)) return plaintext;

  const iv      = randomBytes(IV_LENGTH);
  const cipher  = createCipheriv(ALGORITHM, key, iv);
  const ct      = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${ct.toString('hex')}`;
}

/**
 * Decrypt an encrypted token produced by encryptField().
 * Returns the original plaintext, or the value unchanged if:
 *  - it is not an encrypted token (backward compat with existing plaintext rows)
 *  - decryption fails (key rotation / data corruption — log and return raw)
 */
export function decryptField(value: string): string {
  if (!value || !value.startsWith(PREFIX)) return value;

  try {
    const key  = getKey();
    if (key.every((b) => b === 0)) return value; // dev passthrough

    const rest    = value.slice(PREFIX.length);
    const [ivHex, tagHex, ctHex] = rest.split(':');
    if (!ivHex || !tagHex || !ctHex) return value;

    const iv       = Buffer.from(ivHex,  'hex');
    const authTag  = Buffer.from(tagHex, 'hex');
    const ct       = Buffer.from(ctHex,  'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return decipher.update(ct).toString('utf8') + decipher.final('utf8');
  } catch {
    // Auth tag mismatch or corrupt data — return raw rather than crash
    console.error('[FieldEncrypt] Decryption failed — returning raw value');
    return value;
  }
}

/**
 * Returns true if the value is already encrypted by this library.
 */
export function isEncrypted(value: string): boolean {
  return value?.startsWith(PREFIX) ?? false;
}
