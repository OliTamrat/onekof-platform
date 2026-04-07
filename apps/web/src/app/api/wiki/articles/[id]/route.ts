import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wiki/articles/[id]
 * Get a single article by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const article = await prisma.wikiArticle.findFirst({
      where: {
        id: params.id,
        organizationId: ctx.organizationId,
      },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.wikiArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(article);
  } catch (err) {
    logger.error('Failed to fetch wiki article', { error: err });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/wiki/articles/[id]
 * Update an article
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const existing = await prisma.wikiArticle.findFirst({
      where: { id: params.id, organizationId: ctx.organizationId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, categoryId, status: articleStatus, excerpt } = body;

    const updateData: any = { updatedBy: ctx.user.id };
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (articleStatus !== undefined) updateData.status = articleStatus;

    // Update slug if title changed
    if (title && title.trim() !== existing.title) {
      let slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slugConflict = await prisma.wikiArticle.findFirst({
        where: { organizationId: ctx.organizationId, slug, id: { not: params.id } },
      });
      if (slugConflict) slug = `${slug}-${Date.now().toString(36)}`;
      updateData.slug = slug;
    }

    const article = await prisma.wikiArticle.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    return NextResponse.json(article);
  } catch (err) {
    logger.error('Failed to update wiki article', { error: err });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/wiki/articles/[id]
 * Delete an article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const existing = await prisma.wikiArticle.findFirst({
      where: { id: params.id, organizationId: ctx.organizationId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    await prisma.wikiArticle.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Failed to delete wiki article', { error: err });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
