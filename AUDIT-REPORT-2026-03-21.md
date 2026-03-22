# Onekof Platform — Full Audit Report

**Date:** March 21, 2026
**Scope:** Security, UI/UX Design System, Code Quality & Architecture, Database & Schema
**Overall Risk Level:** MEDIUM — solid foundations with critical items requiring fix

---

## Executive Summary

| Area | Rating | Critical | High | Medium | Low |
|------|--------|----------|------|--------|-----|
| Security | 7/10 | 2 | 3 | 2 | 3 |
| UI/UX Design System | 6/10 | 1 | 3 | 1 | 1 |
| Code Quality | 7.5/10 | 0 | 1 | 8 | 5 |
| Database & Schema | 7/10 | 3 | 3 | 4 | 3 |
| **TOTAL** | | **6** | **10** | **15** | **12** |

The platform has strong architectural security (multi-tenant isolation, JWT auth, rate limiting, password hashing, comprehensive security headers) and well-organized code. The main risks are: **default admin secrets**, **missing Prisma relations on 10+ models**, **dark mode color inconsistencies**, and **backup files adding dead code**.

---

## Priority Action Items (Top 10)

| # | Severity | Area | Finding | Effort |
|---|----------|------|---------|--------|
| 1 | CRITICAL | Security | Hardcoded default `ADMIN_SECRET` fallback — remove default, require env var | 15 min |
| 2 | CRITICAL | Security | No rate limiting on `/api/admin/login` — add `checkRateLimit(req, 'login')` | 15 min |
| 3 | CRITICAL | Database | Missing `@relation` on Document model (projectId, budgetId) | 30 min |
| 4 | CRITICAL | Database | Missing `@relation` on user audit fields (createdBy, approvedBy) across 8+ models | 2 hrs |
| 5 | CRITICAL | Database | Missing `@relation` on BudgetCategory.parentId (nested categories broken) | 20 min |
| 6 | HIGH | Security | Account lockout bug — `Math.min(0, ...)` always returns 0, no duration escalation | 10 min |
| 7 | HIGH | Security | `/api/invitations/accept` GET endpoint has no auth check | 15 min |
| 8 | HIGH | Security | CRON endpoint `/api/analytics/aggregate` open if `CRON_SECRET` not set | 15 min |
| 9 | HIGH | Code Quality | 2,876 lines of backup files need deletion | 10 min |
| 10 | CRITICAL | UI/UX | Primary color mismatch — tailwind.config uses `#2563EB` (blue), DEVELOPMENT.md specifies `#1C8C7D` (teal) | 30 min |

---

# 1. Security Audit

## Critical Findings

### 1.1 Hardcoded Default Admin Secret
**Severity:** CRITICAL
**Files:** `src/app/api/admin/login/route.ts:13`, `src/lib/security/superadmin.ts:13`

```typescript
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'onekof-admin-default-secret-change-me';
```

If `ADMIN_SECRET` env var is not set, the hardcoded default is used. An attacker knowing this default can forge admin tokens, gaining full access to the admin dashboard, all organizations, and all users.

**Fix:** Remove fallback entirely — fail if env var is missing:
```typescript
const ADMIN_SECRET = process.env.ADMIN_SECRET;
if (!ADMIN_SECRET) throw new Error('ADMIN_SECRET environment variable is required');
```

### 1.2 Missing Rate Limiting on Admin Login
**Severity:** CRITICAL
**File:** `src/app/api/admin/login/route.ts`

Admin login has NO rate limiting. User login has 3 attempts/15 min, signup has 3/60 min, password reset has 3/60 min — but the highest-privilege login endpoint is unprotected.

**Fix:** Add `checkRateLimit(request, 'login')` at the top of the POST handler.

## High Findings

### 1.3 Account Lockout Duration Bug
**Severity:** HIGH
**File:** `src/lib/security/account-lockout.ts:52`

```typescript
const durationIndex = Math.min(0, LOCKOUT_CONFIG.lockoutDurations.length - 1);
```

`Math.min(0, ...)` always returns 0. The progressive lockout (15→30→60→240→1440 min) never escalates.

**Fix:** `Math.min(failureCount - 1, LOCKOUT_CONFIG.lockoutDurations.length - 1)` with `Math.max(0, ...)`.

