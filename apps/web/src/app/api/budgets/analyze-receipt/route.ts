import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import Anthropic from '@anthropic-ai/sdk';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * POST /api/budgets/analyze-receipt
 * AI-powered receipt and expense document analysis
 * Extracts line items, amounts, vendors, dates from receipts/invoices
 */
export async function POST(request: NextRequest) {
  try {
    const { resolveUserOrganization } = await import('@/lib/api-organization');
    const { data: ctx, error: orgError } = await resolveUserOrganization();
    if (orgError || !ctx) return orgError!;

    const organizationId = ctx.organizationId;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const budgetId = formData.get('budgetId') as string | null;
    const analysisType = formData.get('analysisType') as string || 'receipt';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/csv',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload PDF, images, Word docs, or CSV.' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    const contentBlocks: Array<Record<string, unknown>> = [];

    if (file.type.startsWith('image/')) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
          data: base64,
        },
      });
    } else {
      contentBlocks.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: file.type === 'application/pdf' ? 'application/pdf' : 'application/pdf',
          data: base64,
        },
      });
    }

    const promptByType: Record<string, string> = {
      receipt: `Analyze this receipt/invoice and extract financial data in JSON format.

Extract:
{
  "documentType": "receipt" | "invoice" | "expense_report" | "purchase_order",
  "vendor": "string (company/store name)",
  "vendorAddress": "string (optional)",
  "vendorTaxId": "string (optional, TIN/VAT number)",
  "invoiceNumber": "string (optional)",
  "date": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD (optional, for invoices)",
  "currency": "ETB" | "USD" | "EUR" | "GBP",
  "subtotal": number,
  "tax": number,
  "taxRate": number (percentage, optional),
  "total": number,
  "paymentMethod": "string (optional: cash, bank transfer, check, etc.)",
  "lineItems": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "total": number,
      "category": "string (suggest: Personnel, Materials, Equipment, Travel, Services, Facilities, IT, Marketing, Training, Contingency)"
    }
  ],
  "suggestedCategory": "string (best-fit budget category for the overall expense)",
  "notes": "string (any special terms, payment conditions, or relevant notes)",
  "confidence": number (0-100)
}

GUIDELINES:
1. For Ethiopian receipts, look for "ብር", "Birr", "ETB" as currency indicators
2. Look for TIN (Tax Identification Number) or VAT registration
3. If handwritten, do your best to read amounts
4. Extract EVERY line item
5. Suggest the most appropriate budget category
6. Return ONLY valid JSON`,

      budget_document: `Analyze this budget document and extract structured data in JSON format.

Extract:
{
  "documentType": "budget_proposal" | "budget_report" | "financial_statement" | "allocation_letter",
  "title": "string",
  "organization": "string",
  "department": "string (optional)",
  "fiscalYear": "string",
  "period": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "currency": "ETB" | "USD",
  "totalBudget": number,
  "categories": [
    {
      "name": "string",
      "code": "string (accounting code, optional)",
      "allocated": number,
      "spent": number (if available),
      "description": "string (optional)"
    }
  ],
  "approvedBy": "string (optional)",
  "approvalDate": "YYYY-MM-DD (optional)",
  "summary": "string (2-3 sentence summary of the document)",
  "keyFindings": ["string (important observations)"],
  "confidence": number (0-100)
}

GUIDELINES:
1. Extract ALL budget categories/line items
2. For Ethiopian gov docs, look for "ወጪ በጀት" (expense budget), "Birr", "ETB"
3. Map to standard categories where possible
4. Note any conditional allocations or restrictions
5. Return ONLY valid JSON`,

      expense_report: `Analyze this expense report and extract all expenses in JSON format.

Extract:
{
  "documentType": "expense_report",
  "reportTitle": "string",
  "submittedBy": "string",
  "period": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "currency": "ETB" | "USD",
  "totalAmount": number,
  "expenses": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "category": "string",
      "vendor": "string (optional)",
      "amount": number,
      "hasReceipt": boolean,
      "notes": "string (optional)"
    }
  ],
  "summary": "string",
  "anomalies": ["string (any unusual patterns or potential issues)"],
  "confidence": number (0-100)
}

Return ONLY valid JSON`,
    };

    const prompt = promptByType[analysisType] || promptByType.receipt;
    contentBlocks.push({ type: 'text', text: prompt });

    const message = await anthropic.messages.create({
      model: process.env.AI_MODEL_ADVANCED || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: contentBlocks as any }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    let extractedData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(responseText);
      }
    } catch {
      return NextResponse.json(
        {
          error: 'Failed to extract data from document. Try a clearer image or PDF.',
        },
        { status: 422 }
      );
    }

    // If budgetId provided, fetch budget categories for matching
    let categoryMatches: Array<{ id: string; name: string; code: string | null }> = [];
    if (budgetId) {
      const categories = await prisma.budgetCategory.findMany({
        where: { budgetId },
        select: { id: true, name: true, code: true },
        orderBy: { order: 'asc' },
      });
      categoryMatches = categories;
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      availableCategories: categoryMatches,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        analysisType,
        processedAt: new Date().toISOString(),
        organizationId,
      },
    });
  } catch (error: any) {
    logger.error('Receipt analysis error', { error: error instanceof Error ? error.message : error });

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'AI service not configured. Contact your administrator.' },
        { status: 500 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    );
  }
}
