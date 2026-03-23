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

/**
 * Generate an Excel-compatible XLSX file using SpreadsheetML XML format.
 * No external library needed — produces a valid .xlsx-compatible XML spreadsheet.
 */
export function generateExcelXML(title: string, headers: string[], rows: Record<string, string | number | boolean | null>[]): string {
  const escapeXML = (val: string) => val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const headerCells = headers.map(h => `<Cell><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`).join('');
  const dataRows = rows.map(row => {
    const cells = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '<Cell><Data ss:Type="String"></Data></Cell>';
      if (typeof val === 'number') return `<Cell><Data ss:Type="Number">${val}</Data></Cell>`;
      return `<Cell><Data ss:Type="String">${escapeXML(String(val))}</Data></Cell>`;
    }).join('');
    return `<Row>${cells}</Row>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1" ss:Size="11"/>
      <Interior ss:Color="#1C8C7D" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF" ss:Bold="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${escapeXML(title.substring(0, 31))}">
    <Table>
      <Row ss:StyleID="header">${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;
}

export function downloadExcel(filename: string, excelContent: string): void {
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a PDF by opening a print-styled HTML document in a new window.
 * Uses the browser's built-in Print to PDF for high-quality output.
 */
export function downloadPDF(title: string, headers: string[], rows: Record<string, string | number | boolean | null>[]): void {
  const escapeHTML = (val: string) => val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const headerCells = headers.map(h => `<th style="padding:8px 12px;text-align:left;background:#1C8C7D;color:white;font-size:12px;border-bottom:2px solid #156B60;">${escapeHTML(h)}</th>`).join('');
  const dataRows = rows.map((row, i) => {
    const bgColor = i % 2 === 0 ? '#ffffff' : '#f8fafb';
    const cells = headers.map(header => {
      const val = row[header];
      return `<td style="padding:6px 12px;font-size:11px;border-bottom:1px solid #e2e8f0;">${escapeHTML(String(val ?? ''))}</td>`;
    }).join('');
    return `<tr style="background:${bgColor}">${cells}</tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><head><title>${escapeHTML(title)}</title>
<style>
  @media print { body { margin: 0; } @page { size: A4 landscape; margin: 1cm; } }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; }
  h1 { font-size: 18px; margin-bottom: 4px; color: #1C8C7D; }
  .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
</style></head><body>
<h1>${escapeHTML(title)}</h1>
<div class="meta">Exported on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ${rows.length} records</div>
<table><thead><tr>${headerCells}</tr></thead><tbody>${dataRows}</tbody></table>
</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}

export interface ExportConfig {
  title: string;
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
  filename: string;
  format: 'csv' | 'json' | 'excel' | 'pdf';
}

export function exportData(config: ExportConfig): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${config.filename}_${timestamp}`;

  switch (config.format) {
    case 'csv': {
      const csv = generateCSV(config.headers, config.rows);
      downloadCSV(`${filename}.csv`, csv);
      break;
    }
    case 'json': {
      downloadJSON(`${filename}.json`, {
        exportedAt: new Date().toISOString(),
        title: config.title,
        data: config.rows,
      });
      break;
    }
    case 'excel': {
      const xml = generateExcelXML(config.title, config.headers, config.rows);
      downloadExcel(`${filename}.xls`, xml);
      break;
    }
    case 'pdf': {
      downloadPDF(config.title, config.headers, config.rows);
      break;
    }
  }
}
