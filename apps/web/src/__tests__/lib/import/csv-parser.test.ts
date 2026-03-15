import { describe, it, expect } from 'vitest';
import { parseCSV, mapRows } from '@/lib/import/csv-parser';

describe('CSV Parser', () => {
  it('parses simple CSV content', () => {
    const csv = 'name,email,role\nJohn,john@test.com,admin\nJane,jane@test.com,member';
    const result = parseCSV(csv);

    expect(result.headers).toEqual(['name', 'email', 'role']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ name: 'John', email: 'john@test.com', role: 'admin' });
    expect(result.rows[1]).toEqual({ name: 'Jane', email: 'jane@test.com', role: 'member' });
    expect(result.errors).toHaveLength(0);
  });

  it('handles quoted fields with commas', () => {
    const csv = 'name,description\n"Smith, John","A long, complex description"';
    const result = parseCSV(csv);

    expect(result.rows[0]).toEqual({
      name: 'Smith, John',
      description: 'A long, complex description',
    });
  });

  it('handles escaped quotes in fields', () => {
    const csv = 'name,note\nJohn,"He said ""hello"""';
    const result = parseCSV(csv);

    expect(result.rows[0].note).toBe('He said "hello"');
  });

  it('reports errors for mismatched columns', () => {
    const csv = 'a,b,c\n1,2\n3,4,5';
    const result = parseCSV(csv);

    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].row).toBe(2);
  });

  it('returns empty result for empty content', () => {
    const result = parseCSV('');
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.errors).toHaveLength(1);
  });

  it('handles Windows line endings', () => {
    const csv = 'a,b\r\n1,2\r\n3,4';
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(2);
  });

  it('trims whitespace from values', () => {
    const csv = 'name , email \n John , john@test.com ';
    const result = parseCSV(csv);
    expect(result.rows[0]).toEqual({ 'name': 'John', 'email': 'john@test.com' });
  });
});

describe('mapRows', () => {
  it('maps CSV fields to target fields', () => {
    const rows = [{ Name: 'John', Email: 'john@test.com' }];
    const mappings = [
      { csvField: 'Name', targetField: 'name' },
      { csvField: 'Email', targetField: 'email' },
    ];

    const result = mapRows(rows, mappings);
    expect(result[0]).toEqual({ name: 'John', email: 'john@test.com' });
  });

  it('applies transform functions', () => {
    const rows = [{ priority: 'HIGH' }];
    const mappings = [
      { csvField: 'priority', targetField: 'priority', transform: (v: string) => v.toLowerCase() },
    ];

    const result = mapRows(rows, mappings);
    expect(result[0].priority).toBe('high');
  });

  it('handles missing fields gracefully', () => {
    const rows = [{ name: 'John' }];
    const mappings = [
      { csvField: 'name', targetField: 'title' },
      { csvField: 'missing', targetField: 'other' },
    ];

    const result = mapRows(rows, mappings);
    expect(result[0]).toEqual({ title: 'John', other: '' });
  });
});
