# Onekof — Sprint & Settings Architecture Design

**Date:** July 25, 2026 (v1.2)
**Prepared by:** Oli Tamrat, CTO — DAPS Analytics PLC
**Status:** APPROVED July 25, 2026 — Phase 1 implementation in progress
**Horizon:** Designed for the 5–10 year platform, not the demo

> **Founder decisions (July 25, 2026):** default sprint length **2 weeks**;
> completing a sprint requires **project ADMIN or above**; `terminologyScheme`
> column ships in Phase 1 with i18n mapping in Phase 2. All three baked into
> the sections below.

> **v1.1 changes from architect self-review:** (1) commitment snapshot moved from
> sprint *completion* to sprint *start* — measuring "committed" at the end hides
> scope churn and corrupts velocity data forever; (2) sprints and settings wired
> into the existing `UserActivity` + `OrgAuditLog` infrastructure from Phase 1
> (INSA audit posture; retrofitting audit history is impossible); (3) terminology
> question resolved with a concrete recommendation (§8).

---

## 1. Why these two, and why together

Sprints and the settings hierarchy are the two features where the **data model is the product**. UI can be rewritten in a weekend; a schema serving government tenants cannot. They are designed together because sprints are the first real *consumer* of the settings hierarchy (per-project estimation units, workflow enforcement, terminology), which forces the settings design to be real rather than speculative.

We adopt Jira's core concepts, not its implementation or bloat:

| Adopt | Reject |
|---|---|
| Sprint as a first-class DB entity with a lifecycle | Parallel sprints, cross-project boards (v1) |
| Org → Project → User settings resolution | Jira's screen-scheme/field-scheme labyrinth |
| DB-driven workflow transitions per project | Marketplace/app framework |
| Completion snapshots enabling velocity reports | Real-time burndown event sourcing (v1) |

---

## 2. Current state (verified by schema audit, July 25)

Facts the design must respect — not assumptions:

1. **Sprints are greenfield but pre-declared.** No Sprint model, route, or UI exists. However `ProjectTemplate.SCRUM` is already an enum value, `project-types.ts` declares `Sprint` views and `sprint-overview`/`velocity-chart` widgets, and 4 i18n keys reference sprints across all 5 languages. The contract exists; the machinery doesn't.
2. **Task is project-scoped, not org-scoped.** No `organizationId` on Task — all org checks join through `project.organizationId`. All 10 Task indexes are projectId-led. A Sprint must therefore be **project-scoped**.
3. **`Task.estimate` is `Int?` hours**, with epic-level `_sum` rollup already proven in `/api/epics/[id]`. No story-point field exists.
4. **Ordering primitive:** `backlogOrder Int?` with a ×1000 gap scheme, PATCH-one-row. The backlog page is a single flat droppable — no grouping concept.
5. **Settings hierarchy is one level deep.** `OrganizationSettings` is a real 1:1 table (typed columns + 6 Json feature blobs + `String[] enabledSections`). There is **no project-level or user-level settings table**. `Project.settings Json` holds only `{color, icon}`; `Organization.settings`/`features` Json columns are dead.
6. **The inheritance precedent already in the schema:** `ProjectMember.budgetAccess BudgetAccess?` — nullable at project level, null = inherit from org. We generalize this exact pattern.
7. **The workflow engine is hardcoded and OFF.** `workflow-engine.ts` has a static transition table; its one production caller passes `enforceWorkflow: false` as a literal. The file header itself says "Future: per-project custom workflows stored in database."
8. **`/api/issues/bulk`** supports exactly 4 actions (`updateStatus`, `updatePriority`, `updateAssignee`, `delete`), max 100 ids, bypasses the workflow engine, and has a latent bug: any non-DONE status change nulls `completedAt` unconditionally.
9. **Known client-side bug:** `OrganizationSettingsProvider` is mounted without `organizationId` (circular-dependency workaround in providers.tsx), so org settings **never actually load in the client** — the whole app runs on hardcoded defaults. Any settings work must fix this plumbing first.
10. **Migrations are hand-authored idempotent SQL** (`IF NOT EXISTS`, `"public".`-qualified), and every new model/enum must carry `@@schema("public")` or Prisma validation fails. `20260410_add_backlog_status` is the style precedent.

---

## 3. Sprint design

### 3.1 Schema

