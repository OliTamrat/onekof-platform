import { describe, it, expect } from 'vitest';
import { sanitizeHtml, validateFile } from '@/lib/validation/validate';

describe('Validation Utilities', () => {
  describe('sanitizeHtml', () => {
    it('escapes HTML tags', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('escapes ampersands', () => {
      expect(sanitizeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('escapes single quotes', () => {
      expect(sanitizeHtml("it's")).toBe('it&#x27;s');
    });

    it('escapes forward slashes', () => {
      expect(sanitizeHtml('a/b')).toBe('a&#x2F;b');
    });

    it('handles empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('handles string with no special characters', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
    });

    it('escapes multiple characters in sequence', () => {
      expect(sanitizeHtml('<b>"test"</b>')).toBe(
        '&lt;b&gt;&quot;test&quot;&lt;&#x2F;b&gt;'
      );
    });
  });

  describe('validateFile', () => {
    function createMockFile(name: string, size: number, type: string): File {
      const buffer = new ArrayBuffer(size);
      return new File([buffer], name, { type });
    }

    it('accepts a file within defaults', () => {
      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      expect(validateFile(file)).toEqual({ valid: true });
    });

    it('rejects file exceeding max size', () => {
      const file = createMockFile('large.zip', 20 * 1024 * 1024, 'application/zip');
      const result = validateFile(file, { maxSize: 10 * 1024 * 1024 });
      expect(result).toEqual({
        valid: false,
        error: 'File size exceeds maximum of 10MB',
      });
    });

    it('rejects disallowed MIME type', () => {
      const file = createMockFile('script.exe', 1024, 'application/x-executable');
      const result = validateFile(file, { allowedTypes: ['application/pdf', 'image/png'] });
      expect(result).toEqual({
        valid: false,
        error: expect.stringContaining('not allowed'),
      });
    });

    it('accepts allowed MIME type', () => {
      const file = createMockFile('photo.png', 1024, 'image/png');
      expect(validateFile(file, { allowedTypes: ['image/png'] })).toEqual({ valid: true });
    });

    it('rejects disallowed extension', () => {
      const file = createMockFile('script.exe', 1024, 'application/x-executable');
      const result = validateFile(file, { allowedExtensions: ['pdf', 'png'] });
      expect(result).toEqual({
        valid: false,
        error: expect.stringContaining('.exe is not allowed'),
      });
    });

    it('accepts allowed extension', () => {
      const file = createMockFile('doc.pdf', 1024, 'application/pdf');
      expect(validateFile(file, { allowedExtensions: ['pdf'] })).toEqual({ valid: true });
    });

    it('uses default 10MB max size', () => {
      const file = createMockFile('big.dat', 11 * 1024 * 1024, 'application/octet-stream');
      const result = validateFile(file);
      expect(result).toEqual({
        valid: false,
        error: expect.stringContaining('10MB'),
      });
    });
  });
});
