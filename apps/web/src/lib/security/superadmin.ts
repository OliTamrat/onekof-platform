import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'onekof-admin-default-secret-change-me';

function validateAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [hash, timestamp] = parts;
  const age = Date.now() - parseInt(timestamp, 10);

  if (age > 24 * 60 * 60 * 1000) return false;

  const expected = createHash('sha256').update(`${ADMIN_USERNAME}:${timestamp}:${ADMIN_SECRET}`).digest('hex');
  return hash === expected;
}

export async function requireSuperAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('onekof-admin-token')?.value;

  if (!token || !validateAdminToken(token)) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Unauthorized — admin access required' }, { status: 403 }),
    };
  }

  return { authorized: true, error: null };
}
