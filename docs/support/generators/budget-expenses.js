const { P, B, BOLDLEAD, STEP, H1, H2, table, buildGuide } = require('./lib/guide-lib');

buildGuide({
  subtitle: 'Budget & Expenses',
  headerTitle: 'Budget & Expenses',
  version: '1.0',
  date: 'July 25, 2026',
  outFile: 'ONEKOF_SUPPORT_GUIDE_BUDGET_EXPENSES.docx',
  body: [
    // ---- 1. Overview ----
    H1('1. What is Budget & Expenses?'),
    P('The Budget section gives every project a financial plan and a controlled spending record. Each project can hold one budget in Ethiopian Birr (or another supported currency), divided into categories that can mirror government accounting codes (e.g. "5210-Personnel"). Team members submit expenses against the budget; authorized approvers review, approve or reject, and mark them paid. Reports and forecasting are generated from this record.'),
    P('Money is deliberately governed by its own access system — budget access levels — separate from organization and project roles, so financial responsibility can be assigned exactly, person by person.'),

    // ---- 2. Roles ----
    H1('2. Who Can Do What'),
    P('Budget features follow a five-step access ladder set per person. Org Owners and Admins automatically hold Full control unless a different level is set for them.'),
    table([
      ['Budget access level', 'What it allows'],
      ['No access (default)', 'Nothing — money pages show no figures. Every member starts here.'],
      ['View only', 'See budget totals and utilization.'],
      ['Edit', 'See categories and expenses, edit budget details, submit expenses against a budget. Vendor names and receipts stay hidden at this level.'],
      ['Approve', 'Everything above, plus approve/reject expenses (up to the approval threshold) and mark approved expenses paid. Sees vendors and receipts.'],
      ['Full control', 'Everything, any amount, plus budget deletion and settings. Org Owners/Admins have this by default.'],
    ]),
    table([
      ['Action', 'Requirement'],
      ['Create a budget for a project', 'Org member (budgets are created via the AI document flow or by an administrator)'],
      ['Edit a budget (amounts, categories)', 'Edit access or above — every change is recorded as a revision'],
      ['Submit an expense', 'Org member with access to the budget'],
      ['Approve / reject an expense', 'Approve access or above; above the threshold amount, Full control only'],
      ['Mark an approved expense paid', 'Approve access or above'],
      ['Edit / delete an expense', 'Only the original submitter, and only before approval (paid expenses can never be deleted)'],
      ['Delete a budget', 'Full control — and only if it has no expenses'],
    ]),

    // ---- 3. Key terms ----
    H1('3. Key Terms'),
    BOLDLEAD('Budget — ', 'one financial plan per project: total amount, currency, optional fiscal year, and categories. Its lifecycle runs Draft → Pending approval → Approved → Active → Closed.'),
    BOLDLEAD('Category — ', 'a line item of the budget, optionally carrying a government accounting code, with its own allocated amount. Categories can have subcategories.'),
    BOLDLEAD('Expense — ', 'a spending record against a budget: description, amount, date, and optionally category, vendor, invoice number, and receipt. Every expense starts as Pending.'),
    BOLDLEAD('Approval threshold — ', 'the amount (default ETB 1,000,000, changeable in Budget Settings) above which Approve-level users cannot approve — only Full control can.'),
    BOLDLEAD('Additional funding — ', 'external funding sources recorded on the budget (donor, amount, currency, exchange rate). These appear on the Income page.'),
    BOLDLEAD('Revision — ', 'the permanent record written for every budget edit and every expense decision — the financial audit trail.'),

    // ---- 4. Step-by-step ----
    H1('4. Step-by-Step Guides'),
    H2('4.1 Create a budget from a document (AI)'),
    STEP('steps0', 'Dashboard → Budget → upload the budget document (PDF, Word, or a photo).'),
    STEP('steps0', 'Onekof reads the document and proposes the total and the category breakdown. Review and correct the extraction.'),
    STEP('steps0', 'Confirm — the budget is created in Draft status, linked to the chosen project, marked as AI-extracted.'),
    H2('4.2 Submit an expense'),
    STEP('steps1', 'Dashboard → Budget → Expenses → new expense: description, amount (ETB by default), transaction date; add the category, vendor, invoice number, and receipt if available.'),
    STEP('steps1', 'Faster: drop a photo of the receipt on the Budget page — the AI reads the vendor, amount, and date and files the expense for you.'),
    STEP('steps1', 'The expense enters Pending, and approvers are notified by email.'),
    H2('4.3 Approve, reject, or pay an expense'),
    STEP('steps2', 'Dashboard → Budget → Expenses → click the pending expense to open its panel.'),
    STEP('steps2', 'Approve, or Reject with a written reason (required). The submitter is emailed the decision either way.'),
    STEP('steps2', 'After approval, Mark as paid records the payment date and method. Paid is final.'),
    H2('4.4 Read reports and forecasts'),
    STEP('steps3', 'Budget → Reports: per-budget totals, spent, remaining, utilization, category breakdown — downloadable as CSV.'),
    STEP('steps3', 'Budget → Forecasting: projected spend for the next three months from the current burn rate, with risk flags on categories above 75% and 90% utilization.'),
    STEP('steps3', 'Budget → Income: the budget allocation plus recorded external funding sources, converted to ETB at their stored rates.'),

    // ---- 5. Rules ----
    H1('5. Rules the System Enforces (and Why)'),
    P('These are deliberate protections, not bugs.'),
    BOLDLEAD('Every expense starts Pending. ', 'No spending record enters the books without passing an authorized approver — the four-eyes principle, enforced by the system.'),
    BOLDLEAD('Rejection requires a written reason. ', 'The submitter always learns why, and the reason is permanently recorded.'),
    BOLDLEAD('Large amounts need higher authority. ', 'Above the approval threshold (default ETB 1,000,000), Approve-level users are refused — only Full control can approve. Institutions can tune the threshold in Budget Settings.'),
    BOLDLEAD('Approved and paid expenses cannot be edited; paid can never be deleted. ', 'Decided money is history. Corrections are made with new entries, never by rewriting.'),
    BOLDLEAD('Only the submitter can edit or delete their pending expense. ', 'Accountability stays with the person who filed it; even deletions are soft and remain in the revision trail.'),
    BOLDLEAD('A budget with expenses cannot be deleted. ', 'Financial history is preserved — archive instead.'),
    BOLDLEAD('Vendors and receipts are hidden below Approve level. ', 'Sensitive supplier details are visible only to people with decision authority.'),
    BOLDLEAD('Single-currency arithmetic. ', 'Totals are computed in the budget currency (ETB by default); foreign funding is converted at its recorded exchange rate rather than silently mixed.'),

    // ---- 6. FAQ ----
    H1('6. Troubleshooting & FAQ'),
    table([
      ['Question / symptom', 'Answer'],
      ['"Approve/Reject fails with a permissions error."', 'The buttons appear for every pending expense, but the decision requires Approve-level budget access. Org Owners/Admins have it automatically; everyone else must be granted it.'],
      ['"Approval failed on a big expense."', 'Amounts above the approval threshold (default ETB 1,000,000) need Full control. Either a Full-control user approves it, or the threshold is changed in Budget Settings.'],
      ['"Vendor shows [REDACTED] and I can’t open the receipt."', 'The account has Edit-level access; vendors and receipts unlock at Approve level. This is intentional.'],
      ['"I can’t delete this budget."', 'It has expenses — budgets with financial history can only be archived, and deletion itself requires Full control.'],
      ['"I can’t edit/delete my expense."', 'Only the submitter can, and only while it is still Pending (or Rejected). Approved expenses are locked; Paid is permanent.'],
      ['"The Forecasting / Income tab is missing."', 'Hidden by the organization preset: NGO and Education presets have no Forecasting; Education also hides Income. An Owner/Admin can enable them under Settings → Customization.'],
      ['"Where do I add income?"', 'There is no separate income form — record external funding as Additional funding sources on the budget itself; the Income page displays them.'],
      ['"Spent totals differ between pages."', 'The overview, reports, and forecasting count approved expenses; a budget’s detail page counts approved + paid; pending amounts are always shown separately. Compare like with like.'],
      ['"The sprint report’s budget line doesn’t match the expense ledger."', 'Sprint budget figures come from task-level cost estimates and actuals of delivered issues, captured once at sprint completion — a delivery-cost view, not the expense approval ledger. See the Sprints guide.'],
      ['"Members see no money pages at all."', 'Correct — everyone starts at No access. Grant View only / Edit / Approve per person as institutional roles require.'],
    ], 3400, 5960),

    // ---- 7. Benefits ----
    H1('7. Why This Design — the Benefits'),
    H2('For teams'),
    B('Filing an expense is one form — or one photo of a receipt, read automatically by AI.'),
    B('Submitters always hear back, with the reason on record when something is rejected.'),
    H2('For finance officers and managers'),
    B('A real approval workflow with thresholds — routine amounts move fast, large amounts escalate automatically.'),
    B('Categories with government accounting codes make the budget mirror the official chart of accounts.'),
    B('Live utilization, CSV-exportable reports, and three-month forecasts with early risk flags at 75% and 90%.'),
    H2('For government, NGO, and enterprise leadership'),
    B('Segregation of duties by construction: submitting, approving, and paying are separate powers; access is granted per person, not assumed from job titles.'),
    B('A complete revision trail: every budget edit, approval, rejection, payment, and deletion is permanently recorded — aligned with INSA audit expectations.'),
    B('ETB-first with controlled multi-currency funding for donor-funded work (NGO preset), and public-transparency support for government budgets.'),

    // ---- 8. Under the hood ----
    H1('8. Under the Hood (Senior Support Reference)'),
    B('One budget per project (enforced by the database). Lifecycle: DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → CLOSED/CANCELLED. Categories support parent/child nesting and accounting codes.'),
    B('Budget access ladder: NO_ACCESS < VIEW_ONLY < EDIT < APPROVE < FULL_CONTROL, stored per org member with an optional per-project override (project level wins). Org Owner/Admin resolve to FULL_CONTROL when unset.'),
    B('Expense statuses: PENDING → APPROVED/REJECTED → PAID, with a separate payment status (unpaid/partial/paid/refunded). Expense types: actual, committed, reserved.'),
    B('Data redaction is server-side: below Approve level the API itself returns vendor as [REDACTED] and no receipt URL — not just hidden in the UI.'),
    B('Spent-figure semantics: list/report/forecast endpoints count APPROVED expenses; the budget detail endpoint counts APPROVED + PAID. Forecasting is a client-side projection from burn rate with confidence decreasing over the horizon.'),
    B('Sprint linkage: at sprint completion, budgetPlanned/budgetInvested snapshot the task-level cost estimates/actuals of delivered issues in the org currency — independent of the expense ledger, recorded once, audited.'),
    B('Financial audit trail: budget edits and expense decisions write BudgetRevision records; expense approval/rejection actions are part of the org audit-log catalogue (Dashboard → Settings → Audit log, Owner/Admin).'),

    // ---- 9. Navigation map ----
    H1('9. Where Everything Lives'),
    table([
      ['I want to…', 'Go to'],
      ['Budget overview / upload a budget document / drop a receipt', 'Dashboard → Budget'],
      ['Submit, approve, reject, pay expenses', 'Dashboard → Budget → Expenses'],
      ['See funding sources', 'Dashboard → Budget → Income'],
      ['Reports (CSV export)', 'Dashboard → Budget → Reports'],
      ['Forecasts and category risk flags', 'Dashboard → Budget → Forecasting'],
      ['Approval threshold and budget options', 'Dashboard → Budget → Settings'],
      ['Turn budget subpages on/off for the org', 'Settings → Customization (Owner/Admin)'],
    ], 4200, 5160),
  ],
});
