import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wiki/categories
 * List all wiki categories for the organization
 */
export async function GET() {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const categories = await prisma.wikiCategory.findMany({
      where: { organizationId: ctx.organizationId },
      include: {
        articles: {
          where: { status: 'published' },
          select: { id: true, title: true, slug: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        },
        _count: { select: { articles: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (err) {
    logger.error('Failed to fetch wiki categories', { error: err });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/wiki/categories
 * Create a new wiki category
 */
export async function POST(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const body = await request.json();
    const { name, description, icon, color } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const existing = await prisma.wikiCategory.findUnique({
      where: { organizationId_slug: { organizationId: ctx.organizationId, slug } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }

    const maxOrder = await prisma.wikiCategory.aggregate({
      where: { organizationId: ctx.organizationId },
      _max: { sortOrder: true },
    });

    const category = await prisma.wikiCategory.create({
      data: {
        organizationId: ctx.organizationId,
        name: name.trim(),
        slug,
        description: description || null,
        icon: icon || 'BookOpen',
        color: color || '#3B82F6',
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        createdBy: ctx.user.id,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    logger.error('Failed to create wiki category', { error: err });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
