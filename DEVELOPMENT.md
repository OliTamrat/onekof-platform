# DEVELOPMENT.md — Onekof Platform Development Rules

## Architecture Overview

### Stack
- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS + Radix UI primitives
- **Database**: PostgreSQL with Prisma ORM (schema at `packages/database/prisma/schema.prisma`)
- **Auth**: NextAuth.js v4 with JWT strategy, cookie domain `.onekof.com`
- **State**: TanStack React Query for server data, `workspace-context.tsx` for org context
- **Monorepo**: Turborepo with `apps/web` and `packages/database`
- **Fonts**: System fonts only (SF Pro Text → system-ui). No Google Fonts. No external font dependencies.

### Multi-Tenant Routing
- **Subdomains**: `{org-slug}.onekof.com` → middleware extracts slug → sets `x-organization-slug` header
- **API route org resolution**: All API routes use `resolveUserOrganization()` from `@/lib/api-organization` — reads `x-organization-slug` header (set by middleware from subdomain), falls back to `defaultOrganizationId`, then first org. This ensures correct multi-tenant isolation for users with multiple orgs.
- **Workspace context** (`src/contexts/workspace-context.tsx`): Client-side org detection by matching `window.location.hostname` subdomain against the user's org slugs
- **Sidebar data** comes from workspace context (client-side), **dashboard data** comes from API routes (server-side)

### Auth Flow
- **Config**: `src/lib/auth.ts` — `trustHost: true` is REQUIRED for subdomain auth
- **Cookie domain**: `.onekof.com` in production for cross-subdomain sessions
- **Session strategy**: JWT (not database sessions)
- **Login flow**: `/auth/signin` → NextAuth credentials/Google → `/select-organization` → `{slug}.onekof.com/dashboard`

### Active Layout
- `src/components/layouts/app-layout.tsx` switches layout based on `LAYOUT_CONFIG`
- **Workspace layout** is the primary layout (`jira-style-layout.tsx`)
- Uses `collapsible-sidebar.tsx` for section navigation
- `three-tier-layout.tsx` exists as an alternative but is not the default

## Database & Schema Rules

- **NEVER add Prisma schema columns without running the migration on production**
- If a migration cannot be run immediately, do NOT regenerate the Prisma client with the new columns. The generated client includes ALL model fields in SELECT queries — missing columns cause 500 errors on every query.
- Schema change workflow: `schema edit` → `prisma migrate` on production → `prisma generate` → commit
- Test schema changes locally with `prisma db push` before deploying
- The lockout fields (`failedLoginAttempts`, `lastFailedLoginAt`, `lockedUntil`, `passwordChangedAt`) exist in production and work correctly

## Design System

### Color Tokens (Tailwind)
All UI must use these semantic tokens defined in `tailwind.config.ts`:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `primary-*` | Teal scale | Teal scale | Buttons, links, active states, focus rings |
| `surface-*` | White/slate-50 | `#1B1F23` | Page backgrounds |
| `card-*` | White | `#22272B` | Card/panel backgrounds |
| `elevated-*` | White | `#282E33` | Dropdowns, modals, popovers |
| `border-*` | `slate-200` | `slate-700` | All borders |
| `muted-*` | `slate-100` | `slate-800` | Secondary backgrounds |

**Primary accent**: `#1C8C7D` (teal) — ALL primary buttons, active states, focus rings, links
**Do NOT use**: `slate-900` for primary buttons, legacy blue for active states, `brand-*` (indigo) for actions

### Border Radius
- `rounded-md` (6px): Buttons, inputs, badges, dropdown items
- `rounded-lg` (8px): Cards, dialogs, panels, tabs
- `rounded-xl` (12px): Modals, slideouts, marketing sections
- `rounded-full`: Avatars, status indicators only

### Dark Mode Backgrounds (ONE system, not four)
- Page background: `bg-white dark:bg-[#1B1F23]`
- Card/surface: `bg-white dark:bg-[#22272B]`
- Elevated (dropdown/modal): `bg-white dark:bg-[#282E33]`
- Sidebar: `bg-slate-50 dark:bg-[#1B1F23]`
- Navbar: `bg-white dark:bg-[#1B1F23]`
- Borders: `border-slate-200 dark:border-slate-700`

