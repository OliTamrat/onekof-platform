/**
 * Document Retry API
 * Re-triggers AI processing for a failed document
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveAuthUser } from '@/lib/api-organization';
import { prisma } from '@onekof/database';
import { processDocument, extractTextFromFile, checkAIQuota, recordAIUsage, AI_CONFIG } from '@/lib/ai/ai-service';
import { storage } from '@/lib/storage';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/documents/[id]/retry
 * Re-process a failed document with AI
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await resolveAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify user has access to this document's organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: document.organizationId,
          userId: authUser.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only allow retry on failed documents
    if (document.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'Only failed documents can be retried' },
        { status: 400 }
      );
    }

    // Check AI quota
    const quotaCheck = await checkAIQuota(document.organizationId, authUser.id);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: 'AI quota exceeded', limit: quotaCheck.limit, remaining: quotaCheck.remaining },
        { status: 429 }
      );
    }

    // Reset status to PROCESSING
    await prisma.document.update({
      where: { id: params.id },
      data: {
        status: 'PROCESSING',
        processingError: null,
      },
    });

    // Re-process asynchronously
    retryProcessing(document, authUser.id).catch((err) => {
      logger.error('Retry processing failed', { error: err instanceof Error ? err.message : err, documentId: params.id });
    });

    return NextResponse.json({
      success: true,
      message: 'Document processing has been restarted',
    });
  } catch (error) {
    logger.error('Document retry error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to retry document processing' },
      { status: 500 }
    );
  }
}

async function retryProcessing(document: any, userId: string) {
  try {
    let buffer: Buffer;

    if (document.fileUrl.startsWith('data:')) {
      const base64Data = document.fileUrl.split(',')[1];
      buffer = Buffer.from(base64Data, 'base64');
    } else if (document.fileUrl.startsWith('local-fs://')) {
      const fs = await import('fs/promises');
      const filePath = document.fileUrl.replace('local-fs://', '');
      buffer = await fs.readFile(filePath);
    } else {
      const response = await fetch(document.fileUrl);
      if (!response.ok) {
        throw new Error('Failed to retrieve file from storage');
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Extract text
    const extractedText = await extractTextFromFile(buffer, document.mimeType);

    // Process with AI
    const result = await processDocument(
      extractedText,
      document.fileType as any,
      document.fileName
    );

    // Update document with results
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        processingError: null,
        aiSummary: result.summary,
        aiInsights: result.insights,
        aiConfidence: result.insights.confidence,
        aiModel: AI_CONFIG.model,
        aiTokensUsed: result.tokensUsed.total,
        extractedData: result.extractedData,
      },
    });

    // Save processing record
    await prisma.documentAIProcessing.create({
      data: {
        documentId: document.id,
        processingType: 'EXTRACTION',
        prompt: `Retry process ${document.fileType} document: ${document.fileName}`,
        response: JSON.stringify(result),
        model: AI_CONFIG.model,
        tokensUsed: result.tokensUsed.total,
        cost: result.cost,
        latency: result.processingTime,
        results: result.extractedData,
        confidence: result.insights.confidence,
        processedBy: userId,
      },
    });

    // Track AI usage
    try {
      await recordAIUsage(document.organizationId, userId, result.tokensUsed.total, result.cost);
    } catch (quotaErr) {
      logger.warn('Failed to record AI usage on retry', { error: quotaErr });
    }

    logger.info('Document retry processing completed', { documentId: document.id });
  } catch (error) {
    logger.error('Retry AI processing error', { error: error instanceof Error ? error.message : error });

    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: 'FAILED',
        processingError: error instanceof Error ? error.message : 'Unknown error during retry',
      },
    });
  }
}
