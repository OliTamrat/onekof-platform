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

## Next Work Priorities (post-IP-registration)

### Priority 1: Mobile UX refinement
- Test on real iPhone/Android devices
- Fix any cramped layouts, overflowing text, unreachable buttons

### Priority 2: Bulk operations
- Bulk select + status change / delete / label change for issues
- Already flagged as "nice to have, can ship without" in earlier audit

### Priority 3: Deferred features (need product decisions)
- Error monitoring (Sentry) — needs DSN
- Rate limiting (Upstash Redis) — needs account
- Archive & grace-period deletion — scoped but not started
- Amharic-native LLM task parsing — needs product scoping
