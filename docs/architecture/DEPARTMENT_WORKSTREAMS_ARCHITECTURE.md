# Department & Workstream Architecture — First-Class Issue Classification & Industry Availability

> **Status: v1.2 — APPROVED (founder approved Decisions D1–D9, 2026-07-28: "go ahead with the plan and start building it right")**
> v1.1 adds Part II (D6–D9): industry-based availability of department sections, closing the gap between the planned per-industry experience and the delivered one-sidebar-for-all.
> Author: Oli Tamrat, CTO — DAPS Analytics PLC
> Related: `SPRINT_AND_SETTINGS_ARCHITECTURE.md` (approved v1.2) — this document follows the same design method: enterprise-grade core now, org-level configurability later, nothing that requires rewriting history.

## 1. Problem

Department pages (Development → Releases/Code Review, Marketing → Campaigns/Social/Analytics, Operations → Incidents/Monitoring/Checklists, Research → Data/Findings/Plans/Materials/Inspections) are **label-filtered lenses** over the single issue store. Each page stamps `defaultLabels` (e.g. `['development','release']`) on creation and filters by them on read.

This architecture is correct in its fundamentals — one issue store means one search, one board, one sprint pool, one reporting pipeline — but the classification mechanism is wrong for an enterprise product:

1. **Invisible** — creating under Releases never says the task will be tagged; the Issues page never says a task belongs to Releases. Founder testing surfaced exactly this confusion.
2. **Fragile** — membership is a user-editable free-text label. Editing labels silently removes an issue from its department view. No warning, no audit.
3. **Unqueryable at the DB level** — labels are a JSON array; department reporting ("all open Operations incidents across projects") cannot use an index.
4. **Institutionally weak** — for government/INSA posture, "belongs to Operations because a deletable string says so" is not a classification, it's a hint.

Meanwhile `Project.department` and `User.department` are already first-class (free String) — issues never got the same treatment.

## 2. Current taxonomy (extracted from the live pages — this is the seed catalog)

| Department | Workstreams |
|---|---|
| `development` | `backlog`, `code-review`, `release` |
| `marketing` | `analytics`, `campaign`, `social-media` |
| `operations` | `checklist`, `incident`, `monitoring` |
| `research` | `data`, `findings`, `inspection`, `materials`, `plan` |

Two levels, consistently. The design promotes exactly this shape.

## 3. Decisions (D1–D5)

### D1 — Two nullable String fields on Task, validated against a code-versioned catalog. NOT a DB enum.

```prisma
model Task {
  department  String?  // e.g. "operations"
  workstream  String?  // e.g. "incident"
  @@index([projectId, department, workstream])
}
```

- **Why not an enum:** departments are *organizational vocabulary*. A ministry has Directorates; an NGO has Programs; a university has Faculties. Postgres enums are global and painful to evolve. Strings + a validation catalog in code (`lib/departments/catalog.ts`) ship the same safety today and leave a clean path to **org-defined departments** (an OrgSettings-driven registry, same pattern as `terminologyScheme`) without a schema migration.
- **Why nullable:** most issues legitimately belong to no department (a project task is not departmental work). Null means "general" — never backfilled to a fake value.
- **Alignment:** values are the same slugs the routes and i18n keys already use (`departmentTabs.*`), and are compatible with the free-string `Project.department` / `User.department` for a future unified registry.

### D2 — Set by context, changed only deliberately, always audited. NOT hard-immutable.

- Department pages stamp `department`/`workstream` on creation (replacing label-stamping).
- The fields are **never free text in the UI** — only a controlled selector (catalog values) shown in the issue slideout, editable by project MEMBER+.
- Every change emits `TASK_DEPARTMENT_CHANGED` activity (new ActivityType via `ALTER TYPE ... ADD VALUE IF NOT EXISTS`), recording old → new.
- **Hard immutability rejected:** mis-filed issues must be correctable by the people doing the work. The enterprise guarantee is a *complete audit trail of changes*, not a lock — the same philosophy as sprint scope-churn (measure honestly rather than forbid).

### D3 — Migration backfills from the existing labels; labels are untouched and revert to free-form user tags.

Idempotent SQL (`IF NOT EXISTS` columns, `WHERE department IS NULL` backfill):

- `department` := the first label matching a catalog department; `workstream` := the first label matching that department's workstreams.
- Existing labels are **left in place** — from this point on labels carry zero structural meaning; they are user tags again (their honest role).
- Re-running the migration is a no-op (double-apply validated on scratch Postgres, per project standard).

### D4 — Transition read path: field-first with one-release label fallback.

Phase 2 department pages filter `department = X OR (department IS NULL AND labels ∋ X)` so nothing disappears if code deploys before the DB Migrate workflow runs. The fallback is deleted in Phase 3. (Same dark-launch discipline as sprints Phase 1.)

### D5 — Surfaced everywhere an issue is summarized.

- `GET /api/issues?department=&workstream=` (indexed), accepted by zod alongside existing filters.
- Department chip on board/list cards and in the slideout (i18n via existing `departmentTabs.*` keys, all 5 locales).
- Department pages get a small standing note: "Items created here are classified Development / Release" — the visibility fix that motivated this work.

## 4. Phases

