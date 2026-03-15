import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { log } from '@/lib/logger';

/**
 * Validation Utilities
 *
 * SECURITY: Provides safe input validation for API routes
 * Prevents injection attacks and ensures data integrity
 */

/**
 * Validate request body against a Zod schema
 * Returns the validated data or throws an error with formatted messages
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod validation errors
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      log.warn('Validation failed', {
        endpoint: request.nextUrl.pathname,
        errors: formattedErrors,
      });

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: formattedErrors,
          },
          { status: 400 }
        ),
      };
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      log.warn('Invalid JSON in request body', {
        endpoint: request.nextUrl.pathname,
      });

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Invalid JSON format',
            message: 'Request body must be valid JSON',
          },
          { status: 400 }
        ),
      };
    }

    // Unknown error
    log.error('Unexpected validation error', {
      error,
      endpoint: request.nextUrl.pathname,
    });

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Validation error',
          message: 'An unexpected error occurred during validation',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validatedData = schema.parse(params);

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      log.warn('Query parameter validation failed', {
        endpoint: request.nextUrl.pathname,
        errors: formattedErrors,
      });

      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: formattedErrors,
          },
          { status: 400 }
        ),
      };
    }

    log.error('Unexpected query validation error', {
      error,
      endpoint: request.nextUrl.pathname,
    });

    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Query validation error',
          message: 'An unexpected error occurred',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Sanitize string inputs to prevent XSS attacks
 * Use this for user-generated content that will be displayed
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML entity encoding
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize file uploads
 */
export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: true } | { valid: false; error: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / (1024 * 1024)}MB`,
    };
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
      };
    }
  }

  return { valid: true };
}
