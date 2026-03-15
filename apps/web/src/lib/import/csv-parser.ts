export interface ParsedRow {
  [key: string]: string;
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  errors: { row: number; message: string }[];
  totalRows: number;
}

export function parseCSV(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const errors: { row: number; message: string }[] = [];

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: [{ row: 0, message: 'Empty file' }], totalRows: 0 };
  }

  const headers = parseCSVLine(lines[0]);
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        errors.push({ row: i + 1, message: `Expected ${headers.length} columns, got ${values.length}` });
        continue;
      }
      const row: ParsedRow = {};
      headers.forEach((header, j) => {
        row[header.trim()] = values[j]?.trim() || '';
      });
      rows.push(row);
    } catch (e) {
      errors.push({ row: i + 1, message: `Parse error: ${e instanceof Error ? e.message : 'Unknown'}` });
    }
  }

  return { headers, rows, errors, totalRows: lines.length - 1 };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export interface FieldMapping {
  csvField: string;
  targetField: string;
  transform?: (value: string) => string;
}

export function mapRows(rows: ParsedRow[], mappings: FieldMapping[]): Record<string, string>[] {
  return rows.map((row) => {
    const mapped: Record<string, string> = {};
    mappings.forEach(({ csvField, targetField, transform }) => {
      const value = row[csvField] || '';
      mapped[targetField] = transform ? transform(value) : value;
    });
    return mapped;
  });
}
