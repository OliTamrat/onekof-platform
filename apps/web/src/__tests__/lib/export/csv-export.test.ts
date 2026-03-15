import { describe, it, expect } from 'vitest';
import { generateCSV } from '@/lib/export/csv-export';

describe('CSV Export', () => {
  it('generates CSV with headers and rows', () => {
    const headers = ['name', 'email', 'role'];
    const rows = [
      { name: 'John', email: 'john@test.com', role: 'admin' },
      { name: 'Jane', email: 'jane@test.com', role: 'member' },
    ];

    const csv = generateCSV(headers, rows);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('name,email,role');
    expect(lines[1]).toBe('John,john@test.com,admin');
    expect(lines[2]).toBe('Jane,jane@test.com,member');
  });

  it('escapes fields with commas', () => {
    const headers = ['name', 'description'];
    const rows = [{ name: 'Test', description: 'A, B, C' }];

    const csv = generateCSV(headers, rows);
    expect(csv).toContain('"A, B, C"');
  });

  it('escapes fields with quotes', () => {
    const headers = ['name'];
    const rows = [{ name: 'He said "hello"' }];

    const csv = generateCSV(headers, rows);
    expect(csv).toContain('"He said ""hello"""');
  });

  it('handles null and undefined values', () => {
    const headers = ['a', 'b'];
    const rows = [{ a: null, b: 'value' }];

    const csv = generateCSV(headers, rows);
    expect(csv).toBe('a,b\n,value');
  });

  it('generates empty CSV for no rows', () => {
    const csv = generateCSV(['a', 'b'], []);
    expect(csv).toBe('a,b');
  });
});