```prisma
enum SprintStatus {
  PLANNED
  ACTIVE
  COMPLETED

  @@schema("public")
}

enum EstimationUnit {
  HOURS
  POINTS

  @@schema("public")
}

model Sprint {
  id        String  @id @default(cuid())
  projectId String  @map("project_id")
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  name     String                              // "Sprint 3" / "Phase 2 — Data Collection"
  goal     String?
  status   SprintStatus @default(PLANNED)
  position Int          @default(0)            // ordering among a project's sprints

  startDate DateTime? @map("start_date")       // required to START, not to create
  endDate   DateTime? @map("end_date")

  // Snapshots — committed* written once at START (what the team signed up for),
  // completed* written once at COMPLETION. Measuring "committed" at the end
  // would silently absorb mid-sprint additions and make scope churn — the
  // number one predictability metric — unmeasurable. Velocity and churn become
  // plain queries, never a rebuild.
  committedCount     Int?      @map("committed_count")     // at start
  committedEstimate  Int?      @map("committed_estimate")  // at start, in the project's EstimationUnit
  completedCount     Int?      @map("completed_count")     // at completion
  completedEstimate  Int?      @map("completed_estimate")  // at completion
  completedAt        DateTime? @map("completed_at")
  rolloverTargetId   String?   @map("rollover_target_id")   // sprint unfinished items moved to (null = backlog)

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  createdBy String    @map("created_by")

  tasks Task[]

  @@index([projectId, status, deletedAt])
  @@index([projectId, position])
  @@map("sprints")
  @@schema("public")
}
```

Task additions (all nullable — zero impact on existing rows):

```prisma
model Task {
  // ...existing fields unchanged...
  sprintId    String? @map("sprint_id")
  sprint      Sprint? @relation(fields: [sprintId], references: [id], onDelete: SetNull)
  sprintOrder Int?    @map("sprint_order")     // ordering inside a sprint; backlogOrder stays for backlog
  storyPoints Int?    @map("story_points")     // estimate stays as hours; project settings pick which is used

  @@index([sprintId, sprintOrder])
}
```

**Key decisions and why:**

- **`Task.sprintId` nullable FK, null = backlog.** Single-field move between backlog and sprint; task history survives sprint completion; `onDelete: SetNull` means deleting a sprint returns items to backlog rather than destroying them.
- **One ACTIVE sprint per project**, enforced at the database, not in application code:
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS "sprints_one_active_per_project"
  ON "public"."sprints" ("project_id") WHERE status = 'ACTIVE' AND deleted_at IS NULL;
  ```
  Prisma can't express partial indexes, but hand-authored SQL migrations are already the house style. Parallel sprints later = drop one index, no schema change.
- **Completion snapshot lives on the Sprint row.** Velocity = `SELECT` over completed sprints. We deliberately do NOT build an event-sourced burndown in v1 — an approximate burndown is derivable from `Task.completedAt` within the sprint window, which is honest and free.
- **`estimate` (hours) and `storyPoints` coexist.** Government/consulting projects think in hours; software teams in points. The project's `estimationUnit` setting (§4) decides which one the sprint UI sums. Both columns are cheap; converting a live tenant later is not.
- **Terminology is i18n, not schema.** The model is `Sprint`; government-facing orgs see "Work Cycle / Phase" via `OrganizationSettings.terminologyScheme` (§8 Q3). No schema fork.
- **Dates are stored UTC Gregorian**, like every other date in the schema; the existing Ethiopian-calendar rendering layer displays them per user preference. Sprints add nothing calendar-specific to the database.

### 3.2 Sprint lifecycle (state machine)

```
            create                    start                       complete
  (none) ────────────► PLANNED ────────────────► ACTIVE ────────────────────► COMPLETED
                          │      requires:                requires: rollover
                          │      startDate+endDate,       decision for every
                          │      no other ACTIVE          unfinished item
                          └──── delete (soft) — items return to backlog (SetNull)