### 1.4 Unauthenticated Invitation Endpoint
**Severity:** HIGH
**File:** `src/app/api/invitations/accept/route.ts:147`

GET endpoint validates invitation tokens without requiring authentication. Leaks org names, inviter details, and roles.

**Fix:** Add `getServerSession(authOptions)` check before processing.

### 1.5 CRON Endpoint Conditional Auth
**Severity:** HIGH
**File:** `src/app/api/analytics/aggregate/route.ts:17-28`

If `CRON_SECRET` is not set, the endpoint accepts ANY request (the `if` check passes because `cronSecret` is falsy). This triggers expensive database aggregation.

**Fix:** Return 503 if `CRON_SECRET` is not configured; remove query parameter fallback for API key.

## Medium Findings

### 1.6 Debug Endpoints Exposed
**Severity:** MEDIUM
**Files:** `/api/debug/check-db`, `/api/debug/check-session`, `/api/debug/users`, `/api/env-check`, `/api/test-db`

Debug endpoints expose database configuration, environment status, and user information without authentication.

**Fix:** Add `requireSuperAdmin()` check or remove from production.

### 1.7 Account Lockout Fails Open
**Severity:** MEDIUM
**File:** `src/lib/security/account-lockout.ts:114-117`

If `recordFailedLogin` throws, it returns `{ locked: false }` — silently allowing login.

**Fix:** Fail secure — throw error or deny login on lockout check failure.

## Low Findings

- **Error details leaked** in `organizations/route.ts:183` — `details: error?.message` exposed to client
- **Inconsistent password validation** — reset accepts 8 chars, signup requires 12
- **API key in query params** — `analytics/aggregate` accepts `apiKey` query param (logged in server/proxy logs)

## Passed Security Checks

- NextAuth JWT with `trustHost: true`, secure `httpOnly` cookies, `sameSite: 'lax'`
- Cross-subdomain sessions via `.onekof.com` cookie domain
- bcryptjs with 12 salt rounds
- Comprehensive CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Rate limiting on signup, password reset, email verification, general API
- Prisma parameterized queries (no SQL injection)
- Zod validation schemas on inputs
- Verification tokens hashed before storage
- No hardcoded secrets in committed code (except default admin secret fallback)

---

# 2. UI/UX Design System Audit

## Critical Finding

### 2.1 Primary Color Mismatch
**Severity:** CRITICAL
**File:** `tailwind.config.ts:33-45`, `src/app/layout.tsx:87`, `src/components/layouts/jira-style-layout.tsx:135,295`

DEVELOPMENT.md specifies primary accent as **teal `#1C8C7D`**, but the codebase uses **electric blue `#2563EB`** throughout — in Tailwind config, HTML meta theme-color, logo gradients.

**Fix:** Update `tailwind.config.ts` primary palette to teal `#1C8C7D` and update all references.

## High Findings

### 2.2 Hardcoded Teal Colors Instead of Tokens
**Severity:** HIGH
**Files:** textarea.tsx, data-table.tsx, empty-state.tsx, stats-card.tsx, create-issue-modal.tsx, workflow-designer.tsx, dashboard-layout.tsx

7+ components hardcode `teal-500`, `teal-600`, `teal-700` instead of using `primary-*` tokens. This makes brand color changes impossible without a codebase-wide search-and-replace.

**Fix:** Replace all `teal-*` references with `primary-*` tokens.

### 2.3 Non-Standard Dark Mode Backgrounds
**Severity:** HIGH
**Files:** 18+ components

| Current | Expected (DEVELOPMENT.md) | Where |
|---------|----------------------|-------|
| `dark:bg-black` | `dark:bg-[#1B1F23]` | layout.tsx, jira-style-layout.tsx |
| `dark:bg-[#0A0A0A]` | `dark:bg-[#22272B]` | card.tsx, input.tsx, button.tsx, dialog.tsx, dropdown-menu.tsx, select.tsx, skeleton.tsx, slideout-panel.tsx, tabs.tsx |
| `dark:bg-[#111111]` | `dark:bg-[#282E33]` | dialog.tsx, dropdown-menu.tsx, tabs.tsx |
| `dark:bg-[#2D3748]` | Non-standard | textarea.tsx, data-table.tsx |

