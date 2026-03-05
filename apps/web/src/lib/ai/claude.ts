/**
 * Claude AI Service
 * Anthropic Claude Haiku integration for document processing
 * Cost-effective, fast AI processing for invoices, contracts, proposals, etc.
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Model configuration
export const AI_CONFIG = {
  model: 'claude-3-haiku-20240307', // Fast & cheap model
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
 * Process a document with Claude AI
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

    // Call Claude API
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
    console.error('Claude AI processing error:', error);
    throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build context-aware prompt based on document type
 */
function buildPrompt(content: string, type: DocumentType, fileName: string): string {
  const basePrompt = `You are an expert financial and project management analyst for Ethiopian government infrastructure projects. Analyze the following document with extreme attention to detail.

Document Name: ${fileName}
Document Type: ${type.toUpperCase()}

CRITICAL INSTRUCTIONS:
1. Extract ALL financial data with 100% accuracy
2. Use Ethiopian Birr (ETB) as the default currency
3. Identify ALL dates in Ethiopian calendar if present, convert to Gregorian
4. Flag any risks, compliance issues, or budget concerns
5. Provide actionable recommendations

Document Content:
${content}

RESPOND IN VALID JSON FORMAT ONLY (no markdown, no code blocks):
{
  "summary": "2-3 sentence executive summary",
  "insights": {
    "keyFindings": ["finding 1", "finding 2", ...],
    "risks": ["risk 1", "risk 2", ...],
    "recommendations": ["recommendation 1", "recommendation 2", ...],
    "confidence": 0.95
  },
  "extractedData": ${getExtractionTemplate(type)}
}`;

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
    "vendor": "Company name",
    "invoiceNumber": "INV-001",
    "invoiceDate": "2026-03-04",
    "dueDate": "2026-03-30",
    "totalAmount": 50000.00,
    "currency": "ETB",
    "lineItems": [
      {
        "description": "Item description",
        "quantity": 10,
        "unitPrice": 5000,
        "total": 50000,
        "category": "Construction Materials"
      }
    ],
    "taxAmount": 0,
    "paymentTerms": "Net 30"
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
  // For MVP, we'll use Claude's vision API for images and PDFs
  // In production, use pdf-parse, tesseract.js, or similar libraries

  if (mimeType.startsWith('image/')) {
    // Convert image to base64 for Claude vision
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
    // For PDFs, convert to images and use vision API
    // Or use pdf-parse library
    // For now, return placeholder
    return 'PDF text extraction coming soon. Please use image uploads for now.';
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
  // This will be implemented with the database
  // For now, return allowed
  return {
    allowed: true,
    remaining: 50,
    limit: 50,
  };
}
