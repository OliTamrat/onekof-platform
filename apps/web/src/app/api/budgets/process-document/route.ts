import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@onekof/database';
import Anthropic from '@anthropic-ai/sdk';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * POST /api/budgets/process-document
 * AI-powered budget document processing
 * Extracts budget data from uploaded government documents (PDF, Word, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, Word, or image files.' },
        { status: 400 }
      );
    }

    // Convert file to base64 for Claude API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Prepare media type for Claude
    const mediaType = file.type === 'application/pdf'
      ? 'application/pdf'
      : file.type.startsWith('image/')
      ? file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      : 'application/pdf'; // Default

    // Call Claude API to extract budget information
    const contentBlocks: Array<Record<string, unknown>> = [];

    // Use image block for image types, document block for PDFs
    if (file.type.startsWith('image/')) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64,
        },
      });
    } else {
      contentBlocks.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64,
        },
      });
    }

    contentBlocks.push({
      type: 'text',
      text: `Analyze this Ethiopian government budget document and extract budget information in JSON format.

Extract the following information:
{
  "projectName": "string",
  "totalBudget": number (in Ethiopian Birr),
  "fiscalYear": "string (e.g., '2026' or '2025-2026')",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "ministry": "string",
  "department": "string (optional)",
  "approvedBy": "string",
  "approvalDate": "YYYY-MM-DD",
  "categories": [
    {
      "name": "string",
      "code": "string (optional, government accounting code)",
      "allocatedAmount": number (in ETB),
      "description": "string (optional)"
    }
  ],
  "currency": "ETB",
  "confidence": number (0-100, how confident you are in the extraction)
}

IMPORTANT GUIDELINES:
1. Extract ALL budget categories you can find
2. For amounts, look for: "Birr", "ETB", "ብር", or numbers in tables
3. Common Ethiopian fiscal year is July 8 - July 7 (Ethiopian calendar)
4. If you see "budget allocation" or "ወጪ በጀት", that's the allocated amount
5. Look for ministerial approval signatures and dates
6. If unclear, use null for that field
7. Be thorough - extract every line item you can find

Return ONLY valid JSON, no explanations.`,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: contentBlocks as any,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response (Claude might wrap it in markdown)
    let extractedData;
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(responseText);
      }
    } catch (parseError) {
      logger.error('Failed to parse Claude response', { responseText });
      return NextResponse.json(
        {
          error: 'Failed to extract budget data from document',
        },
        { status: 422 }
      );
    }

    // Validate extracted data
    if (!extractedData.totalBudget || !extractedData.categories || extractedData.categories.length === 0) {
      return NextResponse.json(
        {
          error: 'Incomplete budget data extracted. Could not find budget amount or categories in the document.',
        },
        { status: 422 }
      );
    }

    // Return extracted data for user review
    return NextResponse.json({
      success: true,
      data: extractedData,
      message: 'Budget data extracted successfully. Please review and confirm.',
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        processedAt: new Date().toISOString(),
        model: 'claude-3-5-sonnet-20241022',
      },
    });
  } catch (error: any) {
    logger.error('Document processing error', { error: error instanceof Error ? error.message : error });

    // Handle specific Anthropic API errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'AI service authentication failed. Please check API key configuration.' },
        { status: 500 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to process document',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budgets/create-from-extraction
 * Create budget from AI-extracted data
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { projectId, extractedData, originalFileName } = body;

    if (!projectId || !extractedData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create budget from extracted data
    const budget = await prisma.budget.create({
      data: {
        projectId,
        totalBudget: extractedData.totalBudget,
        currency: extractedData.currency || 'ETB',
        fiscalYearStart: extractedData.startDate ? new Date(extractedData.startDate) : null,
        fiscalYearEnd: extractedData.endDate ? new Date(extractedData.endDate) : null,
        status: 'DRAFT', // User can review before activating
        createdBy: user.id,
        settings: {
          aiExtracted: true,
          originalFileName,
          extractedAt: new Date().toISOString(),
          confidence: extractedData.confidence,
        },
        visibilitySettings: {},
        categories: {
          create: extractedData.categories.map((cat: any, index: number) => ({
            name: cat.name,
            code: cat.code || null,
            description: cat.description || null,
            allocatedAmount: cat.allocatedAmount,
            currency: extractedData.currency || 'ETB',
            order: index,
          })),
        },
      },
      include: {
        categories: true,
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });

    return NextResponse.json({
      budget,
      message: 'Budget created successfully from AI extraction',
    }, { status: 201 });
  } catch (error) {
    logger.error('Budget creation from extraction error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