```

- **Start** is a transaction: validates dates; the partial unique index guarantees single-ACTIVE atomically (constraint violation → clean 409, no TOCTOU race); **writes the commitment snapshot** (`committedCount`/`committedEstimate` computed from the tasks in the sprint at that moment).
- **Complete** is a transaction: caller chooses `rolloverTo: 'backlog' | sprintId`; unfinished tasks get `sprintId` updated accordingly; `completedCount`/`completedEstimate` are computed and written; status flips to COMPLETED. The decision is *recorded* (`rolloverTargetId`) — this is the corner cheap implementations cut that kills reporting later.
- **Mid-sprint scope changes are visible, not silent.** Moving a task into or out of an ACTIVE sprint emits a `TASK_SPRINT_CHANGED` activity (§3.4). Scope churn per sprint = count of those events vs the commitment snapshot — an honest predictability metric with zero event-sourcing machinery.
- COMPLETED is terminal. Reopening is deliberately not supported in v1 (audit-friendly for government clients); a new sprint is the answer.

### 3.3 API surface

```
GET    /api/projects/[id]/sprints              list (status filter)
POST   /api/projects/[id]/sprints              create (PLANNED)
PATCH  /api/sprints/[id]                       edit name/goal/dates/position
POST   /api/sprints/[id]/start                 lifecycle: PLANNED → ACTIVE
POST   /api/sprints/[id]/complete              lifecycle: ACTIVE → COMPLETED (body: rollover target)
DELETE /api/sprints/[id]                       soft delete (PLANNED only)
```

Task assignment reuses existing routes — `PATCH /api/issues/[id]` accepts `sprintId`/`sprintOrder` (added to `updateIssueSchema`), and `/api/issues/bulk` gains a 5th action `moveToSprint` (its existing `value: string` scalar fits `sprintId`; `"null"` sentinel → backlog). While in that file we fix the two audited defects: the unconditional `completedAt` nulling, and bulk bypassing the workflow engine.

All sprint routes enforce tenancy the codebase's standard way: sprint → project → `organizationId`, with `requireProjectAccess` (which now correctly ranks OWNER after this week's fix).

### 3.4 Audit & activity integration (v1.1 — moved into Phase 1)

The platform already has two audit rails the original draft failed to use — `UserActivity` (entity-generic: `entityType`/`entityId`/`action`/`before`/`after`, org feed + entity-history indexes) and `OrgAuditLog` (tamper-evident record of privileged actions, built for INSA compliance). Sprints and settings plug into both from day one, because audit history cannot be retrofitted — events not recorded are gone.

**`ActivityType` enum additions** (idempotent `ALTER TYPE ... ADD VALUE IF NOT EXISTS` in the same migration):

```
SPRINT_CREATED  SPRINT_UPDATED  SPRINT_STARTED  SPRINT_COMPLETED  SPRINT_DELETED
TASK_SPRINT_CHANGED          // task moved into/out of a sprint (scope churn signal)
PROJECT_SETTINGS_CHANGED     // any ProjectSettings write, before/after captured
```

**Recording rules:**

- Every sprint lifecycle transition and every ProjectSettings write emits a `UserActivity` with `before`/`after` — this powers the org activity feed, entity history, and future undo, using the existing indexes (no new query paths).
- **`OrgAuditLog` additionally records the privileged/irreversible ones:** sprint completion (writes permanent snapshots), sprint deletion, and all settings changes (org + project). These are exactly the actions a government auditor asks about.
- Emission lives in the API route transaction, matching how existing routes write activities — no new eventing framework.

---

## 4. Settings architecture

### 4.1 The three-layer model

```
OrganizationSettings  (exists — typed table)         "what this org allows and defaults to"
        ▲ inherit (null = fall through)
ProjectSettings       (NEW — typed table, 1:1)       "what this project overrides"
        ▲ inherit
User.preferences      (exists — Json, shallow-merge)  "how this person likes their UI"
```

Each layer stores **only what it overrides** — the `ProjectMember.budgetAccess` nullable pattern, generalized. Resolution happens in exactly one shared server utility so every API and page computes the same effective value:

```ts
// apps/web/src/lib/settings/resolve.ts
resolveProjectSettings(projectId): EffectiveProjectSettings
// org defaults ← project overrides; every field non-null in the result
```

### 4.2 ProjectSettings v1 — only fields with a real consumer

We refuse speculative settings. Every v1 field has a feature consuming it at launch:

```prisma
model ProjectSettings {
  id        String  @id @default(cuid())
  projectId String  @unique @map("project_id")
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  sprintsEnabled      Boolean?        @map("sprints_enabled")       // null=inherit; org default: template==SCRUM
  estimationUnit      EstimationUnit? @map("estimation_unit")       // consumed by sprint UI/reports
  enforceWorkflow     Boolean?        @map("enforce_workflow")      // finally wires the dormant engine
  workflowTransitions Json?           @map("workflow_transitions")  // null = engine's default table; validated by zod
  extra               Json  @default("{}")                          // escape hatch — same role Project.settings played

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([projectId])
  @@map("project_settings")
  @@schema("public")
}
```

- `Project.settings` Json (currently `{color, icon}` only) is left untouched and frozen; new config goes here. Migrating those two keys is a cosmetic cleanup, not a blocker.
- `Organization.settings`/`features` dead Json columns: marked deprecated in schema comments; dropped in a later cleanup migration once confirmed unread in production.

Org-level counterparts added to `OrganizationSettings`: `sprintsEnabledDefault Boolean @default(false)`, `estimationUnitDefault EstimationUnit @default(HOURS)`, `enforceWorkflowDefault Boolean @default(false)` — typed columns, matching that table's existing style.

### 4.3 Repairs to the existing layer (prerequisites, not nice-to-haves)

1. **Fix the provider gap.** `OrganizationSettingsProvider` currently never receives `organizationId`, so real org settings never load client-side. Resolution: mount it *inside* `WorkspaceProvider` and feed it `currentOrganization.id` (the circular dependency the comment feared doesn't exist in that direction).
2. **Zod on the settings API.** The PUT dereferences `body.features.X` unguarded → 500s on malformed input. Add a schema; add `PATCH` for field-level updates so the triplicated 20-field mapping stops growing.
3. **Replace localStorage "settings" pages.** `issues/settings` and siblings persist to localStorage with a fake spinner. They become real consumers of ProjectSettings / User.preferences.
4. **User.preferences stays Json** but gains a typed TS shape and a documented deep-merge rule for namespaced keys (`preferences.issues.defaultView`), since the current shallow merge would clobber nested objects.

### 4.4 Workflow enforcement — the first proof of the hierarchy

Phase 4 flips the dormant engine on, driven by settings:

- `validateStatusTransition` reads the project's effective `workflowTransitions ?? DEFAULT_TRANSITIONS` and `enforceWorkflow`.
- Both `/api/issues/[id]` **and** `/api/issues/bulk` consult it (closing the audited bypass).
- A minimal project-settings UI: toggle enforcement, view the transition matrix. A visual transition *editor* is a stretch goal, explicitly not v1.

This is Jira's "Work items admin" reduced to the part with proven value.

---

## 5. Migration plan

One migration, house style (idempotent, `"public".`-qualified, modeled on `20260410_add_backlog_status`):

```
20260726_add_sprints_and_project_settings/migration.sql
  CREATE TYPE IF-guards for SprintStatus, EstimationUnit
  CREATE TABLE IF NOT EXISTS "public"."sprints" (...)
  ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS sprint_id / sprint_order / story_points
  CREATE TABLE IF NOT EXISTS "public"."project_settings" (...)
  ALTER TABLE "public"."organization_settings" ADD COLUMN IF NOT EXISTS (3 defaults + terminology_scheme)
  ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS (7 sprint/settings values, §3.4)
  CREATE UNIQUE INDEX IF NOT EXISTS sprints_one_active_per_project (partial)
  + supporting indexes