**Fix:** Systematically replace dark mode backgrounds to match the three-tier system in DEVELOPMENT.md.

### 2.4 Raw `<button>` Elements
**Severity:** HIGH
**Files:** jira-style-layout.tsx:175, collapsible-sidebar.tsx:70, workflow-designer.tsx:267, dashboard-layout.tsx:57, and others

195 raw `<button>`/`<input>` elements found. DEVELOPMENT.md requires ALL buttons use `<Button>` component.

**Fix:** Replace raw elements with UI components where applicable.

## Passed Design System Checks

- Typography: correct font sizes, weights, and muted text colors
- Border radius: consistent 6px/8px/12px/full usage
- Responsive design: comprehensive mobile-first breakpoints
- Font stack: system fonts only, no Google Fonts or CDN dependencies
- `<Card>` and `<Input>` components properly used in most places
- Focus rings properly implemented with tokens

---

# 3. Code Quality & Architecture Audit

## High Finding

### 3.1 Backup/Dead Code Files (2,876 lines)
**Severity:** HIGH
**Files:**
- `src/app/dashboard/issues/budget/page-full-backup.tsx` (1255 lines)
- `src/app/dashboard/issues/summary/page-backup.tsx` (945 lines)
- `src/app/projects/[id]/budget/page-old-backup.tsx` (361 lines)
- `src/app/dashboard/issues/documents/page-full-backup.tsx` (315 lines)

**Fix:** Delete all backup files — they're in git history.

## Medium Findings

### 3.2 TypeScript Strict Mode Disabled
`tsconfig.json:17` has `"strict": false` with phased approach. Phase 2 (strictNullChecks) and Phase 3 are commented out. `next.config.mjs:21-23` has `ignoreBuildErrors: true`.

### 3.3 Unused Dependencies
- `next-intl` — i18n was removed per DEVELOPMENT.md but package remains
- `@trpc/*` — installed but zero usage found

### 3.4 No Pagination on List Endpoints
Most GET endpoints return unbounded arrays. Should support `limit`/`offset`/`page`/`pageSize`.

### 3.5 Low Test Coverage
14 test files for 454 source files (~3% coverage). No API route tests exist.

### 3.6 Large Files
`src/app/dashboard/budget/page.tsx` has 1443 lines. Should be split.

### 3.7 Console Logging in API Routes
20+ `console.log/error` calls in production API endpoints instead of using the structured logger.

### 3.8 Image Domains Only Allows Localhost
`next.config.mjs:26` — will reject image optimization from production domains.

### 3.9 Error Response Inconsistency
Some endpoints return `{ error: string }`, others `{ error: string, code: string }`. No standard schema.

## Passed Code Quality Checks

- No `any` types found
- Comprehensive try-catch in all API routes
- Error boundaries and Sentry integration
- 93 database indexes on query hot-paths
- React Query with 222+ useQuery/useMutation calls
- No TODO/FIXME/HACK comments
- Security modules well-isolated in `/lib/security/`
- Proper Prisma client singleton for serverless
- Monorepo structure sound (Turborepo)

---

# 4. Database & Schema Audit

## Critical Findings

### 4.1 Missing Relations on Document Model
**Severity:** CRITICAL
**Location:** `Document` model — `projectId` and `budgetId` fields

Both are plain `String?` fields without `@relation()`. Cannot navigate `document.project` or `document.budget`. Orphaned documents on parent deletion.

### 4.2 Missing Relations on User Audit Fields
**Severity:** CRITICAL
**Location:** Project (`createdBy`), DocumentBudgetItem (`createdBy`, `approvedBy`), BudgetAuditLog (`userId`), ExpenseAttachment (`uploadedBy`), BudgetWatcher (`userId`), and others

8+ models have user-reference fields without `@relation()`. Cannot load user details, orphaned audit records on user deletion.

### 4.3 Missing BudgetCategory Self-Relation
**Severity:** CRITICAL
**Location:** `BudgetCategory.parentId`

No `@relation()` for parent-child hierarchy. Cannot query nested categories or cascade subcategory deletion.

## High Findings

### 4.4 Missing Task Self-Relation
**Location:** `Task.parentId` — no self-referential relation for subtask hierarchy.

