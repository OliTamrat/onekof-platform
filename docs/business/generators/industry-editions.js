// Onekof Industry Editions reference generator.
// Regenerate: npm install docx && node industry-editions.js (writes ../ONEKOF_INDUSTRY_EDITIONS_REFERENCE.docx)
// Same generated-not-hand-edited rule as docs/support/generators.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  ImageRun, Header, Footer, PageNumber, LevelFormat, PageBreak,
} = require('docx');

const logo = fs.readFileSync(require('path').join(__dirname, '../../../apps/web/public/logo-full.png'));
const TEAL = '1C8C7D';
const GRAY = '666666';

const numbering = {
  config: [{
    reference: 'bullets',
    levels: [{
      level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 360, hanging: 200 } } },
    }],
  }],
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

function table(rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (text, w, head) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: head ? { type: ShadingType.CLEAR, fill: 'E8F4F1' } : undefined,
    borders: { top: border, bottom: border, left: border, right: border },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, bold: head })] })],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) => new TableRow({ children: r.map((c, j) => cell(c, widths[j], i === 0)) })),
  });
}

// Per-edition profile builder
function edition({ name, positioning, terminology, sidebar, departments, budget, flags, future }) {
  return [
    H1(name),
    P(positioning),
    table([
      ['Dimension', 'Configuration'],
      ['Terminology', terminology],
      ['Sidebar structure', sidebar],
      ['Departments & workstreams', departments],
      ['Budget configuration', budget],
      ['Feature flags', flags],
    ], [2600, 6760]),
    H2('Proposed future features (roadmap candidates)'),
    ...future.map(([lead, rest]) => BOLDLEAD(lead + ' — ', rest)),
  ];
}