### Typography
- Font stack: SF Pro Text → system-ui (no external fonts)
- Page titles: `text-xl font-semibold`
- Section titles: `text-lg font-semibold`
- Body: `text-sm` (14px)
- Muted text: `text-slate-600 dark:text-slate-400`

### Component Rules
- ALL buttons must use `<Button>` from `@/components/ui/button`
- ALL cards must use `<Card>` from `@/components/ui/card`
- ALL inputs must use `<Input>` from `@/components/ui/input`
- NEVER create new button/card/input patterns inline — add variants to the base components instead
- NEVER hardcode colors — use Tailwind tokens

## Stability Rules — Do NOT Modify Without Testing

These patterns are critical to production stability:

- **API route org resolution** (`resolveUserOrganization()`) — uses subdomain header for multi-tenant isolation. Do NOT revert to `organizations[0]` as it breaks multi-org users.
- **`trustHost: true`** in auth config — removing this breaks subdomain auth
- **Cookie domain** (`.onekof.com`) — changing this breaks cross-subdomain sessions
- **Middleware header injection** (`x-organization-slug`) — do not modify without subdomain testing
- **NextAuth session strategy** (`jwt`) — changing to `database` requires migration

## Before Any Audit or Refactor

1. Read this entire document first
2. Do NOT modify API routes, middleware, or auth without testing the full login → org select → dashboard flow
3. Do NOT add Prisma schema columns without confirming the migration can run on production
4. Do NOT remove `trustHost`, cookie domain config, or session strategy
5. Test on subdomain (`{org}.onekof.com`) not just localhost
6. Any infrastructure change must be tested against the existing data flow before pushing

## Git Commit Rules

- **NO attribution links** in commit messages. Never append AI tool URLs.
- **NO author identification** in commits, code comments, or deployment metadata.
- **Git author MUST be**: `OliTamrat <oli.oli@udc.edu>` — always set `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME`, and `GIT_COMMITTER_EMAIL` before committing.
- **Commit messages** follow conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `perf:`, `test:`
- Keep commit messages concise (under 72 chars for the subject line).

## Security — No Credentials in Code

- **NEVER commit secrets, API keys, tokens, passwords, or credentials** to the repository.
- Files that must never be committed: `.env`, `.env.local`, `.env.production`, `credentials.json`, `serviceAccountKey.json`
- Reference secrets via `process.env.VARIABLE_NAME` — never hardcode values.
- All sensitive config belongs in Vercel environment variables or a secrets manager.

## Code Rules

- No AI attribution comments or metadata anywhere.
- Write code as a senior developer would — no unnecessary comments.
- Prefer editing existing files over creating new ones.
- Follow existing code patterns and conventions.
- Use TypeScript strict patterns — avoid `any` types.
- Support dark mode in all UI components.

## Deployment

- No AI attribution in deployment metadata.
- **Minimize deployments**: Batch changes into a single commit and push ONCE. Vercel triggers a preview build on every push.
- Only push when a complete, tested batch of work is ready.

## Custom Agents

Specialized agents live in `.agents/` for targeted code reviews and audits:

| Agent | File | Purpose |
|-------|------|---------|
| Senior Security | `senior-security.md` | Security audits, OWASP checks, auth flow review, multi-tenant isolation, rate limiting |
| UI/UX Designer | `ui-ux-designer.md` | Design system compliance, dark mode, accessibility, visual consistency |
| Senior Software Engineer | `senior-software-engineer.md` | Architecture review, code quality, performance, technical debt, codebase health |
| Senior Database Developer | `senior-database-developer.md` | Schema review, query optimization, migration planning, indexing, data integrity |

All agents are pre-loaded with platform context, stability rules, and the design system tokens. They produce structured reports with severity-ranked findings.

## Development Workflow

- Always work on the designated feature branch.
- Read files before modifying them.
- Run existing tests after making changes when possible.
- Follow the design system tokens defined above — not ad-hoc color values.

## Project Context

- **Design**: Ethiopian-first project management with customizations (ETB currency, Ethiopian calendar)
- **Pages**: ~164 pages across dashboard, projects, auth, settings, marketing
- **Language**: 5-language support (EN, AM, OM, TI, SO) via custom i18n in `src/locales/`. Uses `LanguageProvider` context + `useLanguage()` hook with `t('key')` dot-notation. English fallback automatic. 362 keys per locale across 21 sections.
- **No external fonts**: All fonts are system fonts or local @font-face declarations. Do NOT add Google Fonts or other CDN font dependencies — they cause CSP issues and add latency.

