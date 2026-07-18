/**
 * AI Document Processing Service
 * Anthropic Haiku integration for document processing
 * Cost-effective, fast AI processing for invoices, contracts, proposals, etc.
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Model configuration
export const AI_CONFIG = {
  model: process.env.AI_MODEL || 'claude-3-haiku-20240307',
  maxTokens: 4096,
  temperature: 0.2, // Lower temperature for consistent, factual extraction
  costs: {
    inputPer1M: 0.25, // $0.25 per 1M input tokens
    outputPer1M: 1.25, // $1.25 per 1M output tokens
  },
};

// Document types we support
export type DocumentType =
  | 'invoice'
  | 'receipt'
  | 'contract'
  | 'proposal'
  | 'rfp'
  | 'report'
  | 'other';

// Processing result interface
export interface AIProcessingResult {
  summary: string;
  insights: {
    keyFindings: string[];
    risks: string[];
    recommendations: string[];
    confidence: number;
  };
  extractedData: any;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  processingTime: number;
}

/**
 * Process a document with AI
 */
export async function processDocument(
  documentContent: string,
  documentType: DocumentType,
  fileName: string
): Promise<AIProcessingResult> {
  const startTime = Date.now();

  try {
    // Build context-aware prompt based on document type
    const prompt = buildPrompt(documentContent, documentType, fileName);

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract response content
    const content = response.content[0];
    const responseText = content.type === 'text' ? content.text : '';

    // Parse structured response
    const parsedResult = parseAIResponse(responseText, documentType);

    // Calculate costs
    const tokensUsed = {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
      total: response.usage.input_tokens + response.usage.output_tokens,
    };

    const cost = calculateCost(tokensUsed.input, tokensUsed.output);
    const processingTime = Date.now() - startTime;

    return {
      summary: parsedResult.summary,
      insights: parsedResult.insights,
      extractedData: parsedResult.extractedData,
      tokensUsed,
      cost,
      processingTime,
    };
  } catch (error) {
    console.error('AI processing error:', error);
    throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build context-aware prompt based on document type
 */
function buildPrompt(content: string, type: DocumentType, fileName: string): string {
  const basePrompt = `You are an expert financial and project management analyst. Analyze the following document with extreme attention to detail.

Document Name: ${fileName}
Document Type: ${type.toUpperCase()}

CRITICAL INSTRUCTIONS:
1. READ THE ENTIRE DOCUMENT CAREFULLY - extract what is ACTUALLY written in the document
2. Create a summary based on the ACTUAL content, not generic descriptions
3. Extract ALL financial data EXACTLY as shown (amounts, dates, vendors, items)
4. Use Ethiopian Birr (ETB) as default currency if not specified
5. Provide specific insights based on what you see in the document
6. Your confidence score should reflect how clearly the information is presented

Document Content:
${content}

IMPORTANT: Base your response entirely on what is ACTUALLY in this document. Do not make assumptions or use generic placeholders.

RESPOND IN VALID JSON FORMAT ONLY (no markdown, no code blocks):
{
  "summary": "Write a specific 2-3 sentence summary describing what THIS SPECIFIC document contains, including key amounts, dates, and parties mentioned",
  "insights": {
    "keyFindings": ["List specific findings from THIS document, including actual numbers and details"],
    "risks": ["List any risks or concerns based on THIS specific document's content"],
    "recommendations": ["Provide specific recommendations based on what you see in THIS document"],
    "confidence": 0.95
  },
  "extractedData": ${getExtractionTemplate(type)}
}

Remember: Extract the ACTUAL data from the document. If the document says "$5" then extract "$5", not a placeholder like "50000".`;

  return basePrompt;
}

/**
 * Get extraction template based on document type
 */
function getExtractionTemplate(type: DocumentType): string {
  switch (type) {
    case 'invoice':
    case 'receipt':
      return `{
    "vendor": "EXTRACT the actual vendor/company name from document",
    "invoiceNumber": "EXTRACT the actual invoice number if present",
    "invoiceDate": "EXTRACT the actual date in YYYY-MM-DD format",
    "dueDate": "EXTRACT the due date if present",
    "totalAmount": "EXTRACT the actual total amount as a number",
    "currency": "EXTRACT currency (USD, ETB, etc.) or use ETB as default",
    "lineItems": [
      {
        "description": "EXTRACT each item description exactly as written",
        "quantity": "EXTRACT quantity if present",
        "unitPrice": "EXTRACT unit price if present",
        "total": "EXTRACT line total",
        "category": "Infer category from description"
      }
    ],
    "taxAmount": "EXTRACT tax amount if present, otherwise 0",
    "paymentTerms": "EXTRACT payment terms if mentioned"
  }`;

    case 'contract':
      return `{
    "contractParties": ["Party A", "Party B"],
    "contractValue": 5000000.00,
    "currency": "ETB",
    "startDate": "2026-03-01",
    "endDate": "2027-03-01",
    "paymentSchedule": [
      {
        "milestone": "Foundation completion",
        "amount": 1000000,
        "dueDate": "2026-06-01"
      }
    ],
    "deliverables": ["Deliverable 1", "Deliverable 2"],
    "penalties": "Late delivery penalties...",
    "terms": "Key contract terms..."
  }`;

    case 'proposal':
    case 'rfp':
      return `{
    "projectTitle": "Project name",
    "estimatedBudget": 10000000.00,
    "currency": "ETB",
    "timeline": "12 months",
    "keyObjectives": ["Objective 1", "Objective 2"],
    "deliverables": ["Deliverable 1", "Deliverable 2"],
    "milestones": [
      {
        "name": "Phase 1",
        "duration": "3 months",
        "budget": 3000000
      }
    ],
    "technicalRequirements": ["Requirement 1", "Requirement 2"]
  }`;

    default:
      return `{
    "documentPurpose": "Purpose of document",
    "keyData": {},
    "dates": [],
    "amounts": [],
    "parties": []
  }`;
  }
}

/**
 * Parse AI response and extract structured data
 */
function parseAIResponse(response: string, type: DocumentType): {
  summary: string;
  insights: AIProcessingResult['insights'];
  extractedData: any;
} {
  try {
    // Remove any markdown code blocks if present
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    return {
      summary: parsed.summary || 'No summary available',
      insights: {
        keyFindings: parsed.insights?.keyFindings || [],
        risks: parsed.insights?.risks || [],
        recommendations: parsed.insights?.recommendations || [],
        confidence: parsed.insights?.confidence || 0.5,
      },
      extractedData: parsed.extractedData || {},
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Response:', response);

    // Fallback parsing
    return {
      summary: 'Error parsing AI response',
      insights: {
        keyFindings: ['Failed to extract structured data'],
        risks: ['AI response parsing error'],
        recommendations: ['Please review document manually'],
        confidence: 0,
      },
      extractedData: { rawResponse: response },
    };
  }
}

/**
 * Calculate processing cost
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * AI_CONFIG.costs.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * AI_CONFIG.costs.outputPer1M;
  return inputCost + outputCost;
}

/**
 * Extract text from different file types (PDF, images, etc.)
 * This is a placeholder - you'll need to implement actual extraction
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  // For MVP, we'll use the vision API for images and PDFs
  // In production, use pdf-parse, tesseract.js, or similar libraries

  if (mimeType.startsWith('image/')) {
    // Convert image to base64 for AI vision
    const base64Image = fileBuffer.toString('base64');

    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as any,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'Extract ALL text from this image with 100% accuracy. Include all numbers, dates, and text exactly as shown.',
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  if (mimeType === 'application/pdf') {
    const base64Pdf = fileBuffer.toString('base64');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });
    const response = await client.messages.create({
      model: process.env.AI_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64Pdf,
              },
            },
            {
              type: 'text',
              text: 'Extract and return all the text content from this document. Preserve the structure (headings, tables, lists). Return only the extracted text, no commentary.',
            },
          ],
        },
      ],
    });
    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  // For DOCX files, extract readable text from XML content
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
    const text = fileBuffer.toString('utf-8');
    const xmlText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (xmlText.length > 100) return xmlText;
    return 'Document content could not be extracted. Please convert to PDF or text format.';
  }

  // For plain text files
  return fileBuffer.toString('utf-8');
}

/**
 * Check if user has exceeded AI usage quota
 */
export async function checkAIQuota(
  organizationId: string,
  userId: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const { prisma } = await import('@onekof/database');

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const usage = await prisma.aIUsage.findFirst({
    where: {
      organizationId,
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    },
  });

  const limit = usage?.documentLimit || 50;
  const used = usage?.documentCount || 0;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: remaining > 0,
    remaining,
    limit,
  };
}

export async function recordAIUsage(
  organizationId: string,
  userId: string,
  tokensUsed: number,
  costUsd: number
): Promise<void> {
  const { prisma } = await import('@onekof/database');

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const periodStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const existing = await prisma.aIUsage.findFirst({
    where: { organizationId, userId, period: periodStr },
  });

  if (existing) {
    await prisma.aIUsage.update({
      where: { id: existing.id },
      data: {
        documentCount: { increment: 1 },
        tokensUsed: { increment: tokensUsed },
        costUSD: { increment: costUsd },
      },
    });
  } else {
    await prisma.aIUsage.create({
      data: {
        organizationId,
        userId,
        period: periodStr,
        periodStart,
        periodEnd,
        documentCount: 1,
        tokensUsed,
        costUSD: costUsd,
        documentLimit: 50,
        exceeded: false,
      },
    });
  }
}
