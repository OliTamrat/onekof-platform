import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

interface AdminUser {
  username: string;
  password: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
  name: string;
}

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function getAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS || '';
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function generateToken(user: AdminUser): string {
  const timestamp = Date.now().toString();
  const payload = JSON.stringify({ username: user.username, role: user.role, name: user.name });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = createHmac('sha256', ADMIN_SECRET!)
    .update(`${payloadB64}.${timestamp}`)
    .digest('base64url');
  return `${payloadB64}.${timestamp}.${signature}`;
}

export function verifyToken(token: string): { username: string; role: string; name: string } | null {
  if (!ADMIN_SECRET) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [payloadB64, timestamp, signature] = parts;

  // Check expiry (24 hours)
  const age = Date.now() - parseInt(timestamp, 10);
  if (isNaN(age) || age > 24 * 60 * 60 * 1000) return null;

  // Verify signature
  const expected = createHmac('sha256', ADMIN_SECRET!)
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

export async function POST(request: NextRequest) {
  if (!ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Admin authentication not configured. Set ADMIN_SECRET in environment variables.' },
      { status: 503 }
    );
  }

  const rateLimitError = await checkRateLimit(request, 'login');
  if (rateLimitError) return rateLimitError;

  const adminUsers = getAdminUsers();

  if (adminUsers.length === 0) {
    return NextResponse.json(
      { error: 'Admin users not configured. Set ADMIN_USERS in environment variables.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = adminUsers.find(u => u.username === username && u.password === password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      success: true,
      admin: { username: user.username, name: user.name, role: user.role },
    });

    response.cookies.set('onekof-admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
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
