import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { verifyTOTPCode, decryptSecret, verifyBackupCode } from '@/lib/security/totp';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { z } from 'zod';

const verifySchema = z.object({
  code: z.string().min(1, 'Code is required'),
  action: z.enum(['enable', 'login']).default('enable'),
});

/**
 * POST /api/auth/two-factor/verify
 * Verify a TOTP code to either:
 * - Enable 2FA (action: 'enable') — completes the setup process
 * - Verify during login (action: 'login') — validates the 2FA code
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimitError = await checkRateLimit(req, 'auth');
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = verifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { code, action } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Two-factor authentication has not been set up' },
        { status: 400 }
      );
    }

    const secret = decryptSecret(user.twoFactorSecret);

    // Try TOTP code first
    let isValid = verifyTOTPCode(secret, code);

    // If TOTP fails, try backup codes
    let usedBackupCodeIndex = -1;
    if (!isValid && code.includes('-')) {
      usedBackupCodeIndex = verifyBackupCode(code, user.twoFactorBackupCodes);
      isValid = usedBackupCodeIndex !== -1;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // If a backup code was used, remove it
    if (usedBackupCodeIndex !== -1) {
      const updatedCodes = [...user.twoFactorBackupCodes];
      updatedCodes.splice(usedBackupCodeIndex, 1);
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorBackupCodes: updatedCodes },
      });
    }

    // If enabling 2FA for the first time
    if (action === 'enable' && !user.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Two-factor authentication has been enabled successfully.',
      });
    }

    // Login verification
    return NextResponse.json({
      success: true,
      message: 'Two-factor verification successful.',
      backupCodesRemaining: usedBackupCodeIndex !== -1
        ? user.twoFactorBackupCodes.length - 1
        : undefined,
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify two-factor code' },
      { status: 500 }
    );
  }
}
