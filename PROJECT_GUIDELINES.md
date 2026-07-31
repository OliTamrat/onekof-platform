# PROJECT_GUIDELINES.md — Onekof Project Rules

These rules apply to any contributor or AI coding assistant working on this codebase.

## Git Commit Rules (MANDATORY)

- **ALWAYS** set both author AND committer to: `Oli Tamrat Oli <oli.oli@udc.edu>`
- **NEVER** append any external session URLs or third-party tool signatures to commit messages
- **NEVER** use `Co-Authored-By` lines referencing any third-party tool or model
- Use environment variables for every commit:
  ```
  GIT_COMMITTER_NAME="Oli Tamrat Oli" GIT_COMMITTER_EMAIL="oli.oli@udc.edu" git commit --author="Oli Tamrat Oli <oli.oli@udc.edu>" -m "message"
  ```
- This is required for **IP registration purposes** — no exceptions

## Code Style

- Currency: default to ETB (Ethiopian Birr)
- Fiscal year: starts July (Ethiopian fiscal year)
- No mock/hardcoded data in production pages — always use real API data
- Theme color: `#1C8C7D` (primary teal)

## Design System Rules

- **`<Button>` wrapping anything other than a label needs `layout="block"`.** The base class carries `inline-flex justify-center whitespace-nowrap`, which is right for "Save" and wrong for a card, an option, or a stacked title-and-description. **`whitespace-nowrap` inherits** — a paragraph nested three levels inside still refuses to wrap, and the height collapse that follows reads as a styling accident rather than a component contract. This one class broke four screens in a single day (Customization presets, its toggles, its header, AI Insights cards, onboarding options). If the button contains a `<div>`, a `<p>`, or text that must wrap: `layout="block"`.
- **Font**: Inter via `next/font/google` for Latin languages; Abyssinica SIL for Ge'ez script (AM/TI). Never use SF Pro (Apple-only, breaks on Windows).
- **Modals**: Bottom sheet on mobile (rounded top + drag handle), centered dialog on desktop. Always include teal accent bar.
- **Page headers**: Always use `UnifiedPageHeader` with the appropriate tab config from `config/department-tabs.ts`. Never build custom headers.
- **Stat cards**: Use plain `div` cards with `bg-white dark:bg-[#22272B] border rounded-lg px-4 py-3`. Never wrap stats in `Button` components.
- **Content width**: Never use `max-w-*xl mx-auto` constraints inside page content areas — content should fill the available space.
- **Empty states**: Use `EmptyState` component with preset + `onAction` handler. Every page must have a contextual create/add action.
- **Department pages**: Use `DepartmentTaskList` with `defaultLabels` — the filter only shows issues with matching labels (not all issues).
- **Sidebar navigation**: All features must be included in `enabledSections` in both the default settings context AND all organization presets, or they will be hidden.
- **Dark mode text**: Landing page uses `text-white/70`+ for body text (never /40 or /50). Dashboard uses global CSS overrides in globals.css.
- **Card borders**: Use `border-white/20` minimum on dark backgrounds. Feature cards need `h-full` for equal height.
- **Activity feeds**: Cap at `max-h-[500px]` with `overflow-y-auto` to prevent infinite scrolling.

## i18n Rules

- 5 languages: EN, AM, OM, TI, SO
- All user-facing strings must use `t()` from `useLanguage()` hook
- Translation keys go in `apps/web/src/locales/{en,am,om,ti,so}.json`
- AM/OM/TI/SO translations are AI-generated — flag for linguist review
- When adding new keys, add to ALL 5 locale files
- Mobile nav must include language switcher (in "More" menu)

## Sprint & Settings Rules

- **Settings resolution**: NEVER read `ProjectSettings`/`OrganizationSettings` sprint-workflow fields directly — always go through `resolveProjectSettings()` in `apps/web/src/lib/settings/resolve.ts`. Null at project level means "inherit from org", and only that utility encodes the rule.
- **Sprint lifecycle**: PLANNED → ACTIVE → COMPLETED, terminal. One ACTIVE sprint per project is enforced by the DB partial index `sprints_one_active_per_project` — catch Prisma `P2002` and return 409, never pre-check with a query.
- **Snapshots are write-once**: `committed*` at start, `completed*` at completion. Never recompute or backfill them.
- **Sprint completion / deletion / settings changes** must emit `OrgAuditLog` entries (INSA). Sprint membership changes on tasks emit `TASK_SPRINT_CHANGED` activity — reports depend on it.
- **Entity IDs are cuids, not UUIDs** — validate route/body IDs with the shared `uuidSchema` (cuid-compatible token validator) from `lib/validation/schemas.ts`, never `z.string().uuid()`.
- Architecture reference: `docs/architecture/SPRINT_AND_SETTINGS_ARCHITECTURE.md` (approved v1.2). Phases 2-4 need founder go-ahead per phase.

## Deletion Rules (MANDATORY — read before removing anything user-facing)

Full policy: `docs/architecture/DELETION_POLICY.md`. The short form:

- **Classify first**: *fabricated* (hardcoded data, no query — delete), *honest empty* (empty state, promises nothing — keep), *dead* (no inbound references — delete after tracing the whole cluster), *real* (queries data — keep)
- **Rebuild-first rule**: if a model and API already exist for the feature, **rebuild it, do not delete it**. Deleting a page whose model exists costs the rebuild plus the deletion plus a second review. This rule exists because Goals List and Board were deleted and rebuilt on the same day.
- **Prune every reference in the same change** — grep the path, not just the import. A page may never be left unreachable-but-present; that state looks deleted and isn't.
- **Guards state a re-entry condition, never a permanent ban.** "This must never exist" makes the guard an obstacle to correct work. Say what must be true for it to return, so a later change can *satisfy* the guard rather than delete it.
- **Never delete infrastructure** (Vercel projects, databases, DNS). Code is restorable from git; those often are not, and may carry configuration recorded nowhere in the repo. Propose with evidence and stop.
- **Batch pushes.** See "Wave Delivery" below — this is a hard rule, not a preference.

## Wave Delivery (MANDATORY)

**What a push actually costs:** one GitHub Actions run (~6.5 min) plus **two** Vercel deployments — the repo has two Vercel projects, `onekof-platform` and `onekof-platform-web`, both building `apps/web`.

On 2026-07-29 roughly twenty pushes produced ~130 minutes of Actions time and 40+ deployments, several of them cancelling each other mid-run. Cancelled runs deliver nothing and cost the same. The Vercel free tier stopped at 100 deployments that day.

### The rule

1. **Work in waves.** A wave is a themed batch of related items — a *security* wave, an *M1* wave, a *UI* wave. Complete the whole wave locally before pushing anything.
2. **Verify between items, push once.** Run `npx vitest run` and `npx tsc --noEmit` after each item. Commit locally as you go — commits are free. **Only the push costs.**
3. **One push, one PR, one CI run per wave.** Target 3–6 items per wave.
4. **Never push while CI is running** on the same branch unless the running build is already irrelevant. Concurrency cancellation means the earlier run is discarded — pure waste.
5. **Exception, and only this one:** a live security hole or a production-breaking bug ships immediately as its own wave of one. Correctness outranks quota.

