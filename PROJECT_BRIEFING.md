# Onekof Web Platform — Session Briefing
> Last updated: 2026-07-28 — Department & Workstream architecture COMPLETE (D1-D9, PRs #161-#171); Sprint & Settings + Reporting complete

---

## CURRENT STATUS (2026-07-28)

### Master HEAD: `8fead29` (609 commits, 148 PRs merged)
> Verified 2026-07-28: master contains every merged PR; the working branch
> `claude/audit-multilang-structure-sdvvS` is content-identical to master
> (stale ref only). One PR remains open: **#160** (draft, `remove-k6-tests`)
> — `tests/k6/` is still present in master, so that PR is genuinely pending.
> ~42 other remote branches are stale refs from squash-merged PRs; their
> content is in master. Recommend enabling repo setting "Automatically
> delete head branches" and pruning the rest (see TERMINAL AGENT HANDOFF).
### Git Tags: `v0.2.0` → `v1.0.0` → `v1.2.0` → `v1.3.0`
### Docker: `ghcr.io/olitamrat/onekof-web:1.3.0` (latest)

### Tier 3 (Vercel + Supabase) — LIVE
Web platform live at **onekof.com** and org subdomains.
TypeScript strict build: 0 errors. Sentry gracefully skips when DSN not set.
INSA security code (P1-P6): all implemented and certified.

### Tier 2 (Ethio Telecom ECS) — APPROVED, PENDING VM ORDER
- **INSA Certified:** 2026-07-03 (6-month validity, expires ~January 2027)
- **Recommended config (Scenario 2):** CSRAMOPT05 (4c/32GB/4Mbps) + ETZ Daily Backup = 126,815 ETB/6mo
- **Briefing doc:** `docs/deployment/ETHIO_TELECOM_CLOUD_PRICING_BRIEFING.html`
- **Docker image ready:** v1.3.0 on ghcr.io
- **onekof.et domain:** SECURED
- **Deploy script:** `deploy-et.sh` (online + offline modes)
- **Staging:** Remains on Vercel (free, no sovereignty impact — see briefing doc Section 7)

---

## MEDICAL MODULE (design approved to proceed 2026-07-28 — build, do not withdraw)

**Founder decision:** build the Medical vertical properly with design-doc discipline, rather than stripping the promise. Doc: `docs/architecture/MEDICAL_MODULE_ARCHITECTURE.md` — **PROPOSED v1.0, decisions M1-M8 await approval.**

**The gap founder testing exposed:** Healthcare orgs got correct gating (Operations/Research present, Development/Marketing absent) but the preset enabled `medical` + `compliance`, which **do not exist as sidebar sections at all** — dead switches. Behind them, `/dashboard/medical`, `/patients`, `/facilities`, `/equipment`, `/safety`, `/courses`, `/impact`, `/compliance` are ~19-line placeholders (title + empty state, button redirects to generic issue creation). Onboarding meanwhile promised Healthcare "Facility management, Medical projects, Compliance tracking, Resource allocation". This was **my incomplete Phase A work**: I added the vocabulary and the gates without the destinations.

**M0 SHIPPED immediately (honesty first, independent of M1-M8 approval):** presets no longer enable destination-less sections (medical/compliance/courses/impact removed from Healthcare/Ministry/Education/NGO); Customization no longer shows toggles that do nothing; the Healthcare onboarding promise now names what actually ships (incident & checklist operations, inspections & research, budget approval workflow, team coordination — 4 keys x 5 locales). **New guard test:** `NAVIGABLE_SECTION_IDS` is exported from the sidebar module as the single source of truth, and a test asserts **every enabled section in every preset has a navigation destination** — the check that would have caught this originally. 352 tests green.

**The decision that shapes the module (M1):** Onekof builds healthcare **operations**, NOT an EMR. Permanent non-goals: diagnoses, prescriptions, lab/imaging results, clinical notes. Crossing that line changes the regulatory class of the whole company. Other key proposals: patient identifiers encrypted at rest with a blind index (M2); patient access is its own ladder where **org Owner/Admin does NOT imply access** (M3); patient record **reads** are audited, not just writes (M4); **the module requires an in-country deployment** (M5); real hard-delete/retention rather than soft-delete (M6); care items are ordinary Tasks with a nullable `patientId` reusing board/sprints/workflow (M7); facilities/equipment/safety become Operations **workstreams**, not new departments (M8).

### M5/M6 researched and strengthened (2026-07-29) — doc now v1.1

**M5 was a hedge; it is now cited.** v1.0 said patient data "plausibly" falls under residency expectations. Ethiopia's **Personal Data Protection Proclamation No. 1321/2024** (in force 24 July 2024) is explicit: **Art. 22** requires personal data collected in Ethiopia to be stored on a server or data centre **located in Ethiopia**; health data is **sensitive personal data**; cross-border transfer of sensitive data needs **prior ECA approval**. The ECA is the supervisory authority.

**Tier numbering in v1.0 was inverted — corrected.** The canonical numbering (published at `/privacy` §3 and used in `lib/env/runtime.ts`) is **Tier 1 = EthioTelecom Cloud (Ethiopia), Tier 2 = on-premise Ethiopia, Tier 3 = Vercel/Supabase EU**. Tier 1 is the *most* sovereign tier. v1.0 called cloud "Tier 1" and sovereign "Tier 2" — backwards, and it would have gated patient data to exactly the wrong deployments.

**M5a — the finding is platform-wide, not Medical.** Art. 22 is not health-specific. Tier 3 production today holds names/emails/activity of Ethiopian users across **every** edition. The Medical module is where we noticed it, not what caused it. The decisive open question: does Art. 22 require **exclusive** in-country storage, or in-country storage **plus** a permitted copy abroad under the transfer rules? Tracked as an open *platform* decision; it does not block the Medical phases. Mitigating context: enforcement is immature (ECA still issuing directives a year in) and **we hold no patient data and have no real customers yet** — the cheapest possible moment to settle this.

**M6 default now recommended: 24 months** after the last linked care item closes, org-configurable 6–84, **never "forever"**. Reasoning follows from M1: Onekof is *not* the medical record, so the long statutory retention belongs to the facility's EMR. A long default would quietly make Onekof an unmanaged secondary patient archive — all the liability, none of the clinical benefit. **Minors deliberately not special-cased** (retain-to-majority is a *record* rule; applying it would assert Onekof is the record) — flagged for counsel. **Audit log exempt from patient retention** — access evidence must outlive the record, and it is already anonymous (patient id only, no identifiers).

**Shipped 2026-07-29:** `apps/web/src/lib/compliance/residency.ts` — deployment tier as a machine-readable value with `isDataResidentInEthiopia()` and the single-point `canStorePatientData()` gate; local dev deliberately reports Tier 3 (least privileged) so the gate can't pass on a laptop and fail in production. 12 tests including one that fails if the tier ordering is ever inverted again. Also `docs/business/ONEKOF_DATA_RESIDENCY_COUNSEL_BRIEF.docx` — a branded instruction brief reducing counsel review to **four yes/no questions** instead of an open research request.

**Gate to M1 — both still open:** (a) counsel confirms M5 (brief ready to send), (b) founder confirms the 24-month default or names a different number.

**Known outstanding from M0:** the Customization page still has no *user-facing* explanation of the residency requirement (only a developer comment). Deliberately held — an explanation naming a tier requirement is a compliance statement to customers, and publishing one before counsel confirms risks a retraction. Ships with M3 or sooner if counsel confirms first.

## EDITION AUDIT — ALL SIX ORGANIZATION TYPES (2026-07-28)

Founder direction: "do not only focus on Healthcare — check all organizations and their assigned tools." Healthcare was not special; it was the one that happened to get tested. Every onboarding promise was checked against what the code actually delivers:

| Edition | Promised before | Verdict |
|---|---|---|
| Personal | tasks / solo projects / quick setup / upgrade | all 4 real — unchanged |
| Government | budget / **compliance tools** / **public procurement** / Ethiopian calendar | 2 of 4 were placeholder pages |
| Private (Tech) | agile / client projects / team collab / **time tracking** | no timer or timesheet UI exists |
| NGO | **grants** / **impact** / **donor reporting** / multi-currency | **3 of 4 false** |
| Education | **course projects** / research / **academic calendar** / **student collab** | 1 of 4 clearly real |
| Construction | **sites** / **equipment** / **safety** / **progress photos** | **4 of 4 false** |

Placeholder pages confirmed (~19-23 lines, no data calls, empty state only): grants, procurement, sites, equipment, safety, courses, impact, compliance, medical, patients. Real: calendar (162L, live queries).

**Second finding, worse than the first:** `construction` had **no preset at all** and fell through to Business — an Ethiopian contractor was handed *Code Review* and *Releases*, while the Research department's workstreams (Plans, Materials, Inspections), which were plainly designed for that sector, never reached them.

**Shipped:**
- All six edition promises rewritten to name only shipping capability, via 8 generic reusable `onboarding.cap*` keys x 5 locales (the healthcare-specific hc* keys were folded into them).
- **New CONSTRUCTION_PRESET** (6th): operations + research, procurement + multi-currency budget (imported materials), no development/marketing/automations, no publicTransparency (private contractor, unlike a ministry). `construction` now routes to it.
- `OrganizationType` extended with the live onboarding ids (construction/private/personal) — they were previously untyped strings resolving by fallback.
- **New guard test:** no sector-specific onboarding type may resolve to the Business fallback. Combined with the earlier dead-switch guard, the two failure modes found today (enabling sections with no destination; sectors silently inheriting the wrong edition) are now both test-enforced. 354 tests green.

## NEXT TODO (priority order, as of 2026-07-28)

**Founder actions (only you can do these):**
0. **Send the counsel brief** — `docs/business/ONEKOF_DATA_RESIDENCY_COUNSEL_BRIEF.docx`. This is now the top item: it gates the whole Medical build (M1), and its Question 1 may affect platform hosting for every Ethiopian customer, not just healthcare. Also decide the M6 retention default (recommendation: 24 months).
1. **Test the completed architecture on production** — new workspace shows the org-type question; existing orgs show the "choose your organization type" banner; department chips appear on cards; issue panel has the Department selector.
2. **Linguist review** — a batch of new am/om/ti/so strings shipped today (departments.*, customization.chooseOrgType*, sidebar.medical/courses) plus the ~70 sprint/settings strings still pending from earlier. Export and review.
3. **Repo hygiene** — enable GitHub setting *Automatically delete head branches* (Settings → General → Pull Requests) so this stale-branch pile-up stops recurring.
4. **Decide on PR #160** (draft, `remove-k6-tests`) — genuinely pending; `tests/k6/` is still in master.

**Engineering backlog (ready to start on go-ahead):**
1. **Shared-Button sweep** (highest value/effort ratio) — the `Button` base class carries `whitespace-nowrap inline-flex justify-center`, which silently breaks any wrapping text placed inside it. It broke FOUR screens this session (Customization presets/toggles/header, AI Insights cards, onboarding option cards). One audit of every `<Button>` wrapping block content + a documented rule would retire the entire bug class.
2. **Support guides Wave 2** — Goals & OKRs, Documents, Docs & Wiki, Reports & Analytics, Compliance & Audit, Org Settings (catalog + generators already in `docs/support/`).
3. **Five product findings** from the code research (recorded 2026-07-25, still open): OrgAuditLog not wired for invitation/member/team/project-member routes (catalogue defines the actions, nothing writes them — do NOT promise member audit trails until fixed); standalone `POST /api/expenses/[id]/reject` skips the approve-level gate that `/approve` enforces; expense approver-notification query checks literal `budgetAccess: 'FULL'` which never matches enum `FULL_CONTROL`; `OrganizationSettings.budgetCurrency` schema default is USD in an ETB-first product; (the orphaned Customization page was FIXED in #164).
4. **Org-defined department registry** — the designed-for extension of D1: ministries want "Directorates", NGOs want "Programs", universities want "Faculties". The string-not-enum decision means this needs no schema migration; it becomes an OrgSettings-driven registry feeding the same fields.
5. **Industry vertical guides** (Wave 3) — written per client go-live, not before.

---

## TERMINAL AGENT HANDOFF (2026-07-28)

**Master is current and complete — no merge work is pending.** `git fetch origin && git checkout master && git pull` gets everything. Master HEAD = `8fead29`.

**On "orphaned commits":** there are none in the sense that matters — no unmerged work exists anywhere. What the repo has is ~42 **stale branch refs** left behind by squash-merges (a squash merge puts the branch's *content* into master as one new commit, so the old branch tip is no longer an ancestor of master even though nothing is lost). Verification command:

```bash
# For each remote branch: is its content already in master?
for b in $(git branch -r | grep -v HEAD | grep -v master); do
  git diff --quiet origin/master "$b" && echo "SAFE (identical): $b"
done
# Better check per branch — was its PR merged?
gh pr list --state merged --json number,headRefName --limit 200
```

**Recommended cleanup (safe order):**
1. Enable *Automatically delete head branches* in repo settings (stops the recurrence).
2. Delete remote branches whose PR is merged: `git push origin --delete <branch>` — keep `remove-k6-tests` (open PR #160).
3. `git remote prune origin` locally.
4. Do **not** rewrite master history — the historical commit-attribution cleanup discussed earlier (a handful of old commits authored as `Claude <noreply@anthropic.com>`, incl. `95e2218`, `e8e486a`, `21f4fa9`) touches already-merged, already-deployed history. If it is done, it must be a deliberate, coordinated force-push with every collaborator informed, and Vercel/CI reconnected afterwards.

**Standing project rules the terminal agent must honor** (also in PROJECT_GUIDELINES.md): commits are authored AND committed as `Oli Tamrat Oli <oli.oli@udc.edu>`; **no AI/tool attribution anywhere** — no Co-Authored-By trailers, no session URLs, no tool names in commit messages, PR bodies, code comments, or documents (this is an IP-registration requirement); use PROJECT_BRIEFING.md (never create CLAUDE.md).

---

## SESSION LOG (2026-07-25) — Sprint & Settings Foundation (Phase 1)

**Strategic decision (founder):** build the long-horizon foundation properly — Sprints and the settings hierarchy are "must build right" tools. Core Jira concepts adopted, implementation not copied.

**Architecture doc:** `docs/architecture/SPRINT_AND_SETTINGS_ARCHITECTURE.md` — **APPROVED v1.2**.
Approved decisions: **2-week default sprint length** · **sprint completion requires project ADMIN+** · **terminologyScheme ships in Phase 1** (AGILE says "Sprint", FORMAL says "Work Cycle"; i18n mapping in Phase 2).

### Phase 1 shipped (PR #144 — dark launch, zero UI change)

| Area | What |
|------|------|
| Schema | `Sprint` model (PLANNED → ACTIVE → COMPLETED, terminal), `ProjectSettings` (nullable = inherit from org), `Task.sprintId/sprintOrder/storyPoints` (all nullable), org defaults + `terminologyScheme`, 7 new `ActivityType` values |
| DB guarantee | Partial unique index `sprints_one_active_per_project` — one ACTIVE sprint per project enforced by Postgres, race-free (validated empirically on PG15/16) |
| Snapshots | `committed*` written at sprint START, `completed*` at completion — scope churn stays measurable forever |
| Migration | `20260726_add_sprints_and_project_settings` — idempotent, applied twice cleanly against baseline-reconstructed DB |
| APIs | `GET/POST /api/projects/[id]/sprints`, `PATCH/DELETE /api/sprints/[id]`, `POST /api/sprints/[id]/start` (commitment snapshot, 2-wk default), `POST /api/sprints/[id]/complete` (ADMIN+, rollover decision recorded) |
| Settings | `lib/settings/effective.ts` (pure merge rules, unit-tested) + `lib/settings/resolve.ts` (`resolveProjectSettings` — the ONE resolution point); `GET/PATCH /api/projects/[id]/settings` with zod |
| Audit | Sprint lifecycle + settings writes emit `UserActivity`; completion/deletion/settings changes also go to `OrgAuditLog` (INSA posture); `TASK_SPRINT_CHANGED` = scope-churn signal |
| Bug fixes | **`uuidSchema` rejected all real IDs** (strict RFC-UUID vs Prisma cuid — `/api/issues` POST validation was rejecting every cuid; validator now accepts cuid/uuid token shapes); `OrganizationSettingsProvider` never received organizationId (settings never loaded client-side — fixed via `useWorkspace()` in wrapper); org settings PUT unvalidated (zod added + OrgAuditLog); bulk/single `completedAt` overwritten on repeat DONE (now only set on transition into DONE) |
| Bulk | 5th action `moveToSprint` (`value: sprintId` or `"null"` = backlog), project-scope enforced, churn logged via `createMany` (no push storm) |
| Tests | 21 new tests (sprint schemas, lifecycle rollover contract, settings inheritance incl. null-means-inherit and SCRUM template default) — 290 total green |

**Production status:** PR #144 merged to master 2026-07-25; migration `20260726_add_sprints_and_project_settings` **applied to Supabase and verified** (partial unique index, tasks columns, project_settings, org defaults all confirmed via `DB Migrate` workflow run #2). New CI utility: `.github/workflows/db-migrate.yml` — manual dispatch, applies an idempotent migration over DIRECT_URL and records it in `_prisma_migrations` (handles the `@`-in-password psql quirk by exporting PG* vars via Node URL parsing).

**Phase 2 SHIPPED (PR #145, merged 2026-07-25, no migration needed):** sprint planning UI on the project-scoped backlog page — sprint sections with drag between sprint/backlog, create/edit/start/delete dialogs, live count + estimate sums, `useTerminology` hook (Sprint/Work Cycle per org `terminologyScheme`), 33 `sprints.*` i18n keys × 5 locales (flag for linguist review), `GET /api/issues?sprintId=null|any|<id>` filter. Deliberate deviation: the "Sprint tab" moved from Phase 2 to Phase 3 (tabs are org-wide static config; the tab will target the Phase 3 active-sprint board page).

**Phase 3 SHIPPED (2026-07-25, no migration needed):** Sprints tab in ISSUES_TABS -> /dashboard/issues/sprints (active sprint panel with goal/dates/days-left/progress-vs-commitment/issue list + Complete button; completed-sprints report with committed vs completed and 3-sprint velocity, all from write-once snapshots); CompleteSprintDialog with rollover decision (backlog | planned sprint) wired on backlog ACTIVE sections and sprints page; board gains "Active sprint only" filter when scoped project has a running sprint; 17 new sprints.* keys + departmentTabs.sprints x 5 locales.

**Phase 4 SHIPPED (2026-07-25, no migration needed):** workflow engine LIVE — enforcement + transition table resolved via resolveProjectSettings on single PATCH and bulk updateStatus (bulk skips blocked transitions, reports workflowBlocked count); issues/settings page gains real DB-backed "Work configuration" card (ProjectWorkConfig component): sprint toggle, estimation unit, workflow enforcement with inherited/overridden badges + "use org default" (null override), read-only transition matrix; 16 projectSettings.* keys x 5 locales; 8 new enforcement tests. The Sprint & Settings architecture is now fully delivered (Phases 1-4).

**Sprint Insights Tier 1 SHIPPED + Reporting architecture designed (2026-07-25):** new doc `docs/architecture/SPRINT_REPORTING_AND_INSIGHTS.md` (Tier 1 implemented; Tier 2 designed: budget-per-sprint snapshot via TaskBudget, churn endpoint from TASK_SPRINT_CHANGED, branded PDF export via @react-pdf/renderer with embedded Ge'ez fonts; deliberate non-goal: cross-sprint per-person scoring). Tier 1: completed-sprint rows on Sprints tab expand to insight panel — completion bullet bar vs commitment snapshot (dataviz-validated form: single teal fill on structural track, direct labels; teal+gray paired bars FAILED CVD validation and were rejected), goal + duration chip, per-assignee contribution table (done/time/estimated, unassigned bucketed last) from pure unit-tested aggregator `components/sprints/insights.ts`. 8 new sprints.* keys x 5 locales.

**Tier 2a SHIPPED (2026-07-25):** scope churn surfaced — `GET /api/sprints/[id]/churn` counts TASK_SPRINT_CHANGED activity in the start→completion window (rollover excluded by design: completion emits no per-task events); pure `summarizeChurn` classifier (gross counting, per-issue in/out/both) with 4 tests; insight panel shows the churn line (explicit zero for auditors) + clickable issue chips opening the slideout. Remaining Tier 2: 2b budget snapshot, 2c branded PDF export.

**Tier 2b SHIPPED (2026-07-25):** budget-per-sprint snapshots — migration `20260727_add_sprint_budget_snapshot` (sprints.budget_planned + budget_invested DECIMAL(19,2), NEEDS DB Migrate run after merge); completion transaction sums TaskBudget estimatedCost/actualCost of delivered issues filtered to org budgetCurrency (mixing currencies rejected by design — FX policy is a documented non-goal), writes both snapshots + records them with currency in the completion OrgAuditLog; sprints API + insight panel budget line. Design refinement recorded in doc §3.1: two snapshots (planned/invested) not one. Also merged: churn window fix #156 (window opens at SPRINT_STARTED event instant, not midnight of startDate). Remaining Tier 2: 2c branded PDF export.

**Tier 2c SHIPPED (2026-07-25): the reporting architecture is COMPLETE.** Branded sprint report PDF — `GET /api/sprints/[id]/report.pdf` rendered server-side by @react-pdf/renderer (pure Node, works serverless + Tier 2 on-prem; fonts/logo load from the deployment's OWN origin — Abyssinica SIL TTF for am/ti, Inter otherwise, both vendored in public/fonts); content: Onekof logo header + teal accent, project/sprint/dates/goal meta, completion bullet vs commitment, scope changes, budget line, contribution table, velocity, signature block (prepared-by/approved-by — ministries sign); localized via server-side makeTranslator (same locale JSONs + interpolation as client); generation recorded as SPRINT_REPORT_EXPORTED in OrgAuditLog; Export PDF button in the insight panel; 8 sprints.* keys x 5 locales; PDF render smoke tests (valid %PDF asserted) — 325 total green.

**Support Guide Library STARTED (2026-07-25):** `docs/support/` is now the TA-team documentation system — `README.md` is the master catalog (guide families A-H mapped to org presets, Wave 1-3 build order, versioning rule: guides bump with behavior changes, in the same PR). Guides are GENERATED docx, never hand-edited: generators live in `docs/support/generators/` (shared branding/9-section builders in `lib/guide-lib.js`; `npm i docx && node <guide>.js` regenerates). Wave 1 SHIPPED (5 guides, each ~1600-1800 words, code-verified by research agents): Getting Started & Navigation, Projects/Issues/Boards, Sprints & Work Cycles (v1.1 — step lists now restart per subsection), Teams/Members/Permissions, Budget & Expenses. Product findings surfaced during research (for future fixes, NOT documented as features): (1) Settings → Customization page is orphaned — no link anywhere in src points to `/dashboard/settings/customization`; (2) OrgAuditLog is only wired for settings + sprint routes — invitation/member/team/project-member routes define catalogue actions but never call logOrgAction; (3) standalone `POST /api/expenses/[id]/reject` skips the approve-level gate that `/approve` enforces; (4) expense approver-notification query checks literal `budgetAccess: 'FULL'` which doesn't match enum FULL_CONTROL; (5) OrganizationSettings.budgetCurrency schema default is "USD" for an ETB-first product.

**Department & Workstream architecture APPROVED v1.2 (2026-07-28), Phase 1 dark launch built:** `docs/architecture/DEPARTMENT_WORKSTREAMS_ARCHITECTURE.md` — D1-D9 approved ("scope and steer", full autonomy). Phase 1: `Task.department/workstream` (nullable String, indexed `[projectId, department, workstream]`), `TASK_DEPARTMENT_CHANGED` ActivityType, catalog module `lib/departments/catalog.ts` (4 depts × 14 workstreams, `validateClassification` pair rules), migration `20260728_add_task_department_workstream` (idempotent, backfills from legacy labels in catalog order — double-apply + 8-case backfill validated on scratch PG16: cross-dept workstreams NOT attached, orphan workstream labels NOT classified, user tags untouched), API: GET /api/issues?department=&workstream= (server-side, indexed; 'null' = general), POST/PATCH accept + validate pair against post-update state (changing department clears stale workstream), classification changes audited old→new. Zero UI change. ⚠️ RUN DB MIGRATE WORKFLOW (20260728_add_task_department_workstream) BEFORE merging Phase 1 to master — Prisma client now selects the new columns, so code must not deploy ahead of the migration. Remaining: Phase 2 (department pages switch to fields, D4 fallback), Phase 3 (chips/filters everywhere, drop fallback, i18n ×5), Phase A/B (Part II industry gating + onboarding org type).

**Phase A SHIPPED (2026-07-28, no migration): industry section gating live.** DashboardSectionId +6 ids (development/marketing/operations/research/medical/courses; deliberate deviation: no 'knowledge' id — the Knowledge group derives from its children's documents/docs/automations gates). Capability matrix encoded in presets (D8): Ministry +operations+research; NGO +marketing+operations+research+docs; Business +development+marketing+operations; Education +research+courses; NEW HEALTHCARE_PRESET (operations/research/medical/compliance, approval-only budget, aliases healthcare/hospital/clinic in OrganizationType + preset map). Sidebar: department sections now gated top-level AND per-item via resolveEnabledSections (D9: explicit settings win -> industry preset fallback -> legacy fail-open only when neither; call site already passes org.type so typed orgs converge immediately). Customization page: 6 new section toggle cards (icons+colors, reuses departments.*Desc keys; 6 new keys x 5 locales for medical/courses/healthcare-preset, flag linguist). 344 tests green (11 new preset-invariant tests). Remaining: Phase 2 (dept pages switch to fields), Phase 3 (chips/filters, drop fallback), Phase B (onboarding org-type step + legacy banner).

**Phase 2 SHIPPED (2026-07-28, no migration): department pages run on classification fields.** DepartmentTaskList derives department from its category prop (catalog-validated) and workstream from the legacy defaultLabels — ZERO changes across the 18 pages, dynamic project route inherits automatically. Create stamps department/workstream and STOPS stamping structural labels (D3); filter is field-first with the D4 legacy-label fallback (unclassified issues still match by old labels — fallback drops in Phase 3); header description carries the classification note (departments.classifiedNote x 5 locales). Also this session: Phase A save chain fully fixed after founder testing (PRs #166/#167: null feature groups in PUT validation + BOTH Prisma write paths incl. GET's create-defaults branch; language normalized to the DB enum with client type aligned — was lowercase AND missing SO; save errors now surface the server reason in the toast). Founder confirmed Phase A end-to-end on production: preset saves, sidebar filters by industry. Remaining: Phase 3 (chips/filters on main Issues views, drop D4 fallback, support-guide regen), Phase B (onboarding org-type step + legacy banner).

**Phase 3 SHIPPED (2026-07-28, no migration): classification visible everywhere; the Department & Workstream architecture is fully delivered (Phases 1-3 + A).** New `DepartmentChip` (renders nothing for unclassified work) on the main Issues cards and the Board cards; issue slideout gains a Department/Workstream row of controlled catalog selectors (D2 — never free text; changing department clears the stale workstream client- and server-side; every change audited as TASK_DEPARTMENT_CHANGED); `WORKSTREAM_LABEL_KEYS` maps every workstream slug to its existing sidebar i18n key (reuse, not new strings) with an invariant test that every catalog workstream has a key AND that every key resolves in en.json — a raw key can never leak to the UI. D4 legacy-label fallback REMOVED from DepartmentTaskList (backfill classified all rows; creation stamps fields). departments.classification key x 5 locales. Support guide regenerated to **v1.1** in the same PR per the docs versioning rule (new 4.6 "Classify work by department" walkthrough, key term, enforcement rule, 3 FAQ rows incl. the founder's original "why does it also appear in Issues?" confusion, under-the-hood paragraph, navigation row) — first exercise of that rule. 348 tests green. Remaining: Phase B (onboarding org-type step + legacy-org banner); candidate cleanup: sweep for other text-bearing shared-Button wrappers (whitespace-nowrap base broke 3 screens this session).

**Phase B SHIPPED (2026-07-28, no migration) — the Department & Workstream architecture (D1-D9) is COMPLETE.** Onboarding now asks "What kind of organization is this?" (Government/NGO/Business/Education/Healthcare/Other) on the existing workspace step — deliberate deviation from the doc's "new step": the step already had a card grid, so this keeps onboarding at 2 steps instead of 3 (fewer taps on mobile). The org POST already accepted `type`/`industry` but the form never sent it; it now does, AND the settings row is created from the matching preset **inside the same transaction** as the organization (D7 no-orphan-window) — government/ministry/NGO orgs also get terminologyScheme FORMAL automatically. Legacy orgs (no type -> silently on the Business fallback): `ChooseOrgTypeBanner` on the dashboard for Owner/Admin only, dismissible per-org via localStorage, links to Settings -> Customization; assumes dismissed until localStorage reads so it never flashes. Also fixed proactively: the onboarding option cards had the same whitespace-nowrap Button trap that broke 3 screens today. Guides regenerated per the versioning rule: **Getting Started v1.1** (the old "onboarding never asks your type" FAQ was now FALSE — replaced with the true flow + the legacy-banner answer; Healthcare added to preset lists; new rule "every workspace is configured from the moment it exists"). 348 tests green. Remaining candidate cleanup: sweep for other text-bearing shared-Button wrappers.

### Remaining phases (do NOT start without founder go-ahead per phase)
- **Phase 2:** Sprint planning UI on backlog page (sprint sections, drag between, create/start), Sprint tab gated by `sprintsEnabled`; terminology i18n mapping
- **Phase 3:** Active-sprint board filter, completion dialog w/ rollover, sprint report (committed vs completed, velocity)
- **Phase 4:** Project settings UI, workflow enforcement wired (incl. bulk), transition matrix view

---

## SESSION LOG (2026-07-14) — QA Testing + Invitation Flow + i18n

### Completed

| # | What | Files Changed |
|---|------|---------------|
| 1 | Fixed all TypeScript errors (was 10+, now 0) | `auth.ts`, `reports/page.tsx`, `budget/page.tsx`, `issues/budget/page.tsx`, `create-sample-expenses/route.ts`, `superadmin.ts` |
| 2 | Fixed ESLint config (broken `@onekof/config` path) | `.eslintrc.js` |
| 3 | Added 2FA fields to Prisma schema + migrated production DB via SQL Editor | `schema.prisma` |
| 4 | Fixed `entityType` column mapping (missing `@map`) | `schema.prisma` |
| 5 | Created missing PostgreSQL enum types (`ProjectEntityType`, `ProjectVisibility`, `ProjectRiskLevel`, `ProjectPriority`) | Production DB via SQL Editor |
| 6 | Added all missing enterprise project columns to production DB | Production DB via SQL Editor |
| 7 | Created k6 load test scripts for QA team | `tests/k6/` (8 files) |
| 8 | Built multi-language system (5 languages) | `src/locales/`, `src/contexts/language-context.tsx`, `src/components/language-switcher.tsx` |
| 9 | Changed ETB as default currency | `src/lib/validation/schemas.ts` |
| 10 | Fixed invitation acceptance flow — subdomain redirect, session refresh, defaultOrganizationId | `api/invitations/accept/route.ts`, `auth/accept-invite/page.tsx` |
| 11 | Fixed signup Suspense boundary (was breaking CI build) | `auth/signup/page.tsx` |
| 12 | Fixed `/api/health` build error (missing `force-dynamic`) | `api/health/route.ts` |
| 13 | Built project-scoped invitations | `schema.prisma`, `api/invitations/`, `auth/accept-invite/page.tsx` |
| 14 | GUEST role defaults for project-scoped invites | `api/organizations/[id]/invitations/route.ts` |
| 15 | RBAC enforcement for GUEST users (project filter, sidebar hiding, members page blocked) | `api-organization.ts`, `collapsible-sidebar.tsx`, `members/page.tsx`, `workspace-context.tsx` |
| 16 | Email matching on invitation acceptance | `api/invitations/accept/route.ts`, `auth/accept-invite/page.tsx` |
| 17 | Project selector + role selector in invitation UI | `dashboard/members/page.tsx` |

### Database Migrations Applied (via Supabase SQL Editor)

These columns/types were added directly — `prisma db push` does not work through the Supabase pooler.

| Table | Columns/Types Added |
|-------|-------------------|
| `users` | `two_factor_enabled`, `two_factor_secret`, `two_factor_backup_codes` |
| `projects` | `owner_id`, `department`, `category`, `entity_type`, `visibility`, `risk_level`, `budget_code`, `tags`, `start_date`, `due_date`, `priority` |
| `projects` | Enum types: `ProjectEntityType`, `ProjectVisibility`, `ProjectRiskLevel`, `ProjectPriority` |
| `invitations` | `project_id`, `project_role` |

### Session Log (2026-07-15/16) — RBAC Enforcement + Member Management + Issue Improvements

| # | What | Files Changed |
|---|------|---------------|
| 18 | GUEST RBAC data filtering — explicit project ID list for issues/stats | `api/issues/route.ts`, `api/dashboard/stats/route.ts`, `api-organization.ts` |
| 19 | Sidebar Projects badge shows actual project count (was nav item count) | `collapsible-sidebar.tsx` |
| 20 | Org member role change API (PATCH) + removal API (DELETE) | `api/organization-members/route.ts` |
| 21 | Members page: inline role dropdown + remove button for OWNER/ADMIN | `dashboard/members/page.tsx` |
| 22 | Start date editing — API + UI (issue detail slideout) | `api/issues/[id]/route.ts`, `issue-detail-slideout.tsx` |
| 23 | Issue type badges on kanban cards (Epic/Story/Bug/Task/Subtask) | `dashboard/issues/page.tsx` |
| 24 | Issues API includes parent relation + subtask count | `api/issues/route.ts` |
| 25 | Member checkbox fix — userId field mismatch in org members API | `api/organizations/[id]/members/route.ts`, `create-project-modal.tsx` |

### Session Log (2026-07-18) — Profile Photo Upload + Issue Improvements

| # | What | Files Changed |
|---|------|---------------|
| 26 | Profile photo upload API (POST + DELETE) | `api/user/avatar/route.ts` (new) |
| 27 | Profile settings page: camera hover overlay + upload + remove | `settings/profile/page.tsx` |
| 28 | Dashboard settings profile tab: replaced Avatar URL text input with photo upload | `dashboard/settings/page.tsx` |
| 29 | Photos stored in Vercel Blob, URL persisted in User.avatar, old photos auto-deleted on replace | Uses existing storage driver infrastructure |

### Session Log (2026-07-18 cont.) — Translation Wiring + Ethiopian Calendar + AI/Budget Fixes

| # | What | Files Changed |
|---|------|---------------|
| 30 | Wire `t()` into all 14 project detail pages | `projects/[id]/*.tsx` (board, list, team, budget, settings, timeline, calendar, documents, goals, activity, automation, wiki, layout) |
| 31 | Ethiopian Calendar date picker component | `components/ui/ethiopian-date-picker.tsx` (new, 265 lines) |
| 32 | Replace `<input type="date">` with EthiopianDatePicker on issue start/due dates | `issue-detail-slideout.tsx` |
| 33 | Fix PDF extraction — Anthropic vision document blocks | `lib/ai/ai-service.ts` |
| 34 | Fix DOCX extraction — XML tag stripping | `lib/ai/ai-service.ts` |
| 35 | Wire document uploads to Vercel Blob storage | `api/documents/upload/route.ts` |
| 36 | Implement AI quota tracking via AIUsage model | `lib/ai/ai-service.ts` |
| 37 | Budget PAID transition endpoint | `api/expenses/[id]/pay/route.ts` (new) |
| 38 | Fix expense revision numbering | `api/expenses/[id]/route.ts` |
| 39 | Wire `t()` into signup + forgot-password pages + 14 new auth translation keys | `auth/signup/page.tsx`, `auth/forgot-password/page.tsx`, all 5 locale files |
| 40 | Wire `t()` into notifications page + add filter keys | `dashboard/notifications/page.tsx`, all 5 locale files |
| 41 | Add all missing env vars to .env.example | `.env.example` (Blob, Stripe, Chapa, Admin, Upstash, Sentry) |

### Pending Tasks

| Priority | Task | Details |
|----------|------|---------|
| **P0** | **Verify Vercel env vars (run from terminal)** | Check Vercel Dashboard → Settings → Environment Variables. Ensure these are set: `ANTHROPIC_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`. Without these, AI docs, file storage, and email won't work. |
| **P0** | **Set Stripe env vars in Vercel** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Get from Stripe Dashboard → Developers → API Keys. |
| **P0** | **Set Chapa env vars in Vercel** | `CHAPA_SECRET_KEY`, `CHAPA_WEBHOOK_SECRET`. Get from Chapa Dashboard. |
| **P0** | **E2E test payment flow** | After setting Stripe/Chapa keys, test checkout from pricing page → payment → subscription activation. Run from browser. |
| **P1** | **E2E test AI document upload** | After verifying `ANTHROPIC_API_KEY` + `BLOB_READ_WRITE_TOKEN`, upload a PDF invoice and verify: file stored in Vercel Blob (not base64), AI extracts budget items, quota tracked in `ai_usage` table. |
| **P1** | **E2E test email delivery** | After setting `RESEND_API_KEY`, test: invitation email, password reset email, expense approval notification. |
| **P1** | **Test integrations with API keys** | Set OAuth credentials in Vercel for: Slack (`SLACK_CLIENT_ID/SECRET`), GitHub (`GITHUB_CLIENT_ID/SECRET`), Google Calendar, Microsoft Teams, Jira. Test each connect flow. |
| **P1** | Issue hierarchy tree view | Kanban shows type badges + parent refs. Full tree view (Epic → Story → Task → Subtask) not yet built |
| **P1** | Filter subtasks from top-level kanban | Subtasks currently appear alongside parents as independent cards |
| **P1** | Apply EthiopianDatePicker to more date fields | Currently on issue start/due dates. Also needed: project start/due dates in create-project-modal, budget fiscal year selectors |
| **P2** | Profile photo in navbar | Navbar avatar circle still shows initial letter — should show uploaded photo |
| **P2** | Remove debug logging | `api/issues/route.ts` and `api/organizations/[id]/projects/route.ts` have RBAC debug `logger.info` calls |
| **P2** | k6 test configuration | Sute Dullo needs `BASE_URL` + test credentials configured before running scalability tests |
| **P2** | Wire `t()` into remaining settings pages | `dashboard/settings/customization`, `dashboard/settings/security`, `dashboard/settings/integrations` |

### Vercel Environment Variables Checklist (run from terminal or Vercel dashboard)

```
# Required for AI Document Processing
ANTHROPIC_API_KEY=sk-ant-...

# Required for File Storage (documents, avatars)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Required for Email (invitations, password reset, expense notifications)
RESEND_API_KEY=re_...

# Required for Payments — Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Required for Payments — Chapa (Ethiopia)
CHAPA_SECRET_KEY=CHASECK_...
CHAPA_WEBHOOK_SECRET=...

# Required for Security
ADMIN_SECRET=<generate with: openssl rand -hex 32>
ADMIN_USERS=<bcrypt hashes, see generate-admin-hash.mjs>
CRON_SECRET=<generate with: openssl rand -hex 32>
BLOB_ENCRYPTION_KEY=<generate with: openssl rand -hex 32>

# Required for Rate Limiting (already set if Upstash configured)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Optional — Error Tracking
SENTRY_DSN=https://...
```

Verify with: `vercel env ls` or Vercel Dashboard → Settings → Environment Variables

### Git History Cleanup — 10 Non-Compliant Commits

Run from local terminal (`filter-branch` blocked in cloud environment):

```bash
cd onekof-platform
git filter-branch -f --env-filter '
OLD_EMAIL1="120649391+OliTamrat@users.noreply.github.com"
OLD_EMAIL2="noreply@anthropic.com"
CORRECT_NAME="Oli Tamrat Oli"
CORRECT_EMAIL="oli.oli@udc.edu"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL1" ] || [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL2" ]; then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL1" ] || [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL2" ]; then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' -- master

git push --force-with-lease origin master
```

**Commits to fix:**

| Commit | Issue |
|--------|-------|
| `95e2218` | Author + Committer: `Claude <noreply@anthropic.com>` |
| `84fcaf8` | Committer: `Claude <noreply@anthropic.com>` |
| `0554879` | Wrong email: `120649391+OliTamrat@users.noreply.github.com` |
| `450cc34` | Wrong email |
| `9202f5f` | Wrong email |
| `7298d83` | Wrong email |
| `b1ee062` | Wrong email |
| `825f9e5` | Wrong email |
| `39d26fb` | Wrong email |
| `4a1c7bd` | Wrong email |

All must be: `Oli Tamrat Oli <oli.oli@udc.edu>` (both author AND committer).

After running, verify with: `git log --format="%h %an <%ae> | %cn <%ce>" -30 | grep -v "oli.oli@udc.edu"`
Should return empty (no non-compliant commits).

---

### Key Architecture Notes for Next Session

- **Supabase pooler cannot run DDL** — always use SQL Editor for ALTER TABLE / CREATE TYPE
- **Schema change workflow**: edit schema → SQL Editor on production → `prisma generate` → commit
- **Invitation email matching**: enforced — only the invited email can accept (403 if mismatch)
- **GUEST RBAC**: Uses explicit `projectId: { in: allowedIds }` pattern (not Prisma nested relation filter — that doesn't restrict correctly)
- **GUEST data flow**: First query allowed project IDs → then filter issues/stats by those IDs
- **Sidebar filtering**: `collapsible-sidebar.tsx` hides Budget/Members/Settings/Automation/Reports for GUEST
- **Org member management**: PATCH/DELETE on `/api/organization-members` — OWNER role is protected
- **`userRole`**: exposed via `workspace-context.tsx` from `/api/organizations` response

---

## CONFIRMED INFRASTRUCTURE BUGS (fix before Tier 2 deploy)

These are verified in source files — not assumptions.

| ID | File | Bug | Priority |
|---|---|---|---|
| BUG-1 | `docker-compose.prod.yml` | `postgres:15-alpine` missing pgvector — change to `ankane/pgvector:pg15` | P0 |
| BUG-2 | `Caddyfile` | No wildcard `*.onekof.et` block; wildcard TLS needs DNS-01 + Cloudflare module in Caddy | P0 |
| BUG-3 | `.github/workflows/docker-build.yml` | Docker image never published — no semver tags exist. Run `git tag v1.0.0 && git push origin v1.0.0` | P0 |
| BUG-4 | `apps/web/src/middleware.ts` | CSRF enforcement function returns `null` unconditionally — bypassed. Must fix before INSA submission | P0 |
| BUG-5 | `packages/database/index.ts` | `getTenantClient()` creates new PrismaClient per call — connection pool leak | P1 |
| BUG-6 | `apps/web/.env.example` | `BLOB_ENCRYPTION_KEY` not in template — Tier 2 operators will skip INSA P4 | P1 |
| BUG-7 | `scripts/setup-tier2-server.sh` | No `docker login ghcr.io` step — VM cannot pull private image | P1 |
| BUG-8 | `docker-compose.prod.yml` | No volume for `/var/log/caddy` — logs lost on restart | P2 |

**Correct Tier 2 launch sequence:**
Fix BUG-1 through BUG-4 → tag v1.0.0 → smoke test on throwaway $5 VM →
only then provision EthioTelecom VM. Full sequence in audit doc.

---

## KNOWN REMAINING ISSUES

| # | Issue | Status |
|---|---|---|
| 1 | Assignee dropdown may show empty on some accounts (org-members 403) | To investigate |
| 2 | Android Play Store submission | Pending — Google Play $25 one-time |
| 3 | Supabase on free tier | Upgrade to Pro $25/mo before first paying customer |
| 4 | No automated backup scheduled for Tier 2 | Add cron to setup-tier2-server.sh |
| 5 | Multi-schema tenant isolation | Declared in schema, not implemented — all data in public schema |

---

## DEPARTMENT PAGES (11 total)

All department pages use `DepartmentTaskList` component with task create/list/slideout:

| Department | Sub-tabs |
|---|---|
| Development | Backlog, Releases, Code Review |
| Marketing | Social Media, Analytics, Campaigns |
| Operations | Incidents, Monitoring, Checklists |
| Research | Data, Findings, Plans, Materials, Inspections |
| Knowledge | AI Documents, Automation, Wiki, Docs |
| Budget | Summary, Expenses, Income, Forecasting, Reports, Settings |
| Teams | Summary, List, Board, Code, Forms, Timeline, Pages |
| Goals | Summary, List, Board, Code, Forms, Timeline, Pages |
| Documents | All Documents, Recent, Shared, Templates, Settings |
| Issues | Summary, List, Backlog, Board, Epics, Timeline, Team, Settings |
| Automations | Summary, List, Board, Workflows, Triggers, Templates, History, Code, Forms, Settings |

---

## SESSION LOG (2026-07-22/23) — v1.0.0 through v1.3.0

### PRs #112-#136 (Sandbox Agent — 36 improvements)

| # | What |
|---|------|
| 1 | Workflow engine — status transition validation |
| 2 | Bulk operations API — batch update/delete up to 100 issues |
| 3 | Webhooks wired — issue.created and issue.updated events fire |
| 4 | Mobile auth hardened — lockout + failed login recording |
| 5 | Search expanded to 6 entity types (Prisma OR conflict fixed) |
| 6 | Mobile slideout — 100dvh for proper scrolling |
| 7 | Project delete button — added to project card dropdowns |
| 8 | Input validation — Zod on issues/projects POST/PATCH |
| 9 | Rate limiting — on data mutation routes |
| 10 | i18n keys — hierarchy + audit log sections (+41 keys per language) |
| 11 | Issue hierarchy tree view (Epic > Story > Task > Subtask) |
| 12 | Command palette enhanced |
| 13 | Dashboard error boundary |
| 14 | 7 new test suites |

### Post-#136 (Local Agent — cleanup & docs)

| Commit | What |
|--------|------|
| `f7be683` | Ethio Telecom cloud pricing briefing (HTML+MD) + translation export (2,748 keys XLSX) |
| `be48592` | Search fix — `flatItems` missing all `search-*` categories |
| `00d9924` | Docs reorganized into 8 categorized folders, 31 scripts organized |
| `179ad21` | INSA test scripts removed, Sentry DSN crash fixed, CSP worker-src added |

### Git Tag History

| Tag | Commit | Date | What |
|-----|--------|------|------|
| v0.2.0 | `6c6326c` | 2026-03-01 | Dual dashboard system |
| v1.0.0 | `f7a5fdd` | 2026-07-22 | First production release, INSA certified |
| v1.2.0 | `f7be683` | 2026-07-23 | 36 improvements from sandbox agent |
| v1.3.0 | `179ad21` | 2026-07-23 | Search fix, docs reorg, INSA cleanup, Sentry/CSP fixes |

Branch: `master` | Total commits: 567

---

## DOCUMENTATION STRUCTURE

All docs organized in `docs/` — see `docs/INDEX.html` for full branded index.

| Folder | Contents | Count |
|--------|----------|-------|
| `docs/architecture/` | Technical arch, multi-tenant, three-tier federation | 3 |
| `docs/deployment/` | Ethio Telecom, Vercel, runbooks, backups, translations | 14 |
| `docs/security/` | INSA hardening, OAuth, email, secrets | 4 |
| `docs/development/` | Setup guide, logging, linguist review | 4 |
| `docs/business/` | Pitch deck, exec summary, readiness report, store metadata | 6 |
| `docs/legal-ip/` | EIPA filing package, DEPOSIT folders | 2 packages |
| `docs/marketing/` | INSA blog, LinkedIn calendar, NGO outreach | 4 |
| `docs/video-scripts/` | 10-part product demo series | 11 |

---

## ETHIO TELECOM DEPLOYMENT — DECISION PENDING

**Recommended: Scenario 2 (126,815 ETB / 6 months, ~$169/month)**
- Production VM: CSRAMOPT05 (4 vCPU, 32GB RAM, 50GB SSD, 4Mbps)
- ETZ Daily Backup: 100GB, 7-day retention (managed by Ethio Telecom)
- Staging: Vercel (free, no data sovereignty impact)
- Dual-layer backup: ETZ managed snapshots + our backup-db.sh
- Full briefing: `docs/deployment/ETHIO_TELECOM_CLOUD_PRICING_BRIEFING.html`

### Co-Founder Decisions Needed
1. Approve Scenario 2 budget (126,815 ETB / 6 months)?
2. Approve contacting ETZCloudSupport@ethiotelecom.et for EVS storage pricing?
3. Order now (maximize INSA window) or wait for signed LOI?
4. Which DAPS Analytics account covers the payment?

---

## INSA TEST ACCOUNTS

- **Scripts removed** from codebase (clean production code)
- **6 accounts kept** in Supabase DB for next recertification (~January 2027):
  - `insa.owner@insa-test.et`, `insa.admin@insa-test.et`, `insa.member@insa-test.et`
  - `insa.viewer@insa-test.et`, `insa.guest@insa-test.et`, `reviewer@onekof.com`
- Do NOT delete DB accounts — saves setup time for next INSA engagement

---

## TRANSLATION STATUS

- 2,748 keys across 5 languages (EN, AM, OM, TI, SO)
- Zero missing keys — all AI-generated, pending linguist review
- Export: `docs/deployment/Onekof_Translations_For_Linguist_Review.xlsx`
- 5 sheets: per-language (Key, English, Translation, Notes) + master view

---

## OPEN PRs

- **#144** — Sprint & Settings foundation Phase 1 (draft; dark launch, schema + APIs, no UI)

All 4 orphaned PRs (#98-#101) closed on 2026-07-23.

---

## SECURITY RULES (always check PROJECT_GUIDELINES.md before touching auth)

- PUBLIC: all org members ✓
- INTERNAL: all org members ✓ (aligned with buildProjectAccessFilter)
- PRIVATE: explicit ProjectMember record required
- CONFIDENTIAL: explicit ProjectMember record required + audit log
- Default new project visibility: PUBLIC

---

## MOBILE APP STATUS (separate — apps/mobile)

iOS TestFlight: ✅ Live (build 3, version 1.0.0)
Android: ⏳ Blocked on Google Play Console device verification

See `STORE_METADATA.md` for full App Store / Play Store copy.

| Item | Value |
|---|---|
| Apple ASC App ID | 6763942879 |
| Apple Bundle ID | com.dapsanalytics.onekof |
| EAS Project ID | de51f86c-459c-4330-83df-7b481b9e9740 |
| Firebase Project | onekof-pm-840af |
| Reviewer email | reviewer@onekof.com |

---

## KEY COMMANDS

```bash
# Web dev
cd C:\Users\olita\onekof-platform\apps\web
pnpm dev

# Mobile dev
cd C:\Users\olita\onekof-platform\apps\mobile
npx expo start

# Push to Vercel
cd C:\Users\olita\onekof-platform
git push origin master
```
