/**
 * Blind index for encrypted patient identifiers (M1/M2).
 *
 * The problem: `encryptField` uses a random IV, so encrypting the same
 * national ID twice produces different ciphertext. That is correct — it stops
 * an attacker with database access from spotting repeated values — but it also
 * means you cannot look a patient up by their identifier without decrypting
 * every row.
 *
 * The blind index solves that: a deterministic keyed hash of the *normalised*
 * identifier, stored alongside the ciphertext and indexed. Lookup hashes the
 * search term and matches on the hash. The plaintext is never stored and the
 * hash cannot be reversed without the key.
 *
 * Why HMAC and not a plain hash: a bare SHA-256 of a national ID is trivially
 * brute-forced — the identifier space is small and the format is public.
 * Keying it means an attacker who steals the database still cannot build a
 * rainbow table without also stealing the key.
 *
 * Deliberate limitation: a blind index leaks equality. Two patients with the
 * same identifier produce the same hash, which is exactly what makes lookup
 * work, and it means someone with database access can tell that two rows
 * refer to the same person even without knowing who. That is an accepted
 * trade-off for a registry that must deduplicate patients; it is recorded
 * here so nobody assumes the index is as opaque as the ciphertext.
 */

import { createHmac } from 'node:crypto';

/**
 * Normalise before hashing so trivial formatting differences do not create
 * duplicate patients. "ET-1234 5678" and "et12345678" are the same person.
 *
 * Only case and separators are normalised — nothing that could merge two
 * genuinely different identifiers.
 */
export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/[\s\-_/.]/g, '');
}

function getKey(): Buffer {
  // Separate key from the field-encryption key: if one is rotated or leaks,
  // the other is unaffected, and the index key must stay stable across
  // rotations of the encryption key or every lookup breaks.
  const secret = process.env.BLIND_INDEX_KEY;
  if (!secret || secret.length < 32) {
    throw new Error(
      'BLIND_INDEX_KEY must be set to at least 32 characters. ' +
      'Patient identifier lookup cannot be made safe without it.'
    );
  }
  return Buffer.from(secret, 'utf8');
}

/**
 * Deterministic, keyed hash of an identifier. Same input always yields the
 * same output, so it can be stored in a unique index and searched.
 */
export function blindIndex(value: string): string {
  const normalized = normalizeIdentifier(value);
  if (!normalized) {
    throw new Error('Cannot index an empty identifier');
  }
  return createHmac('sha256', getKey()).update(normalized).digest('hex');
}

/** True when a blind index key is configured — for startup checks. */
export function isBlindIndexConfigured(): boolean {
  const secret = process.env.BLIND_INDEX_KEY;
  return Boolean(secret && secret.length >= 32);
}