### Why commits are free but pushes are not

Local commits trigger nothing. A wave of six items can be six well-scoped commits with six clear messages and still cost **one** CI run. Granular history and cheap delivery are not in tension — the mistake is treating `git push` as part of `git commit`.

### Deployment config: production only — and what that does NOT buy

`apps/web/vercel.json` sets `ignoreCommand` so **only production builds**. Pull requests get no preview URLs; correctness is gated by the GitHub Actions build instead.

**It does not reduce the deployment count.** `ignoreCommand` skips the *build*; Vercel still **creates** a deployment record for every push, and the free-tier cap that bites is `api-deployments-free-per-day` — which counts creations. On 2026-07-29 previews were being skipped all day and the 100/day cap was still reached.

So this setting saves build minutes and nothing else. It was added in response to a quota complaint and was measured against the wrong meter. The lever that would actually stop deployments being created is `git.deploymentEnabled` in `vercel.json`:

```json
"git": { "deploymentEnabled": { "claude/*": false } }
```

**Unverified** — not yet confirmed against Vercel's schema, and `vercel.json` has already rejected one unknown key this project tried (`"//ignoreCommand"`). Test it on a day with quota headroom.

**Read this before touching that line.** Vercel **skips** the build when `ignoreCommand` exits **0** and **proceeds** when it exits **1**. The condition therefore looks inverted at a glance:

```
if [ "$VERCEL_ENV" = "production" ]; then exit 1; else exit 0; fi
```

Getting it backwards disables **production**, not previews.

`vercel.json` is validated against a strict schema that rejects unknown keys — including `//`-prefixed pseudo-comments, which is why this explanation lives here rather than beside the setting. A first attempt put a `"//ignoreCommand"` array in the file and failed the deployment outright.

Both Vercel projects (`onekof-platform`, `onekof-platform-web`) build `apps/web` and share this file, so it cannot distinguish them. Restoring previews for one project only is a dashboard change.

### Holding a wave back? Write it down here. (MANDATORY)

Batching creates a hazard the old push-everything habit did not have: **work that is finished locally but not merged is invisible.** A session ends, context is lost, and a real fix sits in a branch nobody remembers. The whole point of waves is deferral, so the ledger is not optional bookkeeping — it is the thing that makes deferral safe.

**Whenever a push or merge is deliberately deferred**, add the item to *Deferred / Unfinished Work* below before ending the exchange. One line: what it is, why it was held, and what unblocks it.

Remove the entry when it ships. An empty list is the goal, not an aspiration.

This applies to a decision to wait — not to work still in progress within an active wave.

---

## Deferred / Unfinished Work

*Held deliberately. Each entry needs a reason and an unblock condition.*