### 4.5 Missing AIUsage Relations
**Location:** `AIUsage` model — `organizationId` and `userId` have no `@relation()`.

### 4.6 Missing Indexes on BudgetCategory
**Location:** `BudgetCategory` — no indexes on `budgetId` or `parentId`.

## Medium Findings

- **Inconsistent soft delete** — core models use it, membership/watcher models don't
- **Missing NOT NULL** on some audit fields (`BudgetAuditLog.userId`, `BudgetAuditLog.action`)
- **Task.assigneeId missing onDelete** — FK violation risk on user deletion
- **Document.uploadedBy missing relation** — cannot fetch uploader details

## Passed Database Checks

- All org-level models have `organizationId` with proper indexes
- Comprehensive indexing on Task, Goal, Project, Budget, Expense, UserActivity, Document
- Proper cascade behavior on organization-level models
- Prisma client singleton pattern correctly implemented in both packages
- Rich audit trails (UserActivity, BudgetRevision, BudgetAuditLog)
- Soft delete on core models (User, Organization, Project, Task, Comment, Attachment, Expense, Document)
- Watcher system with granular notification preferences
- Budget access levels with fine-grained permissions
- Decimal(19,2) for all financial fields

---

# Remediation Roadmap

## Phase 1: Immediate (48 hours) — Security Critical

1. Set unique `ADMIN_SECRET` in production (remove hardcoded default)
2. Add rate limiting to `/api/admin/login`
3. Fix account lockout `Math.min(0, ...)` bug
4. Secure CRON endpoint (require `CRON_SECRET`, fail if not set)
5. Add auth check to `GET /api/invitations/accept`
6. Protect or remove `/api/debug/*` endpoints

## Phase 2: This Sprint (1 week) — Schema & Design

7. Add missing `@relation` on Document, BudgetCategory, Task, AIUsage, audit fields
8. Delete 4 backup files (2,876 lines of dead code)
9. Remove unused dependencies (next-intl, @trpc)
10. Fix dark mode backgrounds to match three-tier system
11. Replace hardcoded teal colors with `primary-*` tokens
12. Resolve primary color palette (teal vs blue)

## Phase 3: Next Sprint (2 weeks) — Quality

13. Add pagination to all list endpoints
14. Standardize API error responses
15. Add soft delete to remaining user-editable models
16. Replace `console.log` with structured logger
17. Enable TypeScript strictNullChecks (Phase 2)
18. Convert raw `<button>` elements to `<Button>` components
19. Add missing NOT NULL constraints on audit fields
20. Fix image domain config for production

## Phase 4: Next Quarter — Hardening

21. Increase test coverage to 50%+ (focus on API routes)
22. Enable full TypeScript strict mode
23. Split large files (budget page, email.ts)
24. Implement connection pooling (Prisma Accelerate)
25. Add Redis caching for read-heavy endpoints
26. 2FA for admin accounts
27. Regular dependency security scanning

---

# Testing Checklist

- [ ] Admin login rate limiting blocks after 3 failed attempts
- [ ] `/api/invitations/accept` GET returns 401 without session
- [ ] `ADMIN_SECRET` env var required (no default fallback)
- [ ] Account lockout duration escalates (15→30→60→240→1440 min)
- [ ] Debug endpoints return 401 without admin token
- [ ] CRON endpoint returns 503 if `CRON_SECRET` not set
- [ ] Dark mode backgrounds match three-tier system
- [ ] All `primary-*` color tokens resolve to correct teal
- [ ] Prisma schema generates without errors after relation fixes
- [ ] Multi-tenant isolation verified (org1 user cannot access org2 data)
- [ ] Cascade deletes work correctly (delete org → all children removed)
- [ ] Pagination works on large datasets

---

# Conclusion

The Onekof Platform has a **solid foundation** — proper multi-tenant isolation, JWT auth with cross-subdomain cookies, comprehensive security headers, rate limiting on user-facing endpoints, and well-organized code. The 6 critical findings are all fixable within 48 hours. The database schema is thoughtful but needs relation cleanup. The UI design system is mostly compliant but needs color palette alignment and dark mode standardization.

**Production readiness:** Ready after Phase 1 (security critical) and Phase 2 (schema fixes) are complete.
