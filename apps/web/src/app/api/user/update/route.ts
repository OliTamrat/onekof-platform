import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/update
 * Returns the current user's editable profile fields + preferences.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        phone: true,
        timezone: true,
        language: true,
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    logger.error('Profile fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/user/update
 * Updates the current user's profile + preferences.
 * Accepts: name, email, bio, phone, timezone, language, avatar, preferences (JSON).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, bio, phone, timezone, language, avatar, preferences } = body;

    // Check if email is being changed to an existing one
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email is already in use by another account' },
          { status: 400 }
        );
      }
    }

    // Build update data — only include fields the client sent
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (language !== undefined) updateData.language = language;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Merge preferences JSON instead of replacing so partial updates work.
    // e.g. PATCH with { preferences: { emailOnMention: false } } only flips
    // that one flag without clobbering other preference keys.
    if (preferences !== undefined && typeof preferences === 'object') {
      const current = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { preferences: true },
      });
      const merged = {
        ...(current?.preferences as object || {}),
        ...preferences,
      };
      updateData.preferences = merged;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        phone: true,
        timezone: true,
        language: true,
        preferences: true,
      },
    });

    return NextResponse.json(
      { user: updatedUser, message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Profile update error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
