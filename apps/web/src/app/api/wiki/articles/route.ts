import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wiki/articles
 * List articles with optional filters
 *
 * Query params:
 * - categoryId: Filter by category
 * - status: Filter by status (default: published)
 * - search: Search title/content
 * - limit: Number of results (default: 50)
 * - offset: Pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const url = request.nextUrl;
    const categoryId = url.searchParams.get('categoryId');
    const status = url.searchParams.get('status') || 'published';
    const search = url.searchParams.get('search');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const where: any = {
      organizationId: ctx.organizationId,
    };

    if (status !== 'all') where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.wikiArticle.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.wikiArticle.count({ where }),
    ]);

    return NextResponse.json({ articles, total, limit, offset });
  } catch (err) {
    logger.error('Failed to fetch wiki articles', { error: err });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/wiki/articles
 * Create a new article
 */
export async function POST(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const body = await request.json();
    const { title, content, categoryId, status: articleStatus, excerpt } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate unique slug
    let slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await prisma.wikiArticle.findUnique({
      where: { organizationId_slug: { organizationId: ctx.organizationId, slug } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const article = await prisma.wikiArticle.create({
      data: {
        organizationId: ctx.organizationId,
        title: title.trim(),
        slug,
        content: content || '',
        excerpt: excerpt || null,
        categoryId: categoryId || null,
        status: articleStatus || 'draft',
        createdBy: ctx.user.id,
      },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    logger.error('Failed to create wiki article', { error: err });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
