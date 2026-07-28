/**
 * Onekof Support Guide template library.
 * Every guide is generated from structured content through these builders so
 * branding, typography, and the 9-section structure stay identical across the
 * whole documentation set.
 *
 * Usage: see ../README (docs/support/README.md, "Regenerating a guide").
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  ImageRun, Header, Footer, PageNumber, LevelFormat, PageBreak,
} = require('docx');

const logo = fs.readFileSync(path.join(__dirname, '../../../../apps/web/public/logo-full.png'));
const TEAL = '1C8C7D';
const GRAY = '666666';

const numbering = {
  config: [
    {
      reference: 'bullets',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 200 } } },
      }],
    },
    // Each numbered walkthrough uses its own reference (steps0..steps11) so
    // every list restarts at 1.
    ...Array.from({ length: 12 }, (_, i) => ({
      reference: `steps${i}`,
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 400, hanging: 260 } } },
      }],
    })),
  ],
};

const P = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, size: 21, ...opts.run })],
  spacing: { after: 120, ...opts.spacing },
  ...opts.para,
});
const B = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [new TextRun({ text, size: 21 })],
  spacing: { after: 60 },
});
const BOLDLEAD = (lead, rest) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  children: [
    new TextRun({ text: lead, bold: true, size: 21 }),
    new TextRun({ text: rest, size: 21 }),
  ],
  spacing: { after: 60 },
});
const STEP = (ref, text) => new Paragraph({
  numbering: { reference: ref, level: 0 },
  children: [new TextRun({ text, size: 21 })],
  spacing: { after: 60 },
});
const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, bold: true, size: 30, color: TEAL })],
  spacing: { before: 320, after: 160 },
});
const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, bold: true, size: 24, color: '222222' })],
  spacing: { before: 240, after: 120 },
});

function table(rows, w1 = 3000, w2 = 6360) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
  const cell = (text, w, head) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: head ? { type: ShadingType.CLEAR, fill: 'E8F4F1' } : undefined,
    borders: { top: border, bottom: border, left: border, right: border },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, bold: head })] })],
  });
  return new Table({
    width: { size: w1 + w2, type: WidthType.DXA },
    columnWidths: [w1, w2],
    rows: rows.map(([a, b], i) => new TableRow({
      children: [cell(a, w1, i === 0), cell(b, w2, i === 0)],
    })),
  });
}

function buildGuide({ subtitle, headerTitle, version, date, outFile, body }) {
  const header = new Header({
    children: [new Paragraph({
      tabStops: [{ type: 'right', position: 9360 }],
      children: [
        new ImageRun({ data: logo, type: 'png', transformation: { width: 79, height: 30 } }),
        new TextRun({ text: `\tOnekof Support Guide — ${headerTitle}`, size: 17, color: GRAY }),
      ],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
      spacing: { after: 200 },
    })],
  });

  const footer = new Footer({
    children: [new Paragraph({
      tabStops: [{ type: 'right', position: 9360 }],
      children: [
        new TextRun({ text: 'DAPS Analytics PLC · onekof.com · support@onekof.com', size: 16, color: GRAY }),
        new TextRun({ text: '\t', size: 16 }),
        new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], size: 16, color: GRAY }),
      ],
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
    })],
  });

  const doc = new Document({
    numbering,
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [{
      properties: { titlePage: true },
      headers: { first: new Header({ children: [new Paragraph('')] }), default: header },
      footers: { first: new Footer({ children: [new Paragraph('')] }), default: footer },
      children: [
        new Paragraph({ spacing: { before: 2400 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new ImageRun({ data: logo, type: 'png', transformation: { width: 320, height: 122 } })],
          spacing: { after: 500 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Onekof Support Guide', bold: true, size: 52, color: TEAL })],
          spacing: { after: 160 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: subtitle, bold: true, size: 36 })],
          spacing: { after: 400 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Feature Documentation for the Technical Assistance Team', size: 24, color: GRAY })],
          spacing: { after: 2000 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Version ${version} · ${date}`, size: 21, color: GRAY })],
          spacing: { after: 80 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Prepared by: Oli Tamrat, CTO — DAPS Analytics PLC', size: 21, color: GRAY })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
        ...body,
        P(''),
        P('Questions not covered here: support@onekof.com', { run: { color: GRAY, italics: true } }),
      ],
    }],
  });

  return Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(path.join(__dirname, '..', '..', outFile), buffer);
    console.log('written', outFile, buffer.length, 'bytes');
  });
}

module.exports = { P, B, BOLDLEAD, STEP, H1, H2, table, buildGuide, TEAL, GRAY };