```

Every new model/enum carries `@@schema("public")`. All new Task columns nullable → **zero backfill, zero downtime, existing queries untouched**. Rollback = drop objects; no destructive change to existing tables. Seed script gains one demo sprint per SCRUM project.

Reminder from the migrations README: production Supabase requires the `0_init` baseline to be marked applied — this migration must be verified against a fresh DB *and* the baseline-reconciled path.

---

## 6. Phased build order

| Phase | Scope | Risk | UI change |
|---|---|---|---|
| **1. Foundation** | Migration; Sprint CRUD + lifecycle API (start writes commitment snapshot); activity + `OrgAuditLog` emission (§3.4); `resolveProjectSettings`; ProjectSettings API; provider-gap fix; zod on settings; `updateIssueSchema` + bulk `moveToSprint`; bulk `completedAt` bugfix; tests | Schema — highest scrutiny | **None** (dark launch) |
| **2. Sprint planning** | Backlog page → Sprint section + Backlog section, drag between, sprint create/edit/start; Sprint tab in ISSUES_TABS gated by `sprintsEnabled` | Medium | Backlog page |
| **3. Active sprint & reports** | Board filter to active sprint; completion dialog w/ rollover; sprint report (committed vs completed, velocity list) | Low | Board + new report |
| **4. Settings UI & workflow** | Project settings page (real persistence); enforcement wired incl. bulk; transition matrix view | Low-medium | Settings pages |

Each phase is an independent PR against the Vercel-validated pipeline; Phase 1 ships with the feature invisible (no UI), so schema soaks in production before users touch it.

## 7. Non-goals (v1) — recorded so they're decisions, not omissions

Parallel sprints per project (schema-ready, index-gated) · cross-project sprints · capacity/workload planning · event-sourced burndown · visual workflow editor · custom fields framework · per-team settings layer (`AutomationRule.scope` shows TEAM will slot in later).

---

## 8. Open questions for founder review

1. **Default sprint length** when auto-filling dates: 2 weeks (software convention) or 4 weeks (matches government reporting cadence)?
2. **Should completing a sprint require OWNER/ADMIN project role**, or may any MEMBER complete it? (Recommend ADMIN+ — completion writes permanent snapshots and an `OrgAuditLog` entry.)
3. **Terminology** (v1.1 — resolved with a recommendation): add one column now, build the UI later. `OrganizationSettings.terminologyScheme` (`'AGILE' | 'FORMAL'`, default `AGILE`) ships in the Phase 1 migration — one cheap nullable-with-default column. The i18n layer maps it in Phase 2: `FORMAL` renders "Work Cycle / የስራ ዙር" instead of "Sprint" across all 5 languages. Government demos get formal terminology from the first sprint UI we ship, and no schema change is ever needed for it again.
