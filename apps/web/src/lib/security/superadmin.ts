import { cookies } from 'next/headers';
import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';

export type AdminRole = 'OWNER' | 'ADMIN' | 'VIEWER';

interface AdminIdentity {
  username: string;
  role: AdminRole;
  name: string;
}

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function verifyToken(token: string): AdminIdentity | null {
  if (!ADMIN_SECRET) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [payloadB64, timestamp, signature] = parts;

  const age = Date.now() - parseInt(timestamp, 10);
  if (isNaN(age) || age > 24 * 60 * 60 * 1000) return null;

  const expected = createHmac('sha256', ADMIN_SECRET)
    .update(`${payloadB64}.${timestamp}`)
    .digest('base64url');
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    return { username: payload.username, role: payload.role, name: payload.name };
  } catch {
    return null;
  }
}

export async function requireSuperAdmin(minimumRole: AdminRole = 'VIEWER') {
  const cookieStore = cookies();
  const token = cookieStore.get('onekof-admin-token')?.value;

  if (!token) {
    return {
      authorized: false,
      admin: null,
      error: NextResponse.json({ error: 'Unauthorized — admin login required' }, { status: 401 }),
    };
  }

  const admin = verifyToken(token);
  if (!admin) {
    return {
      authorized: false,
      admin: null,
      error: NextResponse.json({ error: 'Session expired — please log in again' }, { status: 401 }),
    };
  }

  const ROLE_LEVEL: Record<AdminRole, number> = { OWNER: 3, ADMIN: 2, VIEWER: 1 };
  if (ROLE_LEVEL[admin.role] < ROLE_LEVEL[minimumRole]) {
    return {
      authorized: false,
      admin,
      error: NextResponse.json(
        { error: `Insufficient permissions — ${minimumRole} role or higher required` },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, admin, error: null };
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('onekof-admin-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
