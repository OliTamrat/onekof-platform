import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  blindIndex,
  normalizeIdentifier,
  isBlindIndexConfigured,
} from '@/lib/security/blind-index';

const KEY = 'test-blind-index-key-at-least-32-chars-long';
const SAVED = process.env.BLIND_INDEX_KEY;

beforeEach(() => {
  process.env.BLIND_INDEX_KEY = KEY;
});
afterEach(() => {
  if (SAVED === undefined) delete process.env.BLIND_INDEX_KEY;
  else process.env.BLIND_INDEX_KEY = SAVED;
});

describe('identifier normalisation', () => {
  it('treats formatting differences as the same person', () => {
    // A clerk typing "ET-1234 5678" and another typing "et12345678" must not
    // create two patients.
    const forms = ['ET-1234 5678', 'et12345678', ' ET.1234/5678 ', 'ET_1234-5678'];
    const normalized = forms.map(normalizeIdentifier);
    expect(new Set(normalized).size).toBe(1);
  });

  it('does not merge genuinely different identifiers', () => {
    expect(normalizeIdentifier('ET12345678')).not.toBe(normalizeIdentifier('ET12345679'));
    expect(normalizeIdentifier('AB1234')).not.toBe(normalizeIdentifier('BA1234'));
  });

  it('strips only separators, never digits or letters', () => {
    expect(normalizeIdentifier('ET-123')).toBe('et123');
    expect(normalizeIdentifier('0012')).toBe('0012');
  });
});

describe('blind index', () => {
  it('is deterministic — the same identifier always indexes the same', () => {
    expect(blindIndex('ET12345678')).toBe(blindIndex('ET12345678'));
  });

  it('matches across formatting variants, which is the point of the index', () => {
    expect(blindIndex('ET-1234 5678')).toBe(blindIndex('et12345678'));
  });

  it('differs for different identifiers', () => {
    expect(blindIndex('ET12345678')).not.toBe(blindIndex('ET12345679'));
  });

  it('does not contain the plaintext', () => {
    const id = 'ET12345678';
    const hash = blindIndex(id);
    expect(hash).not.toContain(id);
    expect(hash).not.toContain(id.toLowerCase());
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('changes completely when the key changes', () => {
    const withFirst = blindIndex('ET12345678');
    process.env.BLIND_INDEX_KEY = 'a-different-key-also-at-least-32-characters';
    expect(blindIndex('ET12345678')).not.toBe(withFirst);
  });

  it('refuses to run without a key rather than falling back to an unkeyed hash', () => {
    // An unkeyed hash of a national ID is trivially brute-forced. Failing
    // loudly is the only safe behaviour.
    delete process.env.BLIND_INDEX_KEY;
    expect(() => blindIndex('ET12345678')).toThrow(/BLIND_INDEX_KEY/);
  });

  it('refuses a short key', () => {
    process.env.BLIND_INDEX_KEY = 'too-short';
    expect(() => blindIndex('ET12345678')).toThrow(/BLIND_INDEX_KEY/);
  });

  it('rejects an empty identifier', () => {
    expect(() => blindIndex('   ')).toThrow(/empty/i);
  });
});

describe('configuration check', () => {
  it('reports whether a usable key is present', () => {
    expect(isBlindIndexConfigured()).toBe(true);
    process.env.BLIND_INDEX_KEY = 'short';
    expect(isBlindIndexConfigured()).toBe(false);
    delete process.env.BLIND_INDEX_KEY;
    expect(isBlindIndexConfigured()).toBe(false);
  });
});
