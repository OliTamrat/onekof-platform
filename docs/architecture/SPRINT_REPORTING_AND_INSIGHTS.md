# Onekof — Sprint Reporting & Insights Architecture

**Date:** July 25, 2026
**Prepared by:** Oli Tamrat, CTO — DAPS Analytics PLC
**Status:** Tier 1 APPROVED & IMPLEMENTED with this document · Tier 2 DESIGNED — build on founder go-ahead
**Parent:** SPRINT_AND_SETTINGS_ARCHITECTURE.md (delivered Phases 1–4, July 25, 2026)

---

## 1. The horizon test

Every element below was challenged against one question: *does this serve the
market in year five, not just the demo next week?* The conclusions that shaped
the design:

1. **Reports must outlive their data's churn.** Ministries will ask "what did
   Q2 2027's cycles deliver" in 2030. Everything here computes from the
   write-once sprint snapshots plus surviving task rows — never from replayed
   event history that PII cleanups, project archival, or schema evolution can
   corrupt.
2. **The report IS the product for government buyers.** A ministry PM's real
   deliverable is the paper their director receives. Tier 2's branded export is
   therefore not a nice-to-have — it is the artifact procurement evaluates.
   It must render on Tier 2 on-prem deployments with zero external calls
   (no chart CDNs, no font CDNs — Ge'ez fonts embedded).
3. **Contribution, not surveillance.** Per-assignee numbers are framed as
   sprint contribution (what shipped, hours invested). Cross-sprint individual
   ranking/scoring is a **deliberate non-goal** until customers bring their own
   HR policy context — people-analytics in government settings has legal and
   union implications Onekof must not stumble into by default.
4. **Money is audit surface.** Budget-per-sprint will be read by auditors, so
   it gets the same treatment sprints got: snapshot at completion, immutable,
   org-audited — designed first, built second (Tier 2, not rushed into Tier 1).
5. **Visual language is validated, not eyeballed.** Charts follow the dataviz
   procedure: form chosen by the data's job, single-hue marks where the job is
   progress-to-target, direct labels so nothing is color-alone, palette checks
   run by validator. The committed-vs-completed visual is a **bullet bar**
   (committed = structural track, completed = teal fill, numbers labeled) —
   deliberately NOT a two-color paired bar, which failed color-vision
   separation checks (teal↔gray ΔE 2.9 deutan).

---

## 2. Tier 1 — Sprint Insights (implemented)

Where: the Sprints tab. No schema change, no migration — reads existing data.

### 2.1 Data sources (all existing)

| Question | Source |
|---|---|
| Committed / completed counts & estimates | `Sprint.committed*` / `completed*` snapshots (write-once) |
| Which issues shipped in the sprint | `Task.sprintId = sprint.id` (rollover moves unfinished away at completion, so remaining = delivered) |
| Who did what, time invested | `Task.assignee`, `Task.timeSpent`, `Task.estimate` / `storyPoints` |
| Duration | `Sprint.startDate → endDate` |

### 2.2 Surface

- **Completed sprint rows are expandable.** Collapsed: name, dates, bullet
  bar (completed/committed), counts. Expanded:
  - Goal + duration in days
  - **Completion bullet bar** with direct "N of M" label and estimate totals
    in the project's effective estimation unit
  - **Contribution table**: assignee · issues done · time spent · estimated —
    computed by a pure, unit-tested aggregator (`insights.ts`), unassigned work
    shown honestly as "Unassigned"
- **Velocity** stays in the report header (rolling 3-sprint average).
- All labels flow through `t()` with the org's terminology scheme; totals
  respect HOURS vs POINTS resolution from the settings hierarchy.

### 2.3 Non-goals in Tier 1 (so they are decisions, not omissions)

Charts beyond the bullet form (burndown lines, cumulative flow), budget
figures, churn surfacing, export. Each is Tier 2+ with its own design below.

---

## 3. Tier 2 — designed, awaiting build go-ahead

### 3.1 Budget invested per sprint

- **Data path:** `TaskBudget` allocations already tie tasks to budget
  categories, each carrying `estimatedCost` and `actualCost` with a currency.
- **Two snapshots, not one (build refinement):** completion writes
  **`budgetPlanned`** (Σ estimated) and **`budgetInvested`** (Σ actual) —
  planned-vs-actual is the pair ministries reconcile, and a snapshot that
  wasn't taken can never be retrofitted.
- **Currency rule:** sums include only allocations in the org's
  `budgetCurrency` — adding ETB to USD is a lie; multi-currency rollups wait
  for an explicit FX policy (documented non-goal for now).
- **Audit rule:** computed figures drift when budgets are re-allocated later,
  so the snapshot is written once at completion (migration
  `add_sprint_budget_snapshot`, nullable = "not tracked"); fiscal rollups
  respect the Ethiopian July fiscal year start in
  `OrganizationSettings.fiscalYearStart`.
- **Emission:** both values + currency recorded in the completion
  `OrgAuditLog` entry.

### 3.2 Scope churn surfaced

- Phase 1 already records every mid-sprint membership change as
  `TASK_SPRINT_CHANGED` activity with `{from, to}` metadata.
- **New endpoint:** `GET /api/sprints/[id]/churn` → `{added, removed}` counted
  from `UserActivity` where `entityType='TASK'`, window = start→completion.
  Rendered as a small "scope change" line in the expanded insight panel with
  drill-down to the affected issues.
- Cost: one indexed query (`entityType, entityId, createdAt` index exists);
  no schema change.

### 3.3 Branded sprint report export (the ministry artifact)

- **Format:** PDF, A4, Onekof logo per document standards, generated
  server-side by `@react-pdf/renderer` (pure Node — no headless browser, works
  on Vercel serverless AND Tier 2 on-prem with no external fetches).
- **Content:** sprint header (project, dates, goal), completion bullet,
  contribution table, churn line, budget line (once 3.1 ships), velocity
  context, signature block (prepared-by / approved-by — ministries sign
  papers).
- **Localization:** rendered in the org's language with embedded Abyssinica
  SIL for Ge'ez scripts; terminology scheme respected ("Work Cycle Report").
- **Endpoint:** `GET /api/sprints/[id]/report.pdf` (project member+),
  generation logged to `OrgAuditLog` (documents leaving the system are audit
  events in INSA terms).

### 3.4 Deliberate non-goals (revisit only with explicit demand)

- Cross-sprint per-person performance scoring (policy-sensitive; see §1.3)
- Real-time burndown via event sourcing (approximate burndown from
  `completedAt` timestamps is derivable later at zero storage cost)
- Cross-project/program-level rollups (belongs to the reports section
  redesign, not the sprint page)

---

## 4. Build order

| Step | Scope | Needs |
|---|---|---|
| Tier 1 | Insight panel + contribution aggregator + tests | ships with this doc |
| 2a | Churn endpoint + insight line | small PR, no migration |
| 2b | Budget snapshot column + completion wiring + insight line | migration (idempotent, house style) |
| 2c | PDF export | `@react-pdf/renderer` dependency + fonts vendored |

Each step is an independent PR against the CI/Vercel pipeline; founder tests
after each, per the working rhythm established July 25.