---

## Platform Audit Findings (March 21, 2026)

Full audit covering Security, UI/UX Design System, Code Quality, and Database Schema.

### Summary

| Area | Critical | High | Medium | Low |
|------|----------|------|--------|-----|
| Security | 2 | 3 | 2 | 3 |
| UI/UX Design System | 1 | 3 | 1 | 1 |
| Code Quality | 0 | 1 | 8 | 5 |
| Database & Schema | 3 | 3 | 4 | 3 |
| **TOTAL** | **6** | **10** | **15** | **12** |

### Critical Findings

1. **Hardcoded default `ADMIN_SECRET` fallback** — `src/app/api/admin/login/route.ts`, `src/lib/security/superadmin.ts`. If env var is not set, anyone can forge admin tokens using the default secret.
2. **No rate limiting on `/api/admin/login`** — highest-privilege endpoint has zero brute-force protection.
3. **Primary color mismatch** — `tailwind.config.ts` uses blue `#2563EB`, DEVELOPMENT.md specifies teal `#1C8C7D`. All `primary-*` tokens resolve to wrong color.
4. **Missing `@relation` on Document model** — `projectId` and `budgetId` are plain strings with no Prisma relation. Orphaned documents on parent deletion.
5. **Missing `@relation` on user audit fields** — 8+ models (`createdBy`, `approvedBy`, `uploadedBy`, `changedBy`, `userId`) have no relation to User model. N+1 queries and orphaned records.
6. **Missing `@relation` on `BudgetCategory.parentId`** — nested category hierarchy has no self-referential relation.

### High Findings

7. **Account lockout duration bug** — `Math.min(0, ...)` always returns 0, progressive lockout never escalates.
8. **Unauthenticated invitation endpoint** — `GET /api/invitations/accept` leaks org names and inviter details without session.
9. **CRON endpoint open if `CRON_SECRET` not set** — accepts any request, triggers expensive aggregation.
10. **2,876 lines of backup files** — 4 dead `*-backup.tsx` files bloating the codebase.
11. **Hardcoded teal colors** — 7+ components use `teal-500/600/700` instead of `primary-*` tokens.
12. **Non-standard dark mode backgrounds** — 18+ components use `#0A0A0A`, `#111111`, `black` instead of the three-tier system (`#1B1F23`, `#22272B`, `#282E33`).
13. **Missing `Task.parentId` self-relation** — subtask hierarchy broken.
14. **195 raw `<button>` elements** — should use `<Button>` component.

### Medium Findings

15. Debug endpoints exposed without auth (`/api/debug/*`, `/api/env-check`, `/api/test-db`)
16. Account lockout fails open on error (returns `{ locked: false }`)
17. TypeScript strict mode disabled; `ignoreBuildErrors: true`
18. Unused dependencies (`next-intl`, `@trpc/*`)
19. No pagination on list endpoints (unbounded arrays)
20. Low test coverage (~3%, no API route tests)
21. Inconsistent soft delete (core models yes, membership/watcher models no)
22. Missing NOT NULL on audit fields (`BudgetAuditLog.userId`, `BudgetAuditLog.action`)
23. `Task.assigneeId` missing `onDelete: SetNull`

### Low Findings

24. Error details leaked to client in organizations API
25. Inconsistent password validation (8 chars reset vs 12 signup)
26. API key accepted in query params (logged in server/proxy logs)
27. Console.log in 20+ production API routes
28. Image domains config only allows localhost
29. Inconsistent API error response shapes
30. Decimal fields return Prisma objects instead of numbers

### Recommended Order of Work

**Week 1 — Security Critical (4-5 hours):**
- [ ] Remove hardcoded `ADMIN_SECRET` fallback — require env var
- [ ] Add rate limiting to `/api/admin/login`
- [ ] Fix account lockout `Math.min(0, ...)` bug
- [ ] Secure CRON endpoint (fail if `CRON_SECRET` not set)
- [ ] Add auth check to `GET /api/invitations/accept`
- [ ] Protect or remove `/api/debug/*` endpoints

**Week 2 — Schema & Design (6-8 hours):**
- [ ] Add missing `@relation` on Document, BudgetCategory, Task, AIUsage, audit fields
- [ ] Delete 4 backup files (2,876 lines)
- [ ] Remove unused dependencies (next-intl, @trpc)
- [ ] Fix dark mode backgrounds to three-tier system
- [ ] Replace hardcoded teal with `primary-*` tokens
- [ ] Resolve primary color palette (teal vs blue)

