// Onekof data residency counsel brief generator.
// Regenerate: npm install docx && node data-residency-counsel-brief.js
//   (writes ../ONEKOF_DATA_RESIDENCY_COUNSEL_BRIEF.docx)
// Generated, not hand-edited — same rule as docs/support/generators.
//
// Purpose: turn the open residency question in MEDICAL_MODULE_ARCHITECTURE.md
// (M5/M5a) into four questions counsel can answer yes/no, rather than an open
// research request. Everything here is desk research by the CTO and is
// explicitly NOT presented as a legal conclusion.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  ImageRun, Header, Footer, PageNumber, LevelFormat, PageBreak,
} = require('docx');

const logo = fs.readFileSync(path.join(__dirname, '../../../apps/web/public/logo-full.png'));
const TEAL = '1C8C7D';
const GRAY = '666666';
const AMBER = 'B45309';

const numbering = {
  config: [
    {
      reference: 'bullets',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 200 } } },
      }],
    },
    // Each question block restarts at 1.
    ...['q1', 'q1b', 'q2', 'q3', 'q4'].map((ref) => ({
      reference: ref,
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 260 } } },
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
const NUM = (ref, text) => new Paragraph({
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
const CALLOUT = (text) => new Paragraph({
  children: [new TextRun({ text, size: 21, bold: true, color: AMBER })],
  spacing: { before: 160, after: 160 },
  border: {
    left: { style: BorderStyle.SINGLE, size: 18, color: AMBER, space: 10 },
  },
  indent: { left: 160 },
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
            new TextRun({ text: '\tData Residency — Instruction Brief to Counsel', size: 17, color: GRAY }),
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
            new TextRun({ text: 'DAPS Analytics PLC · Confidential', size: 16, color: GRAY }),
            new TextRun({ text: '\t', size: 16 }),
            new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], size: 16, color: GRAY }),
          ],
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
        })],
      }),
    },
    children: [
      // ---------- Title page ----------
      new Paragraph({ spacing: { before: 2400 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: logo, type: 'png', transformation: { width: 320, height: 122 } })],
        spacing: { after: 500 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Data Residency & Health Data', bold: true, size: 52, color: TEAL })],
        spacing: { after: 160 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Instruction Brief to Counsel', bold: true, size: 36 })],
        spacing: { after: 400 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: 'Personal Data Protection Proclamation No. 1321/2024 — application to the Onekof platform',
          size: 24, color: GRAY,
        })],
        spacing: { after: 2000 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Version 1.0 · July 29, 2026 · Confidential', size: 21, color: GRAY })],
        spacing: { after: 80 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Prepared by: Oli Tamrat, CTO — DAPS Analytics PLC', size: 21, color: GRAY })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ---------- The ask, first ----------
      H1('1. What we are asking for'),
      P('We are building a healthcare module for Onekof, our project management platform. Before we write any code that stores patient information, we need your confirmation on four questions of Ethiopian data protection law.'),
      P('This brief sets out our own reading so that you can confirm, correct, or qualify it, rather than research the matter from scratch. Section 5 contains the four questions. Everything before it is context.'),
      CALLOUT('Nothing in this brief is a legal conclusion. It is desk research by our CTO, prepared to make your review faster and cheaper. Where we state a position, we are stating what we intend to do unless you tell us otherwise.'),
      P('Commercially, we are in an unusually good position to act on your advice: the healthcare module is not built, and we hold no patient data of any kind today. Whatever you advise, the cost of following it is close to zero right now, and rises steadily once we have customers.', { run: { bold: true } }),

      // ---------- Background ----------
      H1('2. What Onekof is, and what data it holds'),
      P('Onekof is a multi-tenant project management platform used by Ethiopian government institutions, NGOs, enterprises, schools and health facilities. Each customer organization gets its own workspace.'),
      H2('Data held today, across all customers'),
      B('User account data: names, email addresses, roles, organization membership'),
      B('Work data: projects, tasks, comments, attachments, budgets and expenses'),
      B('Audit and activity logs recording who did what and when'),
      P('None of this is health data. Today Onekof holds no patient information whatsoever.'),
      H2('Data the healthcare module would add'),
      B('A minimal patient reference: identifiers held in encrypted form, used to link operational work to a patient'),
      B('Care coordination tasks that reference a patient'),
      P('Deliberately excluded, permanently and by design: diagnoses, prescriptions, laboratory and imaging results, and clinical notes. Onekof is not, and is not intended to become, an Electronic Medical Record. The clinical record remains with the health facility and its own systems. We hold operational coordination data that points at a patient.', { run: { bold: true } }),

      H2('Our hosting tiers'),
      P('Onekof is designed to run on three infrastructure tiers. This is published to customers in our privacy policy.'),
      table([
        ['Tier', 'Infrastructure', 'Data located in Ethiopia?', 'Status'],
        ['Tier 1', 'EthioTelecom Cloud — intended for government tenants', 'Yes', 'Planned'],
        ['Tier 2', 'On-premise or DAPS-managed server in Ethiopia', 'Yes', 'Available'],
        ['Tier 3', 'Vercel (Frankfurt, Germany) + Supabase (EU region)', 'No', 'Current default production'],
      ], [1000, 3600, 2200, 2560]),
      P('All customers today run on Tier 3. This includes Ethiopian government, NGO, education and business organizations.', { run: { bold: true } }),

      new Paragraph({ children: [new PageBreak()] }),

      // ---------- Our reading ----------
      H1('3. Our reading of the Proclamation'),
      P('Personal Data Protection Proclamation No. 1321/2024 was passed on 4 April 2024 and entered into force on publication in the Federal Negarit Gazette on 24 July 2024. The Ethiopian Communications Authority is the supervisory authority. We understand the following provisions to be relevant.'),
      BOLDLEAD('Data localisation (Art. 22) — ', 'a data controller or processor must ensure the storage of personal data collected or obtained in Ethiopia on a server or data centre located in Ethiopia. The Authority may additionally designate categories of "critical personal data" that may only be processed in-country.'),
      BOLDLEAD('Health data is sensitive personal data — ', 'the sensitive category expressly includes physical or mental health data. Processing of sensitive personal data is prohibited save on enumerated grounds such as consent or legal obligation.'),
      BOLDLEAD('Cross-border transfer — ', 'transfers abroad require an adequacy assessment of the recipient country, appropriate safeguards, explicit informed consent, or necessity. For sensitive personal data specifically, we understand prior approval of the Authority is required.'),
      BOLDLEAD('Storage limitation — ', 'personal data must not be kept in identifiable form for longer than necessary for the purpose, after which it must be securely deleted or anonymised, unless retention is required by law.'),
      BOLDLEAD('Scope — ', 'we understand the Proclamation to apply to any controller or processor established in Ethiopia and processing in that context, and also to those not established in Ethiopia who process the personal data of persons in Ethiopia. We have found only one exemption, for processing by an individual in the course of purely personal or household activity, and no threshold based on the size of the operator. If that understanding is wrong, Question 1b below is where it matters most to us.'),
      P('We also understand that enforcement is at an early stage: a year after entry into force the Authority was still expanding capacity, with implementing directives pending. We are treating this as relevant to urgency and to the likelihood of near-term enforcement action, but not to what the law requires. We would rather comply early than argue that a statute is not yet being enforced.'),

      // ---------- Consequence ----------
      H1('4. Why the answer changes what we build'),
      P('Our reading creates two distinct issues, and we want to be transparent that the second is larger than the first.'),
      H2('Issue A — the healthcare module (narrow)'),
      P('If patient data may not sit outside Ethiopia, the healthcare module can only be offered to customers on Tier 1 or Tier 2. We have already built this restriction into the code as a single switch, so it costs us nothing to keep it. Our working assumption is that this restriction is correct.'),
      H2('Issue B — the platform as a whole (broad)'),
      P('Article 22, as we read it, is not limited to health data. It appears to cover all personal data collected in Ethiopia. If that reading is right, then our current Tier 3 production — which holds the names, email addresses and activity records of Ethiopian users across every customer type — does not satisfy Article 22 today, irrespective of anything to do with healthcare.'),
      P('We would rather raise this ourselves and be told we are wrong than discover it later.', { run: { bold: true } }),

      new Paragraph({ children: [new PageBreak()] }),

      // ---------- The questions ----------
      H1('5. The four questions'),
      P('Short answers are welcome. Where the answer is "it depends", the dependency itself is useful to us.'),

      H2('Question 1 — Does Article 22 require exclusive storage in Ethiopia?'),
      P('This is the question that matters most to us commercially.'),
      NUM('q1', 'Does Article 22 require that personal data collected in Ethiopia be stored ONLY in Ethiopia, so that a copy held abroad is non-compliant regardless of safeguards?'),
      NUM('q1', 'Or does it require a copy to be stored in Ethiopia, while permitting an additional copy abroad under the cross-border transfer provisions?'),
      P('If the first: Tier 3 cannot serve Ethiopian customers and we must move them to Tier 1 or Tier 2. If the second: Tier 3 can continue for non-sensitive data with the appropriate safeguards and consents in place, and only patient data requires the hard restriction.'),
      H2('Question 1b — Does the sector of the business change the answer?'),
      P('Our internal view has been divided on this and we would like it settled. One reading is that the localisation duty is aimed principally at health, telecommunications and similar sensitive-sector operators, and that a general business tool holding ordinary account data is not the intended target. The other is that the duty is territorial — it attaches to personal data collected in Ethiopia irrespective of the controller\'s sector.'),
      NUM('q1b', 'Does Article 22 apply differently to a general-purpose business application than to a health or telemedicine application, or is the obligation the same for both?'),
      NUM('q1b', 'Is Onekof a data controller, a data processor, or both? Our customers decide what to put into their workspaces, which suggests we are a processor for their content and a controller for the account data we collect ourselves. Does that distinction change our obligations under Article 22?'),
      NUM('q1b', 'Are there any thresholds, exemptions or transitional accommodations — by size of operator, volume of data, or sector — that would apply to a company of our size?'),

      H2('Question 2 — Patient data on Ethiopian infrastructure'),
      NUM('q2', 'Do you agree that patient identifiers, as described in section 2, must be stored on infrastructure located in Ethiopia?'),
      NUM('q2', 'Does our exclusion of diagnoses, prescriptions, results and clinical notes change the analysis, or is a patient identifier linked to a care activity already health data in the full sense?'),
      NUM('q2', 'Is there any realistic route — consent, Authority approval, or otherwise — by which patient data could lawfully sit on Tier 3? We are not seeking one, but we would like to know whether it exists before we tell customers it does not.'),

      H2('Question 3 — Retention'),
      P('The Proclamation sets a purpose-based storage limitation rather than a fixed period. Because Onekof is not the medical record, our view is that a SHORT retention period is correct: a long one would turn our platform into an unmanaged secondary patient archive that no facility designated as its record.'),
      P('Our position, decided internally: patient-linked operational records are retained for 12 months following closure of the last linked care item, configurable by the organization between 6 and 84 months, with no option to retain indefinitely. Before any erasure the organization receives notice and an export of the records due for deletion — we do not delete silently on a timer, because the operational history belongs to the institution even where the personal data should not persist in our systems.', { run: { bold: true } }),
      NUM('q3', 'Is a 12-month default, bounded 6 to 84 months with no indefinite option, defensible under the storage limitation principle?'),
      NUM('q3', 'Does the pre-erasure export satisfy, conflict with, or complicate the storage limitation duty? We regard it as protecting the institution, but it does mean personal data leaves our systems in a file we no longer control, and we would rather be told now if that creates a problem.'),
      NUM('q3', 'Are we subject to any Ethiopian health-sector retention MINIMUM that would override a short period — noting that we are not the clinical record holder?'),
      NUM('q3', 'Must we apply the retain-until-majority rule for minors? Our view is that this rule attaches to the clinical record and not to operational coordination data, but we do not want to assume that.'),
      NUM('q3', 'We intend to exempt access audit logs from patient retention, so that the record of who accessed what survives the patient record. Those logs reference patients by internal identifier only and contain no personal identifiers. Is that treatment correct?'),

      H2('Question 4 — Obligations we may have already incurred'),
      NUM('q4', 'Must DAPS Analytics register with the Authority as a data controller or processor, and if so, by when?'),
      NUM('q4', 'Given that we are operating on Tier 3 today with Ethiopian customers, what is our current exposure, and what would you advise as an immediate remediation sequence?'),
      NUM('q4', 'Do we require a Data Protection Officer?'),
      NUM('q4', 'What contractual terms should we put in place with our infrastructure providers, and with customers, before onboarding health facilities?'),

      // ---------- What we've done ----------
      new Paragraph({ children: [new PageBreak()] }),
      H1('6. Measures already in place'),
      P('So that you can see what is already built rather than promised:'),
      BOLDLEAD('Deployment tier is enforced in code — ', 'a single function determines whether a given deployment may hold patient data, and it currently answers "no" for all cloud deployments. Development machines deliberately answer "no" as well.'),
      BOLDLEAD('Patient identifiers are encrypted at rest — ', 'with a blind index for lookup, so identifiers are never stored in readable form.'),
      BOLDLEAD('Access is a separate permission ladder — ', 'holding an Owner or Administrator role in an organization does not by itself grant access to patient data.'),
      BOLDLEAD('Reads are audited, not only writes — ', 'viewing a patient record creates an audit entry, so unauthorised access is detectable after the fact.'),
      BOLDLEAD('Deletion is real — ', 'the erasure path removes identifiers rather than flagging a row as deleted, leaving an anonymised shell so that operational statistics survive without naming anyone.'),
      BOLDLEAD('Scope is bounded by design — ', 'the exclusion of clinical content is an architectural decision recorded in our design documentation, not a roadmap position.'),
      P('None of this substitutes for the residency answer, which is why we are asking before building further.'),

      H1('7. Sources consulted'),
      P('For transparency, our reading above is drawn from the following. We have not obtained a certified copy of the Proclamation and would defer entirely to your reading of the authoritative text.'),
      B('Personal Data Protection Proclamation No. 1321/2024, Federal Negarit Gazette, 24 July 2024'),
      B('Published commentary from Ethiopian legal practices on the Proclamation, its localisation requirement and its cross-border transfer regime'),
      B('Digital Policy Alert, entries on the adoption and implementation of Proclamation No. 1321/2024, including its data localisation requirement'),
      B('Ethiopian technology press reporting on the pace of enforcement and the status of implementing directives'),
      P('Our own internal design documentation for the healthcare module is available on request, and includes the full technical detail behind section 6.'),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, '../ONEKOF_DATA_RESIDENCY_COUNSEL_BRIEF.docx');
  fs.writeFileSync(out, buf);
  console.log('Wrote', out, `(${(buf.length / 1024).toFixed(1)} KB)`);
});
