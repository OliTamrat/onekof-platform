import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('@onekof/database', () => ({ prisma: {} }));

import { signOAuthState, verifyOAuthState } from '@/lib/integrations/oauth-state';

const SAVED = { ...process.env };
beforeEach(() => {
  process.env.NEXTAUTH_SECRET = 'test-secret-for-oauth-state-signing';
});
afterEach(() => {
  process.env = { ...SAVED };
});

const input = {
  organizationId: 'org-victim',
  userId: 'user-1',
  provider: 'slack' as const,
  redirectUrl: '/dashboard/settings/integrations',
};

describe('a state we minted round-trips', () => {
  it('verifies and returns what went in', () => {
    const result = verifyOAuthState(signOAuthState(input));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.organizationId).toBe('org-victim');
    expect(result.state.userId).toBe('user-1');
    expect(result.state.redirectUrl).toBe('/dashboard/settings/integrations');
  });

  it('differs between two mints for the same input', () => {
    // The nonce is what makes this true. Without it the signature would be a
    // stable value an observer could recognise across attempts.
    expect(signOAuthState(input)).not.toBe(signOAuthState(input));
  });
});

describe('the attack this exists to stop', () => {
  it('rejects a state whose organizationId was rewritten', () => {
    // Exactly the old exploit: take a legitimately-issued state, swap the
    // organization for the victim's, replay it at the callback with a genuine
    // OAuth code obtained from your own workspace.
    const signed = signOAuthState({ ...input, organizationId: 'org-attacker' });
    const [payload, sig] = signed.split('.');
    const body = JSON.parse(Buffer.from(payload, 'base64url').toString());
    body.organizationId = 'org-victim';
    const forged =
      Buffer.from(JSON.stringify(body)).toString('base64url') + '.' + sig;

    const result = verifyOAuthState(forged);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('bad_signature');
  });

  it('rejects a hand-rolled state with no signature at all', () => {
    // What every callback accepted before: bare base64url of a JSON object.
    const bare = Buffer.from(
      JSON.stringify({ ...input, nonce: 'x', iat: Date.now() })
    ).toString('base64url');
    expect(verifyOAuthState(bare).ok).toBe(false);
  });

  it('rejects a state signed with a different secret', () => {
    const signed = signOAuthState(input);
    process.env.NEXTAUTH_SECRET = 'a-different-secret-entirely';
    const result = verifyOAuthState(signed);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('bad_signature');
  });
});

describe('malformed input is refused, never thrown on', () => {
  // These all arrive straight from a query string, so an exception here would
  // be an unhandled 500 on attacker-controlled input.
  for (const bad of ['', 'nodot', '.onlysig', 'payload.', 'a.b.c.d', '....']) {
    it(`refuses ${JSON.stringify(bad)} without throwing`, () => {
      expect(() => verifyOAuthState(bad)).not.toThrow();
      expect(verifyOAuthState(bad).ok).toBe(false);
    });
  }

  it('refuses a missing state', () => {
    expect(verifyOAuthState(null).ok).toBe(false);
    expect(verifyOAuthState(undefined).ok).toBe(false);
  });

  it('refuses a signature of a different length without throwing', () => {
    // timingSafeEqual throws on a length mismatch, so the length check has to
    // come first. This is the case that would 500.
    const signed = signOAuthState(input);
    const [payload] = signed.split('.');
    expect(() => verifyOAuthState(`${payload}.short`)).not.toThrow();
    expect(verifyOAuthState(`${payload}.short`).ok).toBe(false);
  });
});

describe('state expires', () => {
  it('accepts a state within the window', () => {
    const now = 1_700_000_000_000;
    const signed = signOAuthState(input, now);
    expect(verifyOAuthState(signed, now + 9 * 60 * 1000).ok).toBe(true);
  });

  it('refuses one older than ten minutes', () => {
    // Without an expiry, a state captured from browser history or a proxy log
    // stays valid forever — a transient leak becomes a permanent one.
    const now = 1_700_000_000_000;
    const signed = signOAuthState(input, now);
    const result = verifyOAuthState(signed, now + 11 * 60 * 1000);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('expired');
  });

  it('refuses a future-dated state', () => {
    const now = 1_700_000_000_000;
    const signed = signOAuthState(input, now + 5 * 60 * 1000);
    expect(verifyOAuthState(signed, now).ok).toBe(false);
  });
});

describe('signing refuses to run without a secret', () => {
  it('throws rather than falling back to a constant', () => {
    // A default secret would make every signature forgeable by anyone who
    // reads the source — worse than not signing, because it looks safe.
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.JWT_SECRET;
    expect(() => signOAuthState(input)).toThrow(/NEXTAUTH_SECRET/);
  });
});

describe('no callback goes back to raw parsing', () => {
  const PROVIDERS = ['slack', 'github', 'google', 'google-calendar', 'jira', 'microsoft-teams'];

  for (const p of PROVIDERS) {
    it(`${p} verifies the signature and re-checks membership`, () => {
      const src = readFileSync(
        join(process.cwd(), `src/app/api/integrations/${p}/callback/route.ts`),
        'utf8'
      )
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');

      expect(src).toContain('verifyOAuthState(');
      expect(src).toContain('stateMembershipValid(');
      // The exact line that was the vulnerability.
      expect(src).not.toMatch(/JSON\.parse\(Buffer\.from\(stateParam/);
    });
  }

  for (const p of PROVIDERS) {
    it(`${p} mints a signed state rather than bare base64url`, () => {
      const src = readFileSync(
        join(process.cwd(), `src/app/api/integrations/${p}/route.ts`),
        'utf8'
      );
      expect(src).toContain('signOAuthState(');
      expect(src).not.toMatch(/Buffer\.from\(JSON\.stringify\(\{[\s\S]*?organizationId/);
    });
  }
});
