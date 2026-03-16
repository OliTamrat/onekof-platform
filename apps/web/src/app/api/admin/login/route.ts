import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'onekof-admin-default-secret-change-me';

function generateToken(username: string): string {
  const timestamp = Date.now().toString();
  const raw = `${username}:${timestamp}:${ADMIN_SECRET}`;
  return createHash('sha256').update(raw).digest('hex') + '.' + timestamp;
}

export function validateToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [hash, timestamp] = parts;
  const age = Date.now() - parseInt(timestamp, 10);

  // Token expires after 24 hours
  if (age > 24 * 60 * 60 * 1000) return false;

  const expected = createHash('sha256').update(`${ADMIN_USERNAME}:${timestamp}:${ADMIN_SECRET}`).digest('hex');
  return hash === expected;
}

export async function POST(request: NextRequest) {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Admin credentials not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in environment variables.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(username);

    const response = NextResponse.json({ success: true });

    response.cookies.set('onekof-admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('onekof-admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