**Week 3 — Quality (8-10 hours):**
- [x] Add pagination to list endpoints (activities, documents, org-members, organizations, admin/organizations, admin/users)
- [x] Standardize API error responses (`{ error: string }` with correct HTTP status codes)
- [ ] Add soft delete to remaining models — **BLOCKED: requires production schema migration for 24 models**
- [x] Replace console.log with structured logger (`@/lib/logger`) in all API routes
- [x] Enable TypeScript strictNullChecks (23 remaining errors all blocked by schema migrations or third-party types; `ignoreBuildErrors: true` covers them)
- [x] Convert raw `<button>` to `<Button>` components across auth, admin, marketing, settings, dashboard, layout pages

**Week 4+ — Hardening (ongoing):**
- [ ] Run production migration to add `deletedAt DateTime?` to 24 models missing soft delete
- [ ] Increase test coverage to 50%+ (focus API routes)
- [ ] Enable full TypeScript strict mode (Phase 3 — after two-factor schema columns are migrated)
- [ ] Split large files (budget page, email.ts)
- [ ] Connection pooling (Prisma Accelerate)
- [ ] Redis caching for read-heavy endpoints

---

## Strategic Roadmap — Next To Do

### Phase 1: Admin Dashboard (Current Priority)
Build a superadmin dashboard at `/admin` for managing the entire platform:
- **Organizations management**: list, create, edit, suspend orgs; view usage stats per org
- **User management**: list all users across orgs, reset passwords, disable accounts, view activity
- **Permissions & roles**: manage system-wide roles (superadmin, org admin, member); assign superadmin access
- **System health**: active users, total orgs, API response times, error rates, storage usage
- **Feature flags**: toggle features per org or globally (useful for enterprise rollouts)
- **Audit log**: track admin actions (who did what, when)
- **Access control**: protected by `role === 'SUPERADMIN'` check — not visible to regular users
- **Implementation**: built as protected routes within the existing Next.js app (`/admin/*`), no separate infrastructure

### Phase 2: White-Label Infrastructure
Enable enterprise customers to have their own branded environments:

**Tier 1 — Cosmetic White-Label:**
- Add branding fields to Organization model: `brandLogo`, `brandFavicon`, `brandPrimaryColor`, `brandAppName`, `customDomain`
- Layout reads branding values and applies via CSS custom properties
- Custom login page branding per org
- Organization-level settings UI for admins to upload logo, pick colors

**Tier 2 — Custom Domain White-Label:**
- Client points DNS (CNAME) to Onekof infrastructure
- Middleware resolves `hostname` → looks up Organization by `customDomain` field
- SSL handled automatically by Vercel
- Flow: `tasks.mowi.gov.et` → middleware → org lookup → same app, branded experience

**Tier 3 — Isolated Enterprise (future, only if needed):**
- Separate database per client (data sovereignty)
- Separate deployment/infrastructure
- Only needed for government contracts requiring data isolation

### Phase 3: Scalability Improvements
Current capacity: ~200-500 concurrent users. Steps to scale:

**3a — Connection Pooling (do before first enterprise client):**
- Add Prisma Accelerate or PgBouncer for database connection pooling
- This is the #1 bottleneck for Next.js + Prisma on serverless

**3b — Caching Layer (500-2,000 users):**
- Add Redis (Upstash) for query caching, rate limiting
- Cache read-heavy endpoints: project lists, team members, org settings
- API response caching headers for static-ish data

**3c — Read Replicas & Compute (2,000-10,000 users):**
- Database read replicas for read-heavy queries
- Move to Vercel Pro/Enterprise for higher serverless concurrency
- Consider dedicated compute for critical API paths

**3d — Sharding & Isolation (10,000+ users):**
- Per-tenant database routing
- CDN for API responses where appropriate
- Horizontal scaling strategy

### Completed Work
- [x] Marketing site redesign (hero, features, pricing, testimonials, footer)
- [x] AI Insights panel with expandable drill-down details per insight
- [x] Board view responsive grid with larger, more readable cards
- [x] Dark mode consistency across all components
- [x] Workspace layout as primary layout
- [x] Multi-tenant subdomain routing
- [x] JWT auth with cross-subdomain cookies
