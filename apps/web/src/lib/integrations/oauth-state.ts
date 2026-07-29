/**
 * Signed OAuth state for integration connect flows.
 *
 * ## What was wrong
 *
 * The six OAuth callbacks (Slack, GitHub, Google, Google Calendar, Jira,
 * Microsoft Teams) each did this:
 *
 *     state = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
 *     await connectSlack(state.organizationId, state.userId, code);
 *
 * base64url is an *encoding*, not a signature. The organizationId in that blob
 * is attacker-controlled. An attacker authorises their own Slack workspace
 * against the app to obtain a genuine `code`, hands back a state naming the
 * victim's organization, and the callback connects the attacker's workspace to
 * the victim's tenant — after which that organization's task notifications are
 * delivered into the attacker's Slack.
 *
 * The routes DID generate a `nonce`. Nothing ever stored or checked it, so it
 * was decoration: it made the state look defended without defending it.
 *
 * The F2 audit missed this because it asked "does this route resolve the right
 * organization?" — and the connect routes do, correctly, via
 * resolveUserOrganization(). The organization is chosen correctly and then
 * handed to the client in a form the client can rewrite. Resolving correctly
 * and carrying safely are different questions.
 *
 * ## What this does
 *
 * HMAC-SHA256 over the exact payload bytes, with the same secret NextAuth uses.
 * The signature covers the encoded payload rather than a re-serialisation of
 * the parsed object, so key ordering and whitespace cannot change what was
 * verified versus what is used.
 *
 * State also carries an issue time and expires. An OAuth round trip is a
 * browser redirect and a form submission; ten minutes is generous. Without an
 * expiry a state captured from a browser history or a proxy log stays valid
 * forever, which turns a transient leak into a permanent one.
 *
 * Verification is not the whole check. The caller must ALSO confirm the user
 * named in the state is still a member of the organization named in it —
 * signing proves we minted this state, not that the grant is still current.
 * See requireStateMembership below.
 */

import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { prisma } from '@onekof/database';
import type { OAuthState } from './types';

/** Ten minutes. An OAuth round trip is a redirect, not a work session. */
const MAX_AGE_MS = 10 * 60 * 1000;

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!s) {
    // Deliberately fatal rather than falling back to a constant. A default
    // secret would make every signature forgeable by anyone who reads this
    // file, which is worse than not signing at all because it looks safe.
    throw new Error('NEXTAUTH_SECRET is required to sign OAuth state');
  }
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export interface OAuthStateInput {
  organizationId: string;
  userId: string;
  provider: OAuthState['provider'];
  redirectUrl: string;
}

/**
 * Mint a signed state parameter.
 *
 * `nonce` is kept — it makes two states minted in the same millisecond for the
 * same user differ, so the signature is not a stable value an observer can
 * recognise across attempts.
 */
export function signOAuthState(input: OAuthStateInput, now: number = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...input,
      nonce: randomBytes(16).toString('hex'),
      iat: now,
    })
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

export type OAuthStateFailure = 'malformed' | 'bad_signature' | 'expired';

export type OAuthStateResult =
  | { ok: true; state: OAuthState & { iat: number } }
  | { ok: false; reason: OAuthStateFailure };

/**
 * Verify and decode a state parameter.
 *
 * Returns a discriminated result rather than throwing, because every caller is
 * a redirect handler that has to turn the outcome into a user-facing URL.
 */
export function verifyOAuthState(
  stateParam: string | null | undefined,
  now: number = Date.now()
): OAuthStateResult {
  if (!stateParam) return { ok: false, reason: 'malformed' };

  const dot = stateParam.lastIndexOf('.');
  if (dot <= 0 || dot === stateParam.length - 1) {
    return { ok: false, reason: 'malformed' };
  }

  const payload = stateParam.slice(0, dot);
  const provided = stateParam.slice(dot + 1);

  const expected = sign(payload);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Length check first: timingSafeEqual throws on a length mismatch, and a
  // thrown error here would be an unhandled 500 on an attacker-controlled
  // input rather than a clean rejection.
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: 'bad_signature' };
  }

  let decoded: any;
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    // Signature valid but body unparseable means our own minting is broken,
    // not an attack. Still refuse — there is nothing safe to do with it.
    return { ok: false, reason: 'malformed' };
  }

  if (
    typeof decoded?.organizationId !== 'string' ||
    typeof decoded?.userId !== 'string' ||
    typeof decoded?.iat !== 'number'
  ) {
    return { ok: false, reason: 'malformed' };
  }

  if (now - decoded.iat > MAX_AGE_MS || decoded.iat > now + 60_000) {
    // Future-dated states are rejected too — a clock skew of more than a
    // minute between the minting and verifying instance means the expiry
    // window is not what it appears to be.
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, state: decoded };
}

/**
 * Confirm the user named in a verified state is STILL a member of the
 * organization named in it.
 *
 * The signature proves we minted the state. It does not prove the person is
 * still entitled to act: between the redirect out and the redirect back, they
 * may have been removed from the organization. Connecting an integration on
 * behalf of an organization someone has just been removed from is exactly the
 * window an offboarded employee would use.
 */
export async function stateMembershipValid(state: {
  organizationId: string;
  userId: string;
}): Promise<boolean> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: state.organizationId,
        userId: state.userId,
      },
    },
    select: { id: true },
  });
  return Boolean(membership);
}
