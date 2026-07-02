# Onekof Web Platform — Session Briefing
> Last updated: 2026-07-02 — Infrastructure audit + Phase 2 pre-analysis complete

---

## CURRENT STATUS (2026-07-02)

### Tier 3 (Vercel + Supabase) — Live
Web platform is live at **vision.onekof.com** and other org subdomains.
204/204 unit tests passing. TypeScript strict build: 0 errors. Sentry active.
INSA security code (P1-P6): implemented — but see CSRF note below.

### Phase 2 (EthioTelecom Tier 2) — PRE-LAUNCH
INSA certification completing this week. Moving to Tier 2 deployment.
Full infrastructure audit completed: `docs/deployment/INFRASTRUCTURE_AUDIT_2026_07.md`

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
