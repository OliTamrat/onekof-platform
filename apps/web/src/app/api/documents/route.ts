/**
 * Documents API
 * Fetch and manage AI-processed documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { resolveUserOrganization } from '@/lib/api-organization';

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
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const budgetId = searchParams.get('budgetId');
    const status = searchParams.get('status');
    const fileType = searchParams.get('fileType');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Fetch documents
    const documents = await prisma.document.findMany({
      where,
      include: {
        extractedBudgetItems: {
          where: { status: 'PENDING' },
        },
        extractedMilestones: {
          where: { status: 'PENDING' },
        },
        aiProcessingResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Format response
    const formattedDocuments = documents.map((doc) => ({
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
    }));

    return NextResponse.json({
      documents: formattedDocuments,
      total: formattedDocuments.length,
    });
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
