export function generateCSV(headers: string[], rows: Record<string, string | number | boolean | null>[]): string {
  const headerLine = headers.map(escapeCSVField).join(',');
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCSVField(String(row[header] ?? ''))).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ExportConfig {
  title: string;
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
  filename: string;
  format: 'csv' | 'json';
}

export function exportData(config: ExportConfig): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${config.filename}_${timestamp}`;

  if (config.format === 'csv') {
    const csv = generateCSV(config.headers, config.rows);
    downloadCSV(`${filename}.csv`, csv);
  } else {
    downloadJSON(`${filename}.json`, {
      exportedAt: new Date().toISOString(),
      title: config.title,
      data: config.rows,
    });
  }
}
