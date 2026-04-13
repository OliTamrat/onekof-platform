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

## Project / Platform Context

- **Platform**: Onekof — multi-tenant PM platform for Ethiopian and East African teams
- **Deployment**: Vercel (serverless, fra1 region)
- **Database**: Supabase Postgres 15
- **Subdomain routing**: `{orgslug}.onekof.com` → middleware sets `x-organization-slug` header
- **Commit attribution**: every commit is `Oli Tamrat Oli <oli.oli@udc.edu>` (for IP registration)

## Current Status (as of 2026-04-13)

**Launch stage:** Pre-launch. No paying customers. EIPA copyright deposit prepared 2026-04-11, submission pending representative's return with questionnaire answers.

**Production deployment (Tier 3):** Live at `onekof.com` on Vercel serverless (fra1) + Supabase PostgreSQL 15 (aws-1-eu-central-1). 25 test/demo organizations, no real customer data.

**Architecture target:** Three-tier federated hosting (see `docs/architecture/three-tier-federation.md`):
- **Tier 1 — Government:** EthioTelecom Cloud (or Raxio fallback), `*.gov.onekof.et`. **Not yet built.** Requires signed government LOI before coding begins.
- **Tier 2 — Private:** On-premise Ethiopian server, `*.onekof.et`. **Code-ready** (Wave 1 + Wave 2 shipped). Docker image validated at 408 MB. Windows + Ubuntu deployment guides written. Test server build in progress on Massano/i7/64GB rig.
- **Tier 3 — Global:** Vercel + Supabase, `*.onekof.com`. **Current production.** Unchanged by Wave 1/2.
- **DR:** Encrypted backups from Tiers 1/2 pushed to Vercel Blob / Supabase Storage as cold recovery. **Deferred to Wave 3.**

## Recently Shipped

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

### Priority 4: Product polish (deferred — no customer pressure yet)
- Mobile UX refinement (Priority 1 from pre-Wave-1 list — still valid but no longer blocking).
- Bulk operations (bulk status change / delete / label for issues).
- Sentry DSN + error monitoring.
- Archive & grace-period deletion workflow.
- Amharic-native LLM task parsing (needs product scoping).
