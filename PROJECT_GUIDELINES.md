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

## Security Rules

- **RBAC enforcement**: `/api/projects` and `/api/issues` apply `buildProjectAccessFilter` based on org role + project visibility
- **Project visibility**: PUBLIC (all org members see it), INTERNAL (project members + org admins), PRIVATE (explicit members only), CONFIDENTIAL (restricted + audit log)
- **Default visibility** for new projects: PUBLIC (set in create-project-modal form state)
- **Session strategy**: JWT, cookies scoped to subdomain
- **Account lockout**: enabled (see `lib/security/account-lockout.ts`)
- **Password requirements**: minimum 8 chars, bcrypt 12 rounds
- **Email verification**: required on signup

## Database / Migration Rules

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

## Current Status (as of 2026-04-15)

**Launch stage:** Pre-launch. No paying customers. EIPA copyright deposit prepared 2026-04-11, submission pending representative's return with questionnaire answers.

**Production deployment (Tier 3):** Live at `onekof.com` on Vercel serverless (fra1) + Supabase PostgreSQL 15 (aws-1-eu-central-1). 25 test/demo organizations, no real customer data.

**Mobile app:** Foundation deployed (Expo/React Native). Auth working against production API. Building toward App Store + Google Play submission.

**Architecture target:** Three-tier federated hosting (see `docs/architecture/three-tier-federation.md`):
- **Tier 1 — Government:** EthioTelecom Cloud (or Raxio fallback), `*.gov.onekof.et`. **Not yet built.** Requires signed government LOI before coding begins.
- **Tier 2 — Private:** On-premise Ethiopian server, `*.onekof.et`. **Code-ready** (Wave 1 + Wave 2 shipped). Docker image validated at 408 MB. Windows + Ubuntu deployment guides written. Test server build in progress on Massano/i7/64GB rig.
- **Tier 3 — Global:** Vercel + Supabase, `*.onekof.com`. **Current production.** Unchanged by Wave 1/2.
- **DR:** Encrypted backups from Tiers 1/2 pushed to Vercel Blob / Supabase Storage as cold recovery. **Deferred to Wave 3.**

## Recently Shipped

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

## Next Work Priorities (after Wave 1)

### Priority 0: Test server weekend — Massano/i7/64GB/1TB rig
**Status:** Code-ready, hardware on hand, runbook written, Docker topology proven on laptop.
**Goal:** Follow `docs/deployment/tier-2-runbook.md` end-to-end on bare Ubuntu 24.04 LTS. Produce a living Tier 2 reference deployment hosting a fake test tenant. Document every deviation from the runbook as a runbook update.
**Effort:** ~1 focused day (down from 3 days of troubleshooting before the Docker simulation proved the stack).
**Blockers:** None — Oli has time.

### Priority 1: Wave 2 — medium-risk hardening
All items are gated to "before first real customer," not urgent pre-launch.
- ~~**B6 — Admin password bcrypt hashing**~~ — DONE 2026-04-12. Uses `bcrypt.compare()` with 12-round hashes.
- **Cloudflare Full Strict SSL** — currently Flexible (HTTP CF↔Vercel). Blocks government contracts. Follow `PRODUCTION_SECURITY_UPGRADE_GUIDE.md`. **Oli action required.**
- ~~**Disable `/api/debug/*` routes in production**~~ — DONE 2026-04-12. Middleware returns 404.
- ~~**Tenant isolation validation in middleware**~~ — DONE 2026-04-12. JWT membership check at edge.
- **Mandatory Upstash Redis for rate limiting in production** — in-memory fallback is broken under serverless multi-instance scaling. **Oli action required (Upstash dashboard).**
- ~~**`output: 'standalone'` in `next.config.mjs`**~~ — DONE 2026-04-12. Docker image 2.6 GB → 408 MB.

### Priority 2: Wave 3 — data retention + DR
- ~~`UserActivity` rolling 90-day retention~~ — DONE 2026-04-12. `/api/admin/cleanup` endpoint with configurable retention, supports Vercel Cron and system cron.
- ~~`RateLimit` table → Redis~~ — DONE 2026-04-12. Removed dead `RateLimit` Prisma model. Rate limiting already uses Upstash Redis via `lib/security/rate-limit.ts`.
- JWT refresh token rotation — **Deferred.** NextAuth JWT strategy with HttpOnly cookies is sufficient for current threat model. Revisit when session duration requirements change.
- ~~Admin audit logging~~ — DONE 2026-04-12. `AdminAuditLog` model + `logAdminAction()` utility. Admin login/logout/cleanup instrumented. Migration created.
- ~~Encrypted backup pipeline~~ — DONE 2026-04-12. `scripts/backup-database.sh` upgraded with GPG encryption, SHA-256 checksums, configurable retention, blob backup, and Shamir 3-of-5 key split documentation.

### Priority 3: Async tracks (don't block on these)
- **EthioTelecom Tier 1 evaluation** — send the letter from `docs/business/ethiotelecom-cloud-requirements-letter.md` once ready, then wait for their technical response. Keeps Tier 1 architecture dependencies unblocked without forcing synchronous work.
- **Claim `onekof.et` domain** — required for Tier 2 production. Claim after EIPA registration completes.
- **Ethiopian business entity formation for Olink Technologies** — required for government procurement, unrelated to the codebase but on the critical path for Tier 1 sales.

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
3. Claude archives the 2026-04-11 deposit folders (decision 2)
4. Claude builds `generate-eipa-final-deposit.py` and runs it
5. Sanity-check single `.docx` opens, restrict-editing holds, SHA-256 matches
6. Burn CD-R or load read-only USB, attach to filing package
7. Ship to Ethiopia representative