| Item | Why held | Unblocks when |
|---|---|---|
| `BLIND_INDEX_KEY` not set on any Tier 1/2 deployment | No Tier 1/2 deployment exists yet — the ECS VM is unprovisioned. **NOT Vercel:** that is Tier 3, patient routes 404 there regardless, so the key would sit unread | ECS VM provisioned, or `docker-compose.tier-sim.yml` stood up locally — it now *requires* the key and resolves to Tier 2, so it runs the full M1/M2 surface. `GET /api/health` reports `patientFeatures.ready` and why not. **Until then every patient write throws** |
| Docker image 64 commits stale (last tag v1.3.0, 2026-07-23) | `docker-build.yml` only fires on a `v*.*.*` tag or manual dispatch. The image predates sprints, departments, M1, M2, ETB currency and every 2026-07-29 authorization fix | A release is tagged. **Tag before any Tier 1/2 deploy** — the current image against today's migrated schema would be a week-old app on a new database |
| `git.deploymentEnabled` in `vercel.json` | Founder asked for no changes pending a conversation with the terminal agent about the duplicate Vercel project | That conversation concludes. Removing the duplicate project may make it unnecessary — it halves deployments on its own |
| Duplicate Vercel project `onekof-platform-web` | Founder decision, not engineering — explicitly told not to delete anything | Founder decides. Doubles every deployment while it exists |
| Counsel brief on Art. 22 sectoral scope | Written and ready; blocks nothing — M5 already restricts to in-country, so counsel can only relax it | Founder sends it |
| **GitHub Actions receives no runners for this repo** | **Not a code defect — proven.** Since 2026-07-29 between 18:51 and 20:50, *every* run of *both* workflows fails in 3–9s with `runner_id: 0`, no runner name, no `steps` array and **no log file at all** (log download 404s). It spans `CI` on `pull_request` and `Deploy to Production` on `push` — two different workflow files, two different triggers, stopping at the same instant. `git diff` between the last green commit and the first red one shows **zero changes** to `.github/`, `package.json` or `pnpm-lock.yaml`. **The clincher: commit `66e53b6` changed two markdown files and nothing else, and failed identically in 10s.** No code change can explain a docs-only commit failing before any step runs. The reason is not exposed through the REST API (`output.summary`/`text` are empty) — it is only shown as a banner on the run page in the browser | Founder opens https://github.com/OliTamrat/onekof-platform/actions/runs/30640685313 and reads the banner, then `Settings → Actions → General` and `Settings → Billing`. **Consequence while broken: merges no longer run `prisma migrate deploy`.** Vercel's Git integration deploys independently, so app code still ships — schema changes do not |
| M3 — surfacing the Medical module | Shipped (#198) and now reachable from the sidebar (#199) | — |
| Sidebar editions E1–E4 | Designed, not built. `docs/architecture/SIDEBAR_EDITIONS_ARCHITECTURE.md` is PROPOSED — S1–S9 need founder approval, and 4 open questions need answers | Founder approves the decisions and answers §6 |

Two Vercel projects building the same directory doubles every deployment permanently — the third row above. Removing one would halve the cost with no change in behaviour, but that is a founder decision, not an engineering one (see `docs/architecture/DELETION_POLICY.md` §5).

## Security Rules

- **`requireAuthentication()` only authenticates.** It answers "who is this?" and never "may they touch this?". Any route acting on an id from the URL must also call `requireProjectAccess`, `requireOrganizationMembership` or `requireExpenseAccess`. Every authorization defect found on 2026-07-29 was a route that stopped after the first one.
- **Resolve tenancy from the request**, via `resolveUserOrganization()` — never `session.user.organizations[0]`, which is the user's first membership and ignores which workspace they are actually in
- **RBAC enforcement**: `/api/projects` and `/api/issues` apply `buildProjectAccessFilter` based on org role + project visibility
- **Project visibility**: PUBLIC (all org members see it), INTERNAL (project members + org admins), PRIVATE (explicit members only), CONFIDENTIAL (restricted + audit log)
- **Default visibility** for new projects: PUBLIC (set in create-project-modal form state)
- **Session strategy**: JWT, cookies scoped to subdomain
- **Account lockout**: enabled (see `lib/security/account-lockout.ts`)
- **Password requirements**: minimum 8 chars, bcrypt 12 rounds
- **Email verification**: required on signup

## Database / Migration Rules

### Merging to master ALREADY applies migrations

`.github/workflows/deploy-production.yml` runs `prisma migrate deploy` on every
push to `master` matching `apps/web/**`, `packages/**` or `pnpm-lock.yaml`.
Migrations live under `packages/database/prisma/migrations/`, so **any PR
carrying a migration applies it on merge**, one to two minutes later, before
the build.

Tier 1 / Tier 2 migrate separately: `deploy-et.yml` runs `prisma migrate
deploy` inside the container on the ET VM, triggered by the Docker build
workflow rather than by the push.

The manual **DB Migrate** workflow is a **backstop**, not the mechanism. Reach
for it only to apply a migration the pipeline does not reach, to re-run an
idempotent migration to confirm state, or to use its per-object verify step.

**This was documented backwards on 2026-07-29** and cost five manual workflow
runs to apply migrations that had already been applied on merge — every one a
no-op that "succeeded" because the SQL is idempotent. Before asking anyone to
run a migration by hand, check `_prisma_migrations.finished_at` against the
merge commit time; a delta of one to two minutes means the pipeline did it.

- **Be cautious with migrations**: Always verify applied state with `prisma migrate status` first
- **Supabase + Prisma + Vercel pooling**: `DATABASE_URL` must include `pgbouncer=true&connection_limit=1`
- **Vercel region**: pinned to `fra1` (Frankfurt) to colocate with `aws-1-eu-central-1` Supabase
- **Before creating a new migration**: read existing migrations folder, use manual SQL (not auto-generated) for destructive changes, mark old failed migrations as applied if tables already exist

## Performance Rules

- **React Query config**: `staleTime: 5min`, `refetchOnMount: false`, `retry: 1`
- **Prisma includes**: prefer `_count` over full relation loads. Never do "load all tasks then count in JS" — use `count()` / `groupBy` on the DB.
- **Optimistic updates**: apply onMutate snapshot + rollback pattern to kanban drag, slideout field edits, backlog reorder
- **No N+1**: use `include` or batched `findMany`

## TypeScript Error Policy

- **Known cosmetic errors** (`TS2786`, `TS2322` on `Link` / `ChevronRight` / `LucideIcon` / `ReactNode`) come from duplicated `@types/react` in the pnpm store. Code runs fine at runtime; Next.js + Vercel ignore them during build.
- **During feature work:** ignore pre-existing TS errors. Only act on errors in files you are actively modifying for the task at hand. Never wrap in `@ts-ignore` or alter working runtime code to satisfy `tsc`.
- **Known-affected files (do not touch for type reasons):** `components/dashboard-layout.tsx`, `components/layouts/app-layout.tsx`, `app/dashboard/automations/templates/page.tsx`, `lib/api-organization.ts` (also has a runtime concern — see memory).
- **Proper fix (standalone infra PR, never bundled with features):**
  1. `pnpm why @types/react` from repo root — confirm duplicates
  2. Add `pnpm.overrides` to root `package.json`: `"@types/react": "18.3.x"`, `"@types/react-dom": "18.3.x"`
  3. Delete `node_modules` + `pnpm-lock.yaml`, run `pnpm install` fresh
  4. Confirm `pnpm why @types/react` shows single resolution, re-run `tsc --noEmit`, commit as `chore: dedupe @types/react`

## Project / Platform Context

- **Platform**: Onekof — multi-tenant PM platform for Ethiopian and East African teams
- **Deployment**: Vercel (serverless, fra1 region)
- **Database**: Supabase Postgres 15
- **Subdomain routing**: `{orgslug}.onekof.com` → middleware sets `x-organization-slug` header
- **Commit attribution**: every commit is `Oli Tamrat Oli <oli.oli@udc.edu>` (for IP registration)
- **Web**: https://onekof.com · **Support**: support@onekof.com
- **IP**: Oli Teshome (author / moral rights) · DAPS Analytics (commercial rights)

## Platform Overview

| App | Stack | Status |
|-----|-------|--------|
| Web (`apps/web`) | Next.js 14, Prisma, Supabase, Vercel | Production |
| Mobile (`apps/mobile`) | Expo SDK 54, React Native 0.81.5, Expo Router | TestFlight Build 8 — blocked on logo + screenshots |
| Hakim (`hakim-saas-platform/`) | Next.js SaaS | Production |
| Olink Fleet (`Olink-Fleet/`) | Next.js | Production |
| Olink School Bus (`Olink-School-Bus/`) | React Native | Production |
| UDC WQIS (`UDC/`) | Next.js, Azure | Production (Azure migration done) |
| NOORUU (`nooruu-tube/`) | Next.js | Vercel deployed |

## Infrastructure

| Service | Purpose | Notes |
|---------|---------|-------|
| Vercel | Web hosting | Production — fra1 region |
| Supabase | Database (Postgres 15) | pgbouncer=true&connection_limit=1 required |
| Upstash Redis | Rate limiting | onekof-production, eu-west-1 |
| EAS Build | iOS/Android builds | Project: @olink/onekof |
| EAS Update | OTA updates | appVersion policy, channel: production |
| Sentry | Crash reporting | web + mobile (org: olink-fleet-production) |
| Cloudflare | DNS | Free plan — no wildcard SSL proxy (needs $10/mo ACM) |
| Firebase/FCM | Push notifications (Android) | google-services.json in place |

## Key Credentials & IDs

| Item | Value |
|------|-------|
| EAS Project ID | `de51f86c-459c-4330-83df-7b481b9e9740` |
| Bundle ID | `com.dapsanalytics.onekof` |
| App Store Connect App ID | `6763942879` |
| Apple Dev Team | `VMU339WDA5` (Oli T. Oli, Individual) |
| Apple Dev Email | `thatismysweetangel@hotmail.com` |
| Sentry Project | `onekof-mobile` |
| OTA Channel | `production` / Runtime Version `1.0.0` |

## App Store / Play Store

### App Store Connect Metadata
- **App Name:** Onekof · **Subtitle:** Project & Team Management
- **Primary Category:** Business · **Secondary Category:** Productivity
- **Bundle ID:** `com.dapsanalytics.onekof` · **SKU:** `onekof-ios-001`
- **Copyright:** 2026 DAPS Analytics. All rights reserved. · **Age Rating:** 4+
- **Keywords:** `project management,tasks,team,agile,budget,Amharic,Ethiopia,productivity,issues,sprints`
- **Support URL:** https://onekof.com/support · **Marketing URL:** https://onekof.com

### App Review Credentials
- **Email:** reviewer@onekof.com · **Password:** ReviewerOnekof2026!
- **Demo org:** Onekof Demo (slug: `reviewer-demo`) — status: ACTIVE
- **Demo data:** 12 sample issues across all statuses, 1 project (Mobile App Launch — DEMO)

### iOS Submission Blockers
- [ ] Professional logo: 1024×1024 PNG, no transparency, no alpha
- [ ] Screenshots: iPhone 16 Pro Max (1320×2868), no TestFlight bar

### Android
- `google-services.json` in place · `google-play-service-account.json` missing (needed for EAS auto-submit)
- Resume after iOS submission is complete

## Design System

- **Theme:** Nocturne dark editorial (shipped 2026-04-14)
- **Backgrounds:** `#0B0E11` (page), `#12161B` (card/sidebar), `#181D23` (elevated/hover)
- **Text:** `white/85` (primary), `white/50` (secondary), `white/30` (faint)
- **Borders:** `white/[0.08]` in dark mode
- **Accents:** `#1C8C7D` (teal primary), `#2BB5A2` (teal-light), `#8B5CF6` (violet for AI)
- **Headings:** `font-serif` (Playfair Display) for landing/marketing pages, Inter for dashboard
- **Buttons:** `rounded-full` with teal gradient `from-primary-500 to-[#2BB5A2]`
- **Cards:** `bg-[#12161B] border-white/[0.08] rounded-2xl` with top glow line on hover
- **Section labels:** teal dash prefix + uppercase tracking + `#2BB5A2` color
- **Grain overlay:** SVG turbulence filter on landing/about pages
- Applied across all 184 pages including dashboard, auth, onboarding, settings

## Mobile App

- **Stack:** Expo SDK 54, React Native, Expo Router, React Query
- **Location:** `apps/mobile/` in monorepo
- **Bundle ID:** `com.dapsanalytics.onekof` (iOS + Android)
- **Auth:** JWT-based via `/api/auth/mobile/signin` and `/api/auth/mobile/me`
- **API:** Points to `https://onekof.com` production API
- **Theme:** Same Nocturne color tokens as web (`src/constants/theme.ts`)
- **Quality bar:** Must match or exceed Jira Mobile — full CRUD, offline, push notifications, biometric auth

## Current Status (as of 2026-05-23)

**Launch stage:** Pre-launch. No paying customers. EIPA copyright deposit in progress — Co-Owner agreement + DAPS authorization letter pending before final deposit generation.

**Production deployment (Tier 3):** Live at `onekof.com` on Vercel serverless (fra1) + Supabase PostgreSQL 15 (aws-1-eu-central-1). 25 test/demo organizations, no real customer data.

**Mobile app:** Feature-complete (Expo/React Native). Push notifications, i18n 5 langs, EAS build linked. Known offline-mode bug on dashboard. App Store / Play Store submission pending Apple Dev membership ($99/yr).

**Build health:** TypeScript strict — `ignoreBuildErrors: false`. Zero TS errors enforced at build time. All 141 API routes auth-guarded.

**INSA compliance:** All P1–P6 security gaps closed (Wave 5, 2026-05-23):
- P1: CSRF origin validation on all mutation APIs
- P2: Admin rate limiting (60 req/min per IP)
- P3: Audit log append-only (DELETE → 405)
- P4: AES-256-GCM encryption on all uploaded files (`BLOB_ENCRYPTION_KEY` in Vercel prod)
- P5: Session invalidation on password change

**Architecture target:** Three-tier federated hosting (see `docs/architecture/three-tier-federation.md`):
- **Tier 1 — Government:** EthioTelecom Cloud (or Raxio fallback), `*.gov.onekof.et`. **Not yet built.** Requires signed government LOI before coding begins.
- **Tier 2 — Private:** On-premise Ethiopian server, `*.onekof.et`. **Code-ready** (Waves 1–5 shipped). Docker image 408 MB. Windows + Ubuntu deployment guides written. Test server build pending on Massano/i7/64GB rig.
- **Tier 3 — Global:** Vercel + Supabase, `*.onekof.com`. **Current production.**
- **DR:** Encrypted backups from Tiers 1/2 pushed to Vercel Blob / Supabase Storage. Deferred to Wave 6.

## Recently Shipped

### Wave 5 — INSA Security Hardening + Full Codebase Audit (2026-05-23)

**INSA P1–P6 security gaps closed:**
- `middleware.ts`: CSRF Origin header validation on all POST/PUT/PATCH/DELETE API routes (exempt: webhooks, auth, push)
- `middleware.ts`: Admin rate limiting — 60 req/min per IP on `/api/admin/*`
- `api/organizations/[id]/audit-log`: DELETE handler returns 405 — audit log is append-only by design
- `lib/storage/drivers/local-fs.ts`: AES-256-GCM encryption for all uploaded blobs — IV + authTag + ciphertext prepended format
- `api/files/[...path]/route.ts`: decrypts blobs before serving using `decryptBlobBuffer()`
- `api/user/change-password/route.ts`: calls `invalidateAllUserSessions()` after password update
- `BLOB_ENCRYPTION_KEY` added to Vercel production env (64 hex chars = 32 bytes)
- `.env.production.example`: added ADMIN_SECRET, ADMIN_USERS, CRON_SECRET, FIELD_ENCRYPTION_KEY with generation instructions

**Full codebase audit (EIPA pre-registration):**
- TypeScript: 5 errors fixed, `ignoreBuildErrors` set to `false` — zero errors enforced at build time
- Fixed: `middleware.ts` method from nextUrl, `vercel-blob.ts` access: public, `admin-audit.ts` JSON cast, `audit-log/page.tsx` deps array, locale `auditLog` nav key in am/so/ti/om
- `not-found.tsx`: custom 404 page added matching Nocturne design system
- i18n: all 5 locales fully aligned — am/so match en exactly; ti/om have 6 harmless extra unused keys
- Confirmed: all 141 API routes auth-guarded, all 5 debug routes behind requireSuperAdmin, security headers set

### Wave 4 — Org Audit Log (2026-05-05)

- `OrgAuditLog` Prisma model + migration `20260505_add_org_audit_log`
- `lib/security/org-audit.ts`: `logOrgAction()`, 35-action catalogue, fire-and-forget
- 10 routes instrumented: projects, members, invitations, teams, expenses approve/reject
- Viewer page: `dashboard/settings/audit-log` — paginated, filterable, OWNER/ADMIN only
- Sidebar nav link added in all 5 languages

### Nocturne UI/UX Redesign + Mobile App + SEO (2026-04-14/15)

**UI/UX — Nocturne dark editorial design:**
- Landing page: two-column hero with floating feature cards, real product screenshots, serif headings (Playfair Display), grain overlay, video modal, equal-height pricing cards
- All 184 dashboard pages migrated to Nocturne tokens (#0B0E11/#12161B/#181D23)
- Auth pages (7): deeper bg, serif headings, teal gradient buttons, back-to-home navigation
- Onboarding: Nocturne card design, 48px icon boxes, top glow hover effects
- About page: complete rewrite with DAPS Analytics section, three deployment tiers, values
- Sidebar: elevated to #12161B, collapsible with icon-only mode, visible border
- Select-organization, all shared UI primitives (Card, Input, Slideout), unified header updated

**OAuth providers:**
- Google OAuth configured (Onekof PM project in Google Cloud Console)
- Microsoft Azure AD configured (multi-tenant, Entra ID)
- GitHub provider wired (needs OAuth app + env vars)
- LinkedIn provider wired (needs app + env vars)
- OAuth redirect: always through main domain (onekof.com) for multi-tenant compatibility

**SEO:**
- `sitemap.ts`: 7 public pages with priority/frequency
- `robots.ts`: allow public pages, block /api/ /dashboard/ /admin/
- JSON-LD structured data: SoftwareApplication schema with features, pricing, author
- Brand keywords: Onekof, Onekof PM, Onekof project management, DAPS Analytics
- OG image: real dashboard screenshot
- Page-level metadata on about, privacy, terms, cookies
- Google Search Console verified + sitemap submitted (7 pages discovered)

**Mobile app foundation:**
- Expo SDK 54, React Native, Expo Router, React Query, expo-secure-store
- JWT auth endpoints: `/api/auth/mobile/signin`, `/api/auth/mobile/me`
- 4 tabs: Dashboard, Projects, Issues, More
- Auth flow: signin → org select → dashboard
- Bundle ID: com.dapsanalytics.onekof

### Security Hardening Sprint (2026-04-13)

INSA pentest readiness audit: 9 findings fixed, security score 85% → ~95%.
- Admin token IP binding + 8hr expiry + secure-only cookies
- Org isolation: block defaultOrganizationId fallback on API routes without subdomain context
- Vercel Blob storage changed from `access: 'public'` to `access: 'private'`
- File upload MIME type whitelist (blocks executables, scripts, HTML)
- `/api/env-check` and `/api/test-db` blocked in production
- Constant-time bcrypt compare to prevent user enumeration timing attacks
- Rate limiting on organization creation endpoint
- Per-email rate limiting on password reset

### UI/UX Pages (2026-04-13)

- `/about` page — mission, stats, differentiators, CTA (team section deferred for profile build)
- `/privacy` page — data sovereignty tiers, security measures, user rights
- `/terms` page — subscription model, data ownership, Ethiopian governing law
- `/cookies` page — cookie table with names, purposes, durations, security flags
- Navbar About link → `/about` (was `#about` testimonials)
- Footer Privacy/Terms/Cookies → actual pages (were `#`)
- Slogan: "Built for Ethiopia" → "Where African teams do their best work" (all 5 languages)
- Pricing language corrected to monthly/yearly subscription (not one-time purchase)

### Production Config (2026-04-13)

- Upstash Redis connected (onekof-production, eu-west-1, Ireland)
- ADMIN_USERS bcrypt hashes updated in Vercel
- ADMIN_SECRET set in Vercel
- Wave 3 migrations applied to Supabase (rate_limits dropped, admin_audit_logs created)
- Cloudflare SSL: Full (Strict) attempted, reverted to Flexible (needs $10/mo ACM for wildcard proxy)

### Wave 2 — Security Hardening + Standalone Docker (2026-04-12)

**What landed in runtime code:**
- **Admin bcrypt hashing** — `api/admin/login/route.ts` now uses `bcrypt.compare()` instead of plaintext password comparison. `ADMIN_USERS` env var must store bcrypt hashes (12 rounds).
- **Debug routes blocked in production** — middleware returns 404 for all `/api/debug/*` routes when `NODE_ENV=production`.
- **Tenant isolation at middleware edge** — middleware decodes JWT to verify user belongs to the subdomain's organization before allowing access. Non-members redirected to `/select-organization?error=access_denied`.
- **Standalone Docker output** — `output: 'standalone'` in `next.config.mjs`. Docker image reduced from 2.6 GB to 408 MB. No pnpm/corepack needed at runtime.

**What landed in infrastructure:**
- `apps/web/Dockerfile` — rewritten runner stage for standalone: `node apps/web/server.js` replaces `next start` via node_modules
- `.env.tier2.example` / `.env.tier3.example` — added `ADMIN_SECRET` and `ADMIN_USERS` with bcrypt format docs
- `scripts/generate-admin-hash.mjs` — helper script to generate bcrypt hashes for `ADMIN_USERS`

**What landed in documentation:**
- `docs/architecture/three-tier-federation.md` — comprehensive developer reference for the federated hosting system
- `docs/deployment/windows-deployment-guide.md` — Docker Desktop deployment on Windows for Ethiopian market
- `ONEKOF_IP_CLAIMS_ASSESSMENT.md` — IP claims analysis with 4 potentially patentable innovations

**Empirical validation (2026-04-12):**
- Docker image rebuilt: 408 MB standalone image, HTTP 200, login + dashboard functional
- All three tiers unaffected — env-driven architecture preserved, no code branches between tiers

**Remaining Wave 2 config items (not code — require Oli's dashboard action):**
- Cloudflare SSL mode: Flexible → Full (Strict)
- Upstash Redis: set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in Vercel
- Update `ADMIN_USERS` in Vercel with bcrypt hashes

### Wave 1 — Portability PR (2026-04-11)
Nine commits on `master` (`d014a9c..4c14a59`) that lift every hardcoded Vercel/.onekof.com assumption behind env vars while preserving Tier 3 behavior exactly. Plus three follow-up commits (`0e19dad..8725e93`) adding Dockerfile, docker-compose Tier 2 simulation, deployment runbook, and the EthioTelecom requirements letter.

**What landed in the runtime code:**
- `AUTH_COOKIE_DOMAIN` env var (was hardcoded `.onekof.com`)
- `PUBLIC_HOSTS` env var for middleware hostname parser (was hardcoded `onekof.com,localhost,vercel.app`)
- `NEXT_PUBLIC_SUBDOMAIN_DOMAINS` env var for client-side routing
- `STORAGE_DRIVER` env var with pluggable driver architecture (`vercel-blob` | `local-fs` | `s3`) — default preserves Tier 3 behavior
- `lib/env/runtime.ts` — `getRuntimeInfo()` replaces direct `VERCEL_*` env reads in 5 files
- `lib/routing/subdomain.ts` — client-side subdomain helpers, replaces 5 copy-pasted `.onekof.com` regex blocks
- `Organization.hostingTier` enum field (`GLOBAL_CLOUD | PRIVATE_ONPREM | GOV_ETHIOTELECOM`), default `GLOBAL_CLOUD`, all 25 existing orgs backfilled
- `0_init` baseline Prisma migration (1,389 lines) that was missing entirely — required for any new Postgres to be provisioned
- Wave 1 schema migration: `HostingTier` enum + 2 missing indexes (`BudgetCategory.budget_id`, `automation_rules(organizationId, isEnabled, deletedAt)`)
- Prisma `binaryTargets += 'debian-openssl-3.0.x'` for Ubuntu self-hosting

**What landed in infrastructure:**
- `apps/web/Dockerfile` — multi-stage Node 20-slim, Ubuntu-compatible, ~2.6 GB runtime image (default output — standalone deferred to Wave 2)
- `docker-compose.tier-sim.yml` — full Tier 2 stack (Postgres 15 + Redis 7 + Onekof) runnable on a dev laptop
- `.dockerignore` with secret hygiene
- `.env.tier2.example` — fully documented Tier 2 config template
- `.env.tier3.example` — current production config reference

**What landed in documentation:**
- `docs/deployment/tier-2-runbook.md` — 671-line runbook from bare Ubuntu to live production Tier 2
- `docs/business/ethiotelecom-cloud-requirements-letter.md` — formal inquiry to EthioTelecom Cloud for Tier 1 evaluation
- `packages/database/prisma/migrations/README.md` — explains the baseline + deployment flow
- Memory entries under `.claude/projects/C--Users-olita/memory/`

**Empirical validation (2026-04-11 evening):**
- Vercel production (`onekof.com`): still serving HTTP 200 after all 9 Wave 1 commits, tenant subdomains work, auth is enforced.
- Local Docker simulation: full Tier 2 stack boots on developer laptop, serves HTTP 200 on `http://localhost:3000`, local Postgres has all 41 tables and 32 enums, `hosting_tier` column present. Zero Vercel/Supabase involvement.
- Supabase migration state: `20260411120000_portability_wave1` applied, `_prisma_migrations.0_init` marked applied via `prisma migrate resolve`.

## Next Work Priorities

### Priority 0: EIPA Final Deposit — blocked on paperwork
**Status:** Code-clean and audit-passed. Blocked on Co-Owner/Co-Founder agreement + DAPS authorization letter.
**When ready:** Run `generate-eipa-final-deposit.py` (to be built), burn to CD-R or read-only USB, ship to rep.

### Priority 1: Public Beta prep (target: Jun 1–14 2026)
- **Register onekof.et domain** — Oli action. Required for Tier 2 go-live.
- **Provision EthioTelecom VM** — follow `docs/deployment/tier-2-runbook.md` on Massano/i7/64GB rig.
- **Submit INSA certification** — code is audit-ready. Oli initiates submission.
- **Add NEXT_PUBLIC_SENTRY_DSN to Vercel** — needs DSN from Sentry account (Oli action).
- **Cloudflare Full Strict SSL** — currently Flexible. Blocks government contracts. Needs $10/mo ACM or DNS move to Vercel. Oli action.
- **Upstash Redis** — mandatory for production rate limiting at scale. Oli action (Upstash dashboard).

### Priority 2: Mobile App — App Store + Play Store submission
- ~~Push notifications~~ — DONE 2026-04-19
- ~~i18n 5 languages infrastructure~~ — DONE 2026-04-19
- **Apple Developer membership** ($99/yr) — blocker for iOS App Store
- **Google Play account** ($25) — blocker for Android Play Store
- **EAS Build** — screenshots, metadata, review `app.json`
- **Real drag-and-drop kanban** — react-native-reanimated (~2-3 hr)

### Priority 3: Notifications Phase 2/3/4 (deferred)
Full spec in the Notifications Roadmap section below. Phase 2 (schema migration) is the gate.

### Priority 4: Async tracks
- **EthioTelecom Tier 1 evaluation** — send letter from `docs/business/ethiotelecom-cloud-requirements-letter.md`
- **Ethiopian business entity for Olink Technologies** — required for government procurement

### Priority 4: Mobile App — full production build (IN PROGRESS)
**Quality bar:** Match or exceed Jira Mobile. Not a companion app — a full production client.
**Stack:** Expo SDK 54 + React Native + Expo Router in `apps/mobile/`

**Shipped 2026-04-16 (8 commits):**
- ~~Kanban board~~ — Board tab on project detail, 5 columns, long-press move-to, optimistic updates
- ~~Issue detail with all fields~~ — assignee, status, priority, labels, due date, subtasks, comments, activity, type picker
- ~~Offline mode with sync~~ — NetInfo detection, 4-state banner (offline/queue/syncing/synced), auto-sync on reconnect
- ~~Biometric auth~~ — Face ID/fingerprint lock + escape hatches (sign-out, disable biometric)
- ~~Deep linking~~ — Expo Router auto-wires `onekof://` scheme to all routes
- ~~@mentions in comments~~ — type @, member picker with role badges (Owner/Admin/Member/Contractor/Guest)
- ~~Notifications~~ — Jira-style cards, filter chips, date grouping, drill-down (Phase 1)
- ~~Activity timeline~~ — AI-Powered, filter chips (All/Task/Project/Goal/Comment), paginated 4/page
- ~~Project filter~~ — always-visible chip bar on Issues tab with project color + count badges
- ~~Global FAB~~ — persistent + on all authenticated screens
- ~~Hero video optimization~~ — QHD re-encode, 135MB→21.5MB, poster images

**Shipped 2026-04-17:**
- ~~Nocturne design pass~~ — Teams, Budget, Goals, Documents all redesigned with icon boxes, stat rows, badge pills, avatar stacks, compact filter chips
- ~~Documents "Unknown - Invalid Date" bug~~ — fixed title/date field mapping + relative time
- ~~API auth fix (P0 #3)~~ — 7 endpoints switched from `getServerSession` (web-only) to `resolveAuthUser` (web + mobile Bearer JWT): goals/[id], teams/[id], teams/[id]/members, documents/[id], projects/[id]/members, issues/[id]/subtasks, issues/[id]/watchers
- ~~@mention endpoint~~ — `/api/auth/mobile/members` created with `force-dynamic`

**Shipped 2026-04-17 (late session — 8 commits):**
- ~~P0 #1: Budget summary + transactions~~ — created GET `/api/budgets/summary` and `/api/budgets/transactions` endpoints
- ~~P0 #2: Goals edit modal~~ — bottom sheet with progress presets, status picker, auto-complete
- ~~P1 #1: Team member management~~ — team detail screen, add/remove members, email invite
- ~~P1 #2: Document upload~~ — expo-document-picker, FormData upload, AI processing
- ~~P1 #3: Budget expense creation~~ — create expense modal with description/amount/vendor
- ~~P1 #4: Goals inline progress~~ — covered by P0 #2 edit modal
- ~~P2: Settings screen~~ — language picker (5 langs), biometric toggle, notification prefs
- ~~P2: Members management~~ — org-level member list with roles, invite by email
- ~~P2: Calendar events~~ — create events on selected date via issue creation
- ~~P2: Notifications Phase 2~~ — Notification model, read tracking, mark-as-read on tap, "Read all" button
- ~~P3: Ethiopian calendar~~ — dual Gregorian/Ethiopian display with Ge'ez month names
- ~~Fix: keyboard avoidance~~ — KeyboardAvoidingView on all 5 modal screens
- ~~Fix: text visibility~~ — bumped hint/label text from 30-50% to 85% opacity
- ~~Fix: homepage layout~~ — compact stat row + horizontal quick-action strip
- ~~Auth fixes~~ — 3 more endpoints converted: teams/[id]/members/[userId] DELETE+PATCH, budgets/[id]/expenses GET+POST
- ~~i18n infrastructure~~ — useLanguage hook, LanguageProvider, 5 locale files, AsyncStorage persistence

**Remaining — prioritized task list:**

#### P0/P1/P2 — ALL SHIPPED

#### P3 — Polish (remaining)

- **i18n — wrap screens in t()** — infrastructure done (hooks + 5 locales), need to wrap all user-facing strings in `t()` calls across screens (multi-session)
- **Real drag-and-drop on kanban** — react-native-reanimated (2-3 hr)
- **Push notifications (Phase 4)** — server-side delivery (3-4 hr)
- **App Store + Play Store submission** — EAS Build, screenshots, metadata (2 hr)
  - Blockers: Apple Dev $99/yr, Google Play $25

#### P4 — Infrastructure

- **Cloudflare Full Strict SSL** — $10/mo ACM or DNS move (blocks gov contracts)
- **Tier 2 test server** (Massano rig) — follow runbook, ~1 day
- **EIPA final deposit** — blocked on Co-Owner agreement paperwork
- **Notifications Phase 2 migration** — run `prisma migrate deploy` against Supabase to create `notifications` table

#### 4b. Issues tab Kanban improvements
- Real drag-and-drop between columns (requires `react-native-reanimated` Shared Values + `react-native-gesture-handler` Pan). Current: long-press action sheet (functional but not tactile)
- Swimlane grouping (group by assignee, priority, or epic within board view)

#### 4c. i18n — 5 language support
**Status:** Mobile has ZERO i18n. Web has 3,200+ keys across 5 locales (EN, AM, OM, TI, SO).
- Set up locale JSON files in `apps/mobile/src/locales/` (port from `apps/web/src/locales/`)
- Create `useLanguage()` hook for mobile (or port from web)
- Add language switcher in More tab / Settings
- Wrap all user-facing strings in `t()` calls
- **Multi-session project** — don't mix with design work

#### 4d. Ethiopian calendar native component
- Dual calendar display (Gregorian + Ethiopian) for date pickers
- Ethiopian month names, year offset (7-8 years behind Gregorian)
- Use `@react-native-community/datetimepicker` (already installed) as base + Ethiopian conversion layer

#### 4e. ETB budget views
- Wire Budget screen to real project budget API (`/api/projects/[id]/budget`)
- Show per-project budget allocation, spent, remaining in ETB
- Transaction list with category filters
- Budget charts (donut or bar, matching Dashboard style)

#### 4f. Search improvements
- Global search across issues, projects, members, documents
- Recent searches history
- Search results grouped by type with type icons

#### 4g. App Store + Google Play submission
- EAS Build configuration (`eas.json`)
- App Store screenshots (auto-generate from Expo)
- Privacy policy + Terms links in app settings
- Apple Developer membership ($99/yr) — **blocker for iOS App Store**
- Google Play Developer account ($25 one-time) — **blocker for Play Store**
- Review `app.json` for store metadata, splash screen, adaptive icon
- Pin `@react-native-community/netinfo` to Expo 54 canonical version: `npx expo install @react-native-community/netinfo`

### Priority 5: Product polish
- Bulk operations (bulk status change / delete / label for issues).
- Sentry DSN + error monitoring.
- Archive & grace-period deletion workflow.
- Amharic-native LLM task parsing (needs product scoping).

## Notifications Roadmap — Phase 2, 3, 4 (deferred from 2026-04-16)

**Phase 1 shipped 2026-04-16** (web + mobile parity):
- Mobile `(tabs)/notifications.tsx` rewritten with Jira-style cards (avatar + action-badge overlay, project color tag, drill-down to issue)
- Filter chips (All / Assigned / Comments / Watching) with count badges — mobile + web
- Date grouping (Today / Yesterday / This week / Older) — mobile + web
- API `/api/notifications` scope broadened: now includes tasks where user is assignee OR reporter (not just watcher)
- Duplicate standalone mobile screen `app/notifications/index.tsx` deleted
- Non-functional mark-as-read UI removed from mobile (endpoints didn't exist)
- Web `dashboard/notifications/page.tsx` gained filter chips + date grouping to match mobile

**Architecture gap:** The `/api/notifications` endpoint still returns `unreadCount: notifications.length` (everything treated as unread) because there is no persistent read-state in the database. All three remaining phases build on closing this gap.

### Phase 2 — Real read tracking (schema change)

**Effort estimate:** ~1.5 hr across migration + endpoints + web + mobile wiring.

**Schema migration:** Add new `Notification` Prisma model (separate from `UserActivity`):
```prisma
model Notification {
  id             String        @id @default(cuid())
  userId         String        @map("user_id")
  organizationId String        @map("organization_id")
  activityId     String        @map("activity_id") // FK to UserActivity.id
  readAt         DateTime?     @map("read_at")
  archivedAt     DateTime?     @map("archived_at")
  createdAt      DateTime      @default(now()) @map("created_at")

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  activity     UserActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@unique([userId, activityId])
  @@index([userId, readAt, createdAt])
  @@index([organizationId])
  @@map("notifications")
}
```

**Backfill strategy:** When the migration runs, seed `Notification` rows for each user × their watched/assigned/reported task activities from the last 30 days, with `readAt = NULL`. After backfill, wire `logActivity` (in `lib/activity-logger.ts`) to also create `Notification` rows for each relevant recipient (watcher/assignee/reporter, excluding self).

**New endpoints:**
- `PATCH /api/notifications/[id]/read` — set `readAt = now()` for the current user's notification row
- `POST /api/notifications/read-all` — bulk set `readAt = now()` where `userId = currentUser AND readAt IS NULL`
- Update `GET /api/notifications` to JOIN against `Notification` and return `readAt`, compute real `unreadCount`

**Mobile + web wiring:** Restore the mark-as-read mutations (currently removed from mobile, never existed on web). Badge on More tab should light up only when `unreadCount > 0`. Dashboard header bell should show unread badge when > 0.

**Testing:** Run migration on Supabase, verify backfill of existing orgs (Ministry, Olink Technologies, etc.), confirm mark-as-read persists across sessions.

### Phase 3 — Jira-level UX enhancements

**Effort estimate:** ~2-3 hr, split across mobile + web.

**New features (require Phase 2 data model):**

1. **Three semantic tabs** (replace the current four filter chips):
   - **Direct** = actions where user is mentioned OR assigned
   - **Watching** = activities on tasks user explicitly watches (via `TaskWatcher`)
   - **Updates** = activities in user's projects (broader catch-all)

2. **Thread collapsing:** when the same user performs multiple actions of the same type on the same entity within 10 minutes, collapse into one card with "+N more" chip. E.g., "Ministry commented on WEBDEV-4 (+3 more)". Requires a client-side reducer step after fetching.

3. **Swipe actions on mobile:** swipe left → Archive, swipe right → Mark as read. Use `react-native-gesture-handler` + `Swipeable`. Already a dep in `apps/mobile/package.json`.

4. **Snooze menu** (long-press on card): Snooze 1hr / 4hr / tomorrow / next week. Requires a new `snoozedUntil` column on `Notification`.

5. **@mention parsing:** when a user writes `@someone` in a comment, create a `Notification` for the mentioned user with `activityType = 'MENTIONED'`. Needs a regex-based mention parser on the comment-creation API.

6. **Badge count on bottom nav tab icon** (mobile) and on header bell (web). Expo Router's `Tabs.Screen` supports `tabBarBadge`. Wire it to the `unreadCount` from `/api/notifications`.

### Phase 4 — Delivery infrastructure (push + email + preferences)

**Effort estimate:** ~3-4 hr, touches multiple systems.

1. **Push notifications via Expo Notifications:**
   - New Prisma model `PushNotificationToken { id, userId, token, platform (ios|android), deviceName, lastUsedAt, revokedAt }`
   - On mobile app boot, register for push via `expo-notifications`, POST token to `/api/push/register`
   - Server-side push: when creating a `Notification` row, also fetch the user's active tokens and enqueue an Expo push via `expo-server-sdk`
   - Handle badge count, deep linking (tapping a push opens the issue slideout), and token revocation on sign-out
   - Package `expo-server-sdk` is NOT yet installed — `pnpm add -w expo-server-sdk` at implementation time

2. **Email digest:**
   - Daily or weekly digest of unread notifications
   - Cron endpoint `/api/cron/notification-digest` (scheduled via Vercel Cron)
   - Uses existing email provider from password-reset flow
   - Template: "You have N unread notifications since [last digest]. Top 5: [...]". Link to `onekof.com/dashboard/notifications`
   - Skip sending if `unreadCount === 0` or user has `digestEnabled = false`

3. **Notification preferences** (Prisma model):
   ```prisma
   model NotificationPreference {
     id             String  @id @default(cuid())
     userId         String  @unique
     organizationId String

     // Channels
     inAppEnabled   Boolean @default(true)
     pushEnabled    Boolean @default(true)
     emailEnabled   Boolean @default(true)
     digestFrequency String @default("DAILY")  // NONE | DAILY | WEEKLY

     // Per-type toggles
     mentions       Boolean @default(true)
     assignments    Boolean @default(true)
     comments       Boolean @default(true)
     statusChanges  Boolean @default(true)
     dueDate        Boolean @default(true)

     // Per-project mutes (JSON array of project IDs)
     mutedProjects  Json    @default("[]")
   }
   ```
   - Settings page: `/dashboard/settings/notifications` (web), `/settings/notifications` (mobile)
   - Respect preferences in the `logActivity` → `Notification` creation path (skip if muted)

**Order of operations when resuming:**
1. Run Phase 2 in its own PR (schema migration is the risky part — needs clean rollback plan if it fails against Supabase)
2. Run Phase 3 after Phase 2 is stable in production (the UX upgrades depend on read state existing)
3. Run Phase 4 last — push infrastructure is a separate concern with its own failure modes (device token expiry, Apple/Google API limits, quiet hours)

**Mobile app blocker for Phase 4:** Need an Apple Developer membership ($99/yr) for real iOS push. Android push via FCM is free. See `apps/mobile/app.json` for EAS project config and update `expo.notification` section when Phase 4 starts.

## EIPA Final Deposit — PAUSED pending Co-Owner agreement (2026-04-16)

**Status:** The 2026-04-11 `DEPOSIT/` and `DEPOSIT_SECURED/` folders are NOT the final filing version. Ethiopian representative confirmed EIPA's exact requirements on 2026-04-16. A new `DEPOSIT_FINAL_EIPA/` must be generated — but BLOCKED until Oli obtains the original Co-Owner/Co-Founder agreement between Oli and DAPS Analytics.

### Why the pause
Oli is **NOT an employee** of DAPS Analytics — he is a **Co-Owner / Co-Founder**. The EIPA rep's guidance assumed employment ("only ID and proof of employment with DAPS are required"), which does not apply. The correct documentation for Oli is:
1. Government ID (Ethiopian / US — TBD which EIPA accepts)
2. **Co-Owner / Co-Founder Agreement** between Oli Tamrat Oli and DAPS Analytics (original paperwork — not yet drafted/signed)
3. Official letter from DAPS Analytics authorizing the filing AND acknowledging Oli's co-founder status

Do not proceed with deposit regeneration until Oli confirms all three documents are in hand.

### EIPA Representative's confirmed requirements (2026-04-16)

**Section A — Deposit format:**
- Source code may be submitted with **PII, API keys, and trade-secret algorithms removed** prior to registration
- Format: `.docx` text format
- Media: **CD or USB flash drive**
- **One single file** (not multiple volumes)
- Encryption / password protection: not specifically required by EIPA, but permitted

**Section B — Authorship:**
- **DAPS Analytics** = rights holder (commercial rights)
- **Oli Tamrat Oli** = author (moral rights, non-transferable per Proclamation 410/2004)
- DAPS agrees in the IP Assignment Agreement not to transfer the IP to any third party — protects Oli as author
- The Copyright Assignment Agreement (Oli ↔ DAPS) is a private contract — **not filed with EIPA**
- Moral rights (attribution + integrity) are non-transferable and cannot be waived

**Section C — Registration scope:**
- **One registration covers source code + UI designs + database schema** — no separate filings needed
- New registration required for significant updates (e.g., v2.0) — treated as derivative works
- Berne Convention signatory — Ethiopian registration provides a basis for asserting copyright in other member countries

**Section D — Practical:**
- DAPS authorization + DAPS-appointed representative are sufficient for filing
- For Oli specifically: **ID + proof of relationship to DAPS** (employment OR co-founder agreement)
- Foreign-notarized power of attorney acceptable if POA is required

### Three decisions still pending Oli's confirmation (once paperwork is ready)

**1. Trade-secret exclusion scope:**
- **A. Conservative (recommended default):** Strip only actual secrets — API keys, env values, bcrypt hashes, test-user PII. Keep all source logic → maximum copyright coverage.
- **B. Dual-protection:** Also exclude the 4 innovations in `ONEKOF_IP_CLAIMS_ASSESSMENT.md` (multi-tenant subdomain routing, Ethiopian calendar, three-tier federation dispatch, Amharic LLM task parsing) to preserve trade-secret / patent options.
- **C. Aggressive:** B + AI prompts + automation rules engine + RBAC filter logic.

**2. Handle the 2026-04-11 deposit folders:**
- Rename `DEPOSIT/` → `DEPOSIT_ARCHIVE_20260411/`
- Rename `DEPOSIT_SECURED/` → `DEPOSIT_SECURED_ARCHIVE_20260411/`
- Generate new `DEPOSIT_FINAL_EIPA/` containing: single consolidated `.docx`, README, SHA-256 manifest, DAPS authorization letter, Co-Founder agreement, Oli ID cover sheet

**3. Word document protection method:**
- Recommended: **Restrict Editing** with password + file `attrib +R` + SHA-256 manifest + burn to CD-R (physically write-once)

### Planned generator (not yet built)

`generate-eipa-final-deposit.py` — consolidates everything into ONE `.docx`:
- Sanitizes PII, API keys, `.env*` contents, bcrypt hashes, OAuth secrets, test-user emails
- Optional exclusion of trade-secret files per chosen scope
- Applies Word "Restrict Editing" password protection
- Generates SHA-256 manifest of the final file
- Outputs `DEPOSIT_FINAL_EIPA/` with: single `.docx`, `SHA256_MANIFEST.txt`, `README.txt`, DAPS authorization letter placeholder, Co-Founder agreement slot, ID cover sheet

### Resume checklist (when paperwork arrives)

1. Oli confirms Co-Owner/Co-Founder agreement + DAPS authorization letter in hand
2. Oli picks trade-secret scope (A/B/C) from decision 1 above
3. Archive the 2026-04-11 deposit folders (decision 2)
4. Build `generate-eipa-final-deposit.py` and run it
5. Sanity-check single `.docx` opens, restrict-editing holds, SHA-256 matches
6. Burn CD-R or load read-only USB, attach to filing package
7. Ship to Ethiopia representative
