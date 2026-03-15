/**
 * Single Document API
 * Get detailed information about a specific document
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/documents/[id]
 * Get detailed document information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch document with all related data
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        extractedBudgetItems: {
          orderBy: { createdAt: 'desc' },
        },
        extractedMilestones: {
          orderBy: { createdAt: 'desc' },
        },
        aiProcessingResults: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify user has access to this document's organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          where: { organizationId: document.organizationId },
        },
      },
    });

    if (!user || !user.organizations.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      document: {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        fileUrl: document.fileUrl,
        thumbnailUrl: document.thumbnailUrl,
        status: document.status,
        processingError: document.processingError,
        uploadedAt: document.createdAt,
        processedAt: document.processedAt,

        // AI Results
        aiSummary: document.aiSummary,
        aiConfidence: document.aiConfidence,
        aiModel: document.aiModel,
        aiTokensUsed: document.aiTokensUsed,
        insights: document.aiInsights,
        extractedData: document.extractedData,

        // Extracted items
        budgetItems: document.extractedBudgetItems,
        milestones: document.extractedMilestones,
        processingHistory: document.aiProcessingResults,

        // Metadata
        projectId: document.projectId,
        budgetId: document.budgetId,
        uploadedBy: document.uploadedBy,
        tags: document.tags,
      },
    });
  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/documents/[id]
 * Update document (approve budget items, link to projects, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, budgetId, tags } = body;

    // Update document
    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        projectId: projectId !== undefined ? projectId : undefined,
        budgetId: budgetId !== undefined ? budgetId : undefined,
        tags: tags !== undefined ? tags : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Soft delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.document.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
