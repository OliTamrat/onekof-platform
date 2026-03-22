/**
 * Document Upload API
 * Handles file uploads and triggers AI processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { processDocument, extractTextFromFile, checkAIQuota, AI_CONFIG } from '@/lib/ai/ai-service';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Supported file types
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
];

// Determine document type from filename and content
function determineDocumentType(fileName: string, content: string): string {
  const lowerName = fileName.toLowerCase();
  const lowerContent = content.toLowerCase();

  if (lowerName.includes('invoice') || lowerContent.includes('invoice')) return 'invoice';
  if (lowerName.includes('receipt') || lowerContent.includes('receipt')) return 'receipt';
  if (lowerName.includes('contract') || lowerContent.includes('contract')) return 'contract';
  if (lowerName.includes('proposal') || lowerContent.includes('proposal')) return 'proposal';
  if (lowerName.includes('rfp') || lowerContent.includes('request for proposal')) return 'rfp';
  if (lowerName.includes('report') || lowerContent.includes('report')) return 'report';

  return 'other';
}

/**
 * POST /api/documents/upload
 * Upload and process a document with AI
 */
export async function POST(request: NextRequest) {
  try {
    // Resolve organization from subdomain
    const { resolveUserOrganization } = await import('@/lib/api-organization');
    const { data: ctx, error: orgError } = await resolveUserOrganization();
    if (orgError || !ctx) return orgError!;

    // Get full organization record for AI quota check
    const organization = await prisma.organization.findUniqueOrThrow({
      where: { id: ctx.organizationId },
    });
    const user = { id: ctx.user.id, email: ctx.user.email };

    // Check AI quota
    const quotaCheck = await checkAIQuota(organization.id, user.id);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: 'AI quota exceeded',
          limit: quotaCheck.limit,
          remaining: quotaCheck.remaining,
        },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string | null;
    const budgetId = formData.get('budgetId') as string | null;
    const tags = formData.get('tags') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Unsupported file type',
          supportedTypes: SUPPORTED_MIME_TYPES,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For MVP: Store file content in database (in production, use Supabase Storage)
    // In production, upload to Supabase Storage and get URL
    const fileUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Extract text from file
    let extractedText: string;
    try {
      extractedText = await extractTextFromFile(buffer, file.type);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to extract text from file' },
        { status: 500 }
      );
    }

    // Determine document type
    const documentType = determineDocumentType(file.name, extractedText);

    // Create document record
    const document = await prisma.document.create({
      data: {
        organizationId: organization.id,
        projectId: projectId || undefined,
        budgetId: budgetId || undefined,
        fileName: file.name,
        fileType: documentType,
        mimeType: file.type,
        fileSize: file.size,
        fileUrl,
        status: 'PROCESSING',
        uploadedBy: user.id,
        tags: tags ? JSON.parse(tags) : [],
      },
    });

    // Process document with AI (async, don't wait)
    processDocumentAsync(document.id, extractedText, documentType, file.name, user.id);

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        status: document.status,
        createdAt: document.createdAt,
      },
      message: 'Document uploaded successfully. AI processing in progress...',
    });
  } catch (error) {
    logger.error('Document upload error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

/**
 * Process document asynchronously with AI
 */
async function processDocumentAsync(
  documentId: string,
  content: string,
  documentType: string,
  fileName: string,
  userId: string
) {
  try {
    // Process with AI
    const result = await processDocument(
      content,
      documentType as any,
      fileName
    );

    // Update document with AI results
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        aiSummary: result.summary,
        aiInsights: result.insights,
        aiConfidence: result.insights.confidence,
        aiModel: AI_CONFIG.model,
        aiTokensUsed: result.tokensUsed.total,
        extractedData: result.extractedData,
      },
    });

    // Save detailed processing record
    await prisma.documentAIProcessing.create({
      data: {
        documentId,
        processingType: 'EXTRACTION',
        prompt: `Process ${documentType} document: ${fileName}`,
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

    // Extract budget items if it's an invoice/receipt
    if (documentType === 'invoice' || documentType === 'receipt') {
      await extractBudgetItems(documentId, result.extractedData, userId);
    }

    // Extract milestones if it's a contract/proposal
    if (documentType === 'contract' || documentType === 'proposal' || documentType === 'rfp') {
      await extractMilestones(documentId, result.extractedData, userId);
    }

    logger.info('Document processed successfully', { documentId });
  } catch (error) {
    logger.error('AI processing error', { error: error instanceof Error ? error.message : error });

    // Update document status to FAILED
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        processingError: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

/**
 * Extract and save budget items from document
 */
async function extractBudgetItems(
  documentId: string,
  extractedData: any,
  userId: string
) {
  try {
    if (!extractedData.lineItems || !Array.isArray(extractedData.lineItems)) {
      // Single item invoice/receipt
      await prisma.documentBudgetItem.create({
        data: {
          documentId,
          description: extractedData.description || 'Extracted expense',
          amount: extractedData.totalAmount || 0,
          currency: extractedData.currency || 'ETB',
          vendor: extractedData.vendor,
          invoiceNumber: extractedData.invoiceNumber,
          invoiceDate: extractedData.invoiceDate
            ? new Date(extractedData.invoiceDate)
            : undefined,
          dueDate: extractedData.dueDate ? new Date(extractedData.dueDate) : undefined,
          confidence: 0.85,
          extractedFields: extractedData,
          status: 'PENDING',
          createdBy: userId,
        },
      });
      return;
    }

    // Multiple line items
    for (const item of extractedData.lineItems) {
      await prisma.documentBudgetItem.create({
        data: {
          documentId,
          description: item.description,
          amount: item.total,
          currency: extractedData.currency || 'ETB',
          category: item.category,
          vendor: extractedData.vendor,
          invoiceNumber: extractedData.invoiceNumber,
          invoiceDate: extractedData.invoiceDate
            ? new Date(extractedData.invoiceDate)
            : undefined,
          dueDate: extractedData.dueDate ? new Date(extractedData.dueDate) : undefined,
          confidence: 0.85,
          extractedFields: item,
          status: 'PENDING',
          createdBy: userId,
        },
      });
    }
  } catch (error) {
    logger.error('Error extracting budget items', { error: error instanceof Error ? error.message : error });
  }
}

/**
 * Extract and save milestones from document
 */
async function extractMilestones(
  documentId: string,
  extractedData: any,
  userId: string
) {
  try {
    if (!extractedData.milestones || !Array.isArray(extractedData.milestones)) {
      return;
    }

    for (const milestone of extractedData.milestones) {
      await prisma.documentMilestone.create({
        data: {
          documentId,
          title: milestone.name || milestone.title,
          description: milestone.description,
          startDate: milestone.startDate ? new Date(milestone.startDate) : undefined,
          endDate: milestone.dueDate || milestone.endDate
            ? new Date(milestone.dueDate || milestone.endDate)
            : undefined,
          deliverable: milestone.deliverable,
          budget: milestone.budget || milestone.amount,
          confidence: 0.85,
          extractedFields: milestone,
          status: 'PENDING',
          createdBy: userId,
        },
      });
    }
  } catch (error) {
    logger.error('Error extracting milestones', { error: error instanceof Error ? error.message : error });
  }
}
