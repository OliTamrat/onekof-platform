/**
 * Documents API
 * Fetch and manage AI-processed documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';
import { parsePaginationParams, buildPaginatedResponse } from '@/lib/pagination';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/documents
 * Get all documents for the user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    // Get query parameters
    const url = request.nextUrl;
    const projectId = url.searchParams.get('projectId');
    const budgetId = url.searchParams.get('budgetId');
    const status = url.searchParams.get('status');
    const fileType = url.searchParams.get('fileType');
    const hasPagination = url.searchParams.has('page');

    const organizationId = ctx.organizationId;

    // Build where clause
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (projectId) where.projectId = projectId;
    if (budgetId) where.budgetId = budgetId;
    if (status) where.status = status;
    if (fileType) where.fileType = fileType;

    const includeClause = {
      extractedBudgetItems: {
        where: { status: 'PENDING' },
      },
      extractedMilestones: {
        where: { status: 'PENDING' },
      },
      aiProcessingResults: {
        orderBy: { createdAt: 'desc' } as const,
        take: 1,
      },
    };

    const orderByClause = { createdAt: 'desc' as const };

    const formatDocument = (doc: any) => ({
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      status: doc.status,
      uploadedAt: doc.createdAt,
      processedAt: doc.processedAt,

      // AI Results
      aiSummary: doc.aiSummary,
      aiConfidence: doc.aiConfidence,
      aiTokensUsed: doc.aiTokensUsed,

      // Insights
      insights: doc.aiInsights,
      extractedData: doc.extractedData,

      // Extracted items
      budgetItems: doc.extractedBudgetItems.length,
      milestones: doc.extractedMilestones.length,

      // Links
      projectId: doc.projectId,
      budgetId: doc.budgetId,
      tags: doc.tags,
    });

    if (hasPagination) {
      const { page, limit, skip } = parsePaginationParams(request);

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where,
          include: includeClause,
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        prisma.document.count({ where }),
      ]);

      const formattedDocuments = documents.map(formatDocument);
      return NextResponse.json(buildPaginatedResponse(formattedDocuments, total, { page, limit, skip }));
    }

    // Legacy response (backward compatible)
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const documents = await prisma.document.findMany({
      where,
      include: includeClause,
      orderBy: orderByClause,
      take: limit,
    });

    const formattedDocuments = documents.map(formatDocument);

    return NextResponse.json({
      documents: formattedDocuments,
      total: formattedDocuments.length,
    });
  } catch (error) {
    logger.error('Documents fetch error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
