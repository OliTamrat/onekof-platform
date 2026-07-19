import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { storage } from '@/lib/storage';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `avatars/${session.user.id}/profile.${ext}`;

    const oldUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });
    if (oldUser?.avatar) {
      try { await storage.delete(oldUser.avatar); } catch {}
    }

    const result = await storage.put(path, file, { access: 'public' });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: result.url },
    });

    return NextResponse.json({ avatar: result.url });
  } catch (error) {
    logger.error('Avatar upload error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    if (user?.avatar) {
      try { await storage.delete(user.avatar); } catch {}
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
    });

    return NextResponse.json({ message: 'Avatar removed' });
  } catch (error) {
    logger.error('Avatar delete error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 });
  }
}