| Phase | Scope | Migration? |
|---|---|---|
| **1 — Dark launch** | Schema + idempotent migration + backfill; catalog module; zod + API accept/filter; `TASK_DEPARTMENT_CHANGED` activity type; tests. Zero UI change. | Yes — `add_task_department_workstream` |
| **2 — Department pages switch over** | `DepartmentTaskList` creates with fields and filters field-first (D4 fallback); classification note on pages; slideout shows + edits via controlled selector (audited). | No |
| **3 — Everywhere + cleanup** | Chips/filters on main Issues list & board; drop label fallback; i18n keys ×5 (flag for linguist); Projects/Issues support-guide regenerated same-PR (per docs versioning rule). | No |
| **Future (not now)** | Org-defined department registry in OrgSettings (ministry Directorates, NGO Programs) feeding the same fields; alignment of `Project.department`/`User.department` to the registry. Designed-for, deliberately deferred. | — |

---

# Part II — Industry Availability (D6–D9)

## 5. Problem: the planned per-industry experience was never wired

The plan: organizations choose their type at account creation (government, NGO, tech, education, healthcare…) and the sidebar/features adapt. The delivery diverged in three places, verified in code:

1. **Ungated sections.** `DashboardSectionId` (the vocabulary presets and the sidebar filter share) contains 13 values — `development`, `marketing`, `operations`, `research`, and `knowledge` are not among them. The sidebar filter gates what it knows and passes through the rest, so the department sections render for every organization unconditionally.
2. **Onboarding never captures organization type.** It asks name/URL/team-size only. Presets are applied solely by the Settings → Customization page — which no navigation links to (recorded product finding). `Organization.industry String?` exists in the schema and is never written at signup.
3. **Missing settings fail open** — an org with no settings record (i.e., every org created through onboarding) shows everything.

Result: all test accounts across industries have identical sidebars. Classification (Part I) and availability (Part II) are two halves of one foundation: Part I says *what an issue is*; Part II says *who gets which lenses*.

### D6 — Extend the section vocabulary and gate the department sections like everything else

Add to `DashboardSectionId`: `'development' | 'marketing' | 'operations' | 'research' | 'knowledge'` plus vertical modules `'medical' | 'courses'`. The sidebar filter gates them via `enabledSections` exactly as it gates `teams`/`budget` today. The `Task.department` catalog (Part I) stays global — classification remains valid data even when an org hides the section (hiding a lens must never corrupt the record).

### D7 — Onboarding captures organization type; preset applied at creation

- New onboarding step (with the existing role/workspace steps): "What kind of organization is this?" — Government/Ministry · NGO/Non-Profit · Business/Tech · Education · Healthcare · Other.
- Writes `Organization.industry` and creates the OrganizationSettings record from the matching preset **atomically at workspace creation** — no orphan window.
- The Customization page is linked into Settings navigation (fixes the orphan finding). Presets remain defaults, not locks — Owner/Admin can still toggle any section, preserving the existing philosophy.

### D8 — Industry capability matrix (preset definitions)

Core for every industry: Projects, Issues, Sprints/Work Cycles, Teams, Goals, Budget, Documents, Docs/Wiki (knowledge), Calendar, Timeline, Reports.

| Section | Government | NGO | Business/Tech | Education | Healthcare |
|---|---|---|---|---|---|
| Development | — | — | ✓ | — | — |
| Marketing | — | ✓ (outreach/campaigns) | ✓ | — | — |
| Operations | ✓ | ✓ | ✓ | — | ✓ |
| Research | ✓ | ✓ | — | ✓ | ✓ |
| Knowledge (wiki/docs) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Automations + AI | — | — | ✓ | — | — |
| Compliance | ✓ | — | — | — | ✓ |
| Impact | — | ✓ | — | — | — |
| Medical & Patients | — | — | — | — | ✓ |
| Courses | — | — | — | ✓ | — |
| Budget flavor | procurement + transparency + approval | grants + donations + multi-currency | forecasting + multi-currency | grants, simplified | approval workflow |

- **Healthcare becomes the fifth preset** (currently missing; the medical/patients modules exist with no preset that enables them).
- Other/unknown → Business preset (current fallback, unchanged).
- The matrix is the founder-approvable artifact — amend cells freely; the mechanism is identical whatever the cells say.

### D9 — Fail posture: fail to the preset, not to everything

When an org's settings record is missing, derive `enabledSections` from `Organization.industry`'s preset instead of showing all. True fail-open remains only for legacy orgs with neither settings nor industry — and those get a dismissible admin banner ("Choose your organization type") linking to Customization, which is how existing test accounts converge without a forced migration.

## Part II phases

| Phase | Scope |
|---|---|
| **A** | Vocabulary extension + sidebar gating + matrix encoded in presets + Healthcare preset. Code-only; existing orgs unaffected (legacy fail-open until D9 banner acted on). |
| **B** | Onboarding org-type step, `Organization.industry` write + atomic settings creation, Customization link in Settings nav, legacy-org banner. |

Part I and Part II are independently shippable; Part I Phase 1 and Part II Phase A can proceed in parallel once approved.

## 7. Non-goals

- No per-department permissions (departments are classification, not access control — access stays with project visibility/roles).
- No forced classification of general project work (null is a first-class value).
- No new sidebar sections — this changes what the existing pages stand on, not what they look like.

## 8. Testing

- Catalog module: pure unit tests (validation, department/workstream pairing).
- Backfill: SQL applied twice against seeded scratch DB — classification correct, idempotent, labels untouched.
- API: filter + create/patch validation, audit emission on change.
- D4 fallback: field-less labeled issue still appears on its department page in Phase 2, and after backfill the field wins.
