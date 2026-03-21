import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { generateTOTPSecret, encryptSecret, generateBackupCodes } from '@/lib/security/totp';
import { checkRateLimit } from '@/lib/security/rate-limit';
import QRCode from 'qrcode';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/two-factor/setup
 * Generate TOTP secret and QR code for 2FA setup
 * Returns the secret, QR code data URL, and backup codes
 * The user must verify with a code before 2FA is fully enabled
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimitError = await checkRateLimit(req, 'auth');
    if (rateLimitError) return rateLimitError;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      );
    }

    // Generate TOTP secret
    const { secret, uri } = generateTOTPSecret(user.email);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(uri, {
      width: 256,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // Generate backup codes
    const { plaintextCodes, hashedCodes } = generateBackupCodes();

    // Store encrypted secret temporarily (not yet enabled)
    // The secret is saved but 2FA remains disabled until verified
    const encryptedSecret = encryptSecret(secret);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorBackupCodes: hashedCodes,
      },
    });

    return NextResponse.json({
      secret: secret,
      qrCode: qrCodeDataUrl,
      backupCodes: plaintextCodes,
      message: 'Scan the QR code with your authenticator app, then verify with a code to enable 2FA.',
    });
  } catch (error) {
    logger.error('2FA setup error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to set up two-factor authentication' },
      { status: 500 }
    );
  }
}
