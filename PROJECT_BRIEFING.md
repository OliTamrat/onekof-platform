# Onekof Web Platform — Session Briefing
> Last updated: 2026-07-18 — Profile photo upload, RBAC enforcement, member management, issue hierarchy

---

## CURRENT STATUS (2026-07-14)

### Tier 3 (Vercel + Supabase) — Live
Web platform is live at **onekof.com** and org subdomains.
204/204 unit tests passing. TypeScript strict build: 0 errors. Sentry active.
INSA security code (P1-P6): implemented — but see CSRF note below.

### Phase 2 (EthioTelecom Tier 2) — PRE-LAUNCH
INSA certification completing this week. Moving to Tier 2 deployment.
Full infrastructure audit completed: `docs/deployment/INFRASTRUCTURE_AUDIT_2026_07.md`

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

### Pending Tasks

| Priority | Task | Details |
|----------|------|---------|
| **P0** | E2E test invitation flow | Full test: new email → incognito → signup → accept → GUEST-restricted dashboard |
| **P1** | Expand translation files | ~350 of ~1,020 keys done. AM, OM, TI, SO files need expansion to match full en.json |
| **P1** | Integrate `t()` across all pages | Auth pages, sidebar nav, settings, projects, issues, budget, teams, goals, docs, onboarding, landing page |
| **P1** | Issue hierarchy tree view | Current kanban shows type badges + parent refs. Full tree view (Epic → Story → Task → Subtask) not yet built |
| **P1** | Filter subtasks from top-level kanban | Subtasks currently appear alongside parents as independent cards |
| **P2** | k6 test configuration | Sute Dullo needs `BASE_URL` + test credentials configured before running scalability tests |
| **P2** | QA team readiness | Security tests (SEC-01 through SEC-12) can begin |
| **P2** | Profile photo in navbar | Navbar avatar circle still shows initial letter — should show uploaded photo |
| **P2** | Remove debug logging | `api/issues/route.ts` and `api/organizations/[id]/projects/route.ts` have RBAC debug `logger.info` calls |
| **P2** | Remove debug logging | `api/issues/route.ts` and `api/organizations/[id]/projects/route.ts` have RBAC debug `logger.info` calls — remove after confirming GUEST works |

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

## KEY FILES TOUCHED THIS SESSION

| File | What changed |
|---|---|
| `apps/web/src/lib/security/authorization.ts` | `requireProjectAccess` — INTERNAL projects now allowed for all org members (both read and write branches) |

---

## RECENT COMMITS (last 10)

```
7a77fa7  Fix 403 on issue detail and task updates for MEMBER-role users
4a41fc1  Update roadmap: mark Sentry, Resend, and webhooks as shipped
6b05203  Update README: add mobile app section, waves 4/5 roadmap, EIPA registration status
725050a  Fix Vercel deploy hitting 5000-file upload limit
ba6d191  Fix MEMBER users seeing 0 issues after creating them
2cb1bf1  Fix service worker crash killing all page network requests
e4b1994  Add error toast to department task create and surface silent failures
188f2e1  Fix create task silently failing on all department sub-pages
fd291b3  Fix cross-org member contamination in issue detail slideout
1cdcca6  Fix nav create shortcuts and broken translation key
```

Branch: `master` | Total commits: 425

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
