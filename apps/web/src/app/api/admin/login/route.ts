import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { logAdminAction, AdminActions } from '@/lib/security/admin-audit';

export const dynamic = 'force-dynamic';

interface AdminUser {
  username: string;
  password: string; // bcrypt hash — generate with: npx bcryptjs hash "yourpassword" 12
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

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';
}

function generateToken(user: AdminUser, ip: string): string {
  const timestamp = Date.now().toString();
  const payload = JSON.stringify({ username: user.username, role: user.role, name: user.name, ip });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = createHmac('sha256', ADMIN_SECRET!)
    .update(`${payloadB64}.${timestamp}`)
    .digest('base64url');
  return `${payloadB64}.${timestamp}.${signature}`;
}

function verifyToken(token: string, requestIp?: string): { username: string; role: string; name: string } | null {
  if (!ADMIN_SECRET) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [payloadB64, timestamp, signature] = parts;

  // Check expiry (8 hours — stricter than user sessions for admin security)
  const age = Date.now() - parseInt(timestamp, 10);
  if (isNaN(age) || age > 8 * 60 * 60 * 1000) return null;

  // Verify signature
  const expected = createHmac('sha256', ADMIN_SECRET!)
    .update(`${payloadB64}.${timestamp}`)
    .digest('base64url');
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    // Verify IP binding — token is only valid from the IP that created it
    if (requestIp && payload.ip && payload.ip !== requestIp) {
      return null;
    }

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

    // Find user by username first, then verify password with bcrypt
    const user = adminUsers.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logAdminAction({
        adminUsername: username || 'unknown',
        adminRole: 'unknown',
        action: AdminActions.LOGIN_FAILED,
        resource: 'auth',
        outcome: 'FAILURE',
        details: { reason: 'invalid_credentials' },
        request,
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    logAdminAction({
      adminUsername: user.username,
      adminRole: user.role,
      action: AdminActions.LOGIN,
      resource: 'auth',
      request,
    });

    const clientIp = getClientIp(request);
    const token = generateToken(user, clientIp);

    const response = NextResponse.json({
      success: true,
      admin: { username: user.username, name: user.name, role: user.role },
    });

    response.cookies.set('onekof-admin-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours (stricter for admin)
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