const doc = new Document({
  numbering,
  styles: { default: { document: { run: { font: 'Calibri' } } } },
  sections: [{
    properties: { titlePage: true },
    headers: {
      first: new Header({ children: [new Paragraph('')] }),
      default: new Header({
        children: [new Paragraph({
          tabStops: [{ type: 'right', position: 9360 }],
          children: [
            new ImageRun({ data: logo, type: 'png', transformation: { width: 79, height: 30 } }),
            new TextRun({ text: '\tOnekof Industry Editions — Feature Reference', size: 17, color: GRAY }),
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
          spacing: { after: 200 },
        })],
      }),
    },
    footers: {
      first: new Footer({ children: [new Paragraph('')] }),
      default: new Footer({
        children: [new Paragraph({
          tabStops: [{ type: 'right', position: 9360 }],
          children: [
            new TextRun({ text: 'DAPS Analytics PLC · onekof.com', size: 16, color: GRAY }),
            new TextRun({ text: '\t', size: 16 }),
            new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], size: 16, color: GRAY }),
          ],
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
        })],
      }),
    },
    children: [
      new Paragraph({ spacing: { before: 2400 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: logo, type: 'png', transformation: { width: 320, height: 122 } })],
        spacing: { after: 500 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Onekof Industry Editions', bold: true, size: 52, color: TEAL })],
        spacing: { after: 160 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Structure & Proposed Features per Organization Type', bold: true, size: 36 })],
        spacing: { after: 400 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Product Reference — companion to the Department & Workstream Architecture (D1–D9)', size: 24, color: GRAY })],
        spacing: { after: 2000 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Version 1.0 · July 28, 2026', size: 21, color: GRAY })],
        spacing: { after: 80 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Prepared by: Oli Tamrat, CTO — DAPS Analytics PLC', size: 21, color: GRAY })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      H1('The Shared Core — every edition, every organization'),
      P('Onekof is one platform with five institutional presentations. The core is identical everywhere — one codebase, one data model, one support organization — and each edition selects which lenses appear. An Owner/Admin can always adjust individual sections after the preset applies: editions are defaults, never locks.'),
      B('Projects with enterprise metadata (department, budget code, risk level, visibility up to Confidential)'),
      B('Issues: list, board, backlog, hierarchy (Epic → Story → Task → Subtask), calendar, timeline'),
      B('Sprints / Work Cycles: planning, commitment snapshots, insights, scope-churn tracking, branded signable PDF reports'),
      B('Teams, Goals, Members & role-based permissions (org / project / team layers, budget access ladder)'),
      B('Budget & Expenses with approval workflow and revision audit trail'),
      B('Documents, Docs & Wiki knowledge base'),
      B('Reports & per-cycle accountability, organization audit log (INSA-aligned)'),
      B('Five languages (English, Amharic, Afaan Oromo, Tigrinya, Somali) · Ethiopian calendar support · works on sovereign on-premise deployments'),

      ...edition({
        name: 'Government / Ministry Edition',
        positioning: 'Audit-first project management for ministries, agencies, and public institutions. Formal vocabulary, procurement discipline, public transparency, and sovereign deployment (onekof.et on Ethio Telecom infrastructure, INSA-certified). Everything a directorate reports upward is signable and permanent.',
        terminology: 'Formal — "Work Cycle" replaces "Sprint" on every screen and report',
        sidebar: 'Core + Operations (Incidents, Monitoring, Checklists) · Research (Data, Findings, Plans, Materials, Inspections) · Compliance · Knowledge (Documents with OCR & version control, Wiki, Docs)',
        departments: 'operations, research — with all workstreams; classification chips visible across boards',
        budget: 'Procurement ON · Public transparency ON · Approval workflow ON · Forecasting ON · Single currency (ETB)',
        flags: 'Automations OFF · AI Assistant OFF · Integrations OFF · Analytics ON · Custom branding ON',
        future: [
          ['Directorate registry', 'org-defined department names (Directorates/Bureaus) feeding the same classification fields — the designed-for extension of D1'],
          ['Official correspondence templates', 'letter and memo formats generated from Documents with the ministry letterhead'],
          ['Ethiopian fiscal year alignment', 'EFY (Hamle–Sene) budget periods and reporting boundaries throughout Budget and Reports'],
          ['Digital signatures on reports', 'signed Work Cycle and budget reports for formal submission chains'],
          ['Tender lifecycle depth', 'procurement from announcement → evaluation → award as first-class workflow'],
          ['Citizen transparency portal', 'public read-only budget/progress pages for transparency-mandated institutions'],
        ],
      }),

      ...edition({
        name: 'NGO / Non-Profit Edition',
        positioning: 'Grant-and-impact centered delivery for NGOs and donor-funded programs. Multi-currency donor money, outreach campaigns, and impact evidence — built for organizations that answer to donors and communities at once.',
        terminology: 'Formal — "Work Cycle"',
        sidebar: 'Core + Marketing (Campaigns, Social Media, Analytics — outreach) · Operations · Research (M&E data collection) · Impact · Knowledge',
        departments: 'marketing, operations, research — with all workstreams',
        budget: 'Grants ON · Donations ON · Multi-currency ON (donor currencies with recorded exchange rates) · Public transparency ON · Approval workflow ON',
        flags: 'Automations OFF · AI Assistant OFF · Integrations ON · Analytics ON',
        future: [
          ['Donor reporting pack', 'per-grant branded PDF bundling work-cycle results, budget utilization, and impact lines — the sprint-report pattern extended to grants'],
          ['Logframe / M&E indicators', 'result-framework indicators attached to Goals, rolling up to Impact automatically'],
          ['Grant deadline calendar', 'reporting and disbursement deadlines as first-class calendar entries with notifications'],
          ['Beneficiary tracking', 'counters and disaggregation (region, gender, age) on Impact, feeding donor reports'],
          ['Program registry', 'org-defined departments as Programs — same D1 extension as ministry Directorates'],
        ],
      }),

      ...edition({
        name: 'Business / Tech Edition',
        positioning: 'The most automated edition — startups and enterprises shipping products. Agile vocabulary, development workflows, AI assistance, and integrations. This is also the edition DAPS itself runs on ("DAPS on Onekof").',
        terminology: 'Agile — "Sprint"',
        sidebar: 'Core + Development (Backlog, Releases, Code Review) · Marketing (Campaigns, Social, Analytics) · Operations · Automations (Workflows, Triggers, History) · AI Documents · Docs incl. API docs · Analytics',
        departments: 'development, marketing, operations — with all workstreams',
        budget: 'Forecasting ON · Multi-currency ON · Approval workflow ON · Transparency OFF',
        flags: 'Automations ON · AI Assistant ON · Integrations ON · OKRs ON',
        future: [
          ['GitHub integration', 'link pull requests and commits to issues; release pages fed by real merges (Integrations is already ON for this edition)'],
          ['Release notes generation', 'draft release notes from the completed sprint’s delivered issues'],
          ['OKR scoring', 'quarterly objective scoring rolled up from goal progress'],
          ['Customer feedback intake', 'lightweight portal feeding triaged feedback into the backlog with source tracking'],
          ['Usage analytics for admins', 'adoption dashboards (active users, cycle cadence) for engineering leadership'],
        ],
      }),

      ...edition({
        name: 'Education Edition',
        positioning: 'The simplest edition — schools, universities, and training institutions. Course-centered structure, research supervision, minimal financial complexity. Deliberately the least cluttered sidebar in the family.',
        terminology: 'Formal — "Work Cycle"',
        sidebar: 'Core + Research (Data, Findings, Plans, Materials, Inspections) · Courses · Knowledge (Wiki, Docs)',
        departments: 'research — all workstreams',
        budget: 'Grants ON (simplified) · Income/Forecasting/Procurement OFF · Approval workflow ON',
        flags: 'Automations OFF · AI Assistant OFF · Integrations OFF · Analytics OFF',
        future: [
          ['Academic calendar', 'semester/term timelines as the default planning horizon instead of free dates'],
          ['Course cohorts', 'courses tied to Teams so a cohort’s work, goals, and activity live together'],
          ['Research supervision workflow', 'thesis/dissertation milestones with supervisor sign-off steps'],
          ['Ministry of Education reporting', 'export formats aligned to MoE institutional reporting'],
          ['Faculty registry', 'org-defined departments as Faculties/Colleges — the D1 extension again'],
        ],
      }),

      ...edition({
        name: 'Healthcare Edition (the fifth preset)',
        positioning: 'Hospitals, clinics and health programs. Facility and equipment operations, safety management, clinical research support, and an approval-disciplined budget. Patient-linked features are NOT part of this edition today — see the note below.',
        terminology: 'Formal — "Work Cycle"',
        sidebar: 'Core + Operations (Incidents, Monitoring, Checklists, Facilities, Equipment, Safety Management) · Research (Data, Findings, Plans, Materials, Inspections) · Knowledge',
        departments: 'operations, research — all workstreams, including the facility/equipment/safety workstreams added by M4',
        budget: 'Approval workflow ON · single currency · transparency OFF',
        flags: 'Automations OFF · AI Assistant OFF · Integrations OFF · Analytics ON',
        future: [
          ['Patient registry and care coordination', 'the Medical module proper. Gated on a data-residency opinion from counsel and a retention decision — see docs/architecture/MEDICAL_MODULE_ARCHITECTURE.md. Onekof builds healthcare OPERATIONS and is deliberately not an Electronic Medical Record'],
          ['Recurring preventive maintenance', 'scheduled servicing for facilities and equipment. Requires recurring tasks, which the platform does not have yet — a general capability, not a healthcare feature'],
          ['Health data compliance checklists', 'Ethiopian health data regulations as living checklists, once the Compliance section is real'],
          ['Shift handover checklists', 'structured shift-change documentation in Operations'],
          ['Clinical research protocols', 'protocol templates and approval steps layered on Research workstreams'],
        ],
      }),

      ...edition({
        name: 'Construction / Infrastructure Edition (the sixth preset)',
        positioning: 'Contractors and infrastructure programmes. Site delivery, materials and inspections, safety and incident discipline, and a procurement-aware budget. Added after an audit found the sector had no preset at all and fell through to Business — handing an Ethiopian contractor Code Review and Releases while the Research workstreams built for exactly this work never reached them.',
        terminology: 'Agile — "Sprint" (contractors run delivery cycles, not formal work cycles)',
        sidebar: 'Core + Operations (Incidents, Monitoring, Checklists, Facilities, Equipment, Safety Management) · Research (Plans, Materials, Inspections, Data, Findings) · Knowledge',
        departments: 'operations, research — no development or marketing',
        budget: 'Procurement ON · Multi-currency ON (imported materials are frequently priced in USD) · Approval workflow ON · Forecasting ON · Public transparency OFF (private contractor, unlike a ministry)',
        flags: 'Automations OFF · AI Assistant OFF · Integrations OFF · Analytics ON · Document OCR ON',
        future: [
          ['Site vocabulary', 'contractors say "sites" where hospitals say "facilities". Whether that is a separate workstream or industry-specific wording for the same one is an open decision, not yet made'],
          ['Progress photography', 'site progress captured as dated attachments on inspection items'],
          ['Equipment utilisation', 'plant and machinery availability tracking on the equipment workstream'],
          ['Subcontractor coordination', 'external party access scoped to specific projects'],
        ],
      }),

      H1('How an organization gets its edition'),
      B('At account creation: the onboarding asks "What kind of organization is this?" — the edition applies instantly and atomically (Decision D7).'),
      B('Existing organizations: a one-time "Choose your organization type" banner for admins (Decision D9) — no forced migration.'),
      B('After setup: Settings → Customization shows the edition as a starting point; Owner/Admin can toggle any individual section. Editions are defaults, never locks.'),
      B('Unknown / Other: Business/Tech configuration (the current fallback, unchanged).'),
      P(''),
      P('This reference is the product-facing companion to docs/architecture/DEPARTMENT_WORKSTREAMS_ARCHITECTURE.md (v1.1, decisions D1–D9). The capability matrix in that document is the engineering source of truth; this document is the narrative per edition, including roadmap candidates that are proposals only until scheduled.', { run: { color: GRAY, italics: true } }),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = require('path').join(__dirname, '..', 'ONEKOF_INDUSTRY_EDITIONS_REFERENCE.docx');
  fs.writeFileSync(out, buffer);
  console.log('written', buffer.length, 'bytes');
});
