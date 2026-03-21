# Onekof Platform — Project Status Review
## Stakeholder Deck | March 21, 2026

---

# Agenda

1. Platform Overview & Completed Milestones
2. Comprehensive Audit Results
3. Critical Findings Requiring Immediate Action
4. Remediation Roadmap & Timeline
5. Strategic Roadmap Ahead
6. Key Decisions Needed

---

# Platform Overview

**Onekof** is a multi-tenant project management platform built for Ethiopian organizations.

**Tech Stack:** Next.js 14, TypeScript, PostgreSQL, Prisma ORM, Tailwind CSS, Vercel

**Scale:** 164 pages, multi-tenant subdomain routing, JWT auth with cross-subdomain cookies

**Key Differentiators:**
- Ethiopian-first customizations (ETB currency, Ethiopian calendar)
- Jira-inspired UI with AI-powered insights
- Multi-org support via subdomain isolation (org.onekof.com)

---

# Completed Milestones

- Marketing site redesign (hero, features, pricing, testimonials, footer)
- AI Insights panel with expandable drill-down details
- Board view with responsive grid and readable cards
- Dark mode across all components
- Jira-style layout as primary layout
- Multi-tenant subdomain routing
- JWT auth with cross-subdomain cookies
- Security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting on user-facing auth endpoints
- Comprehensive database indexing (93 indexes)

---

# Audit Overview

A full-spectrum audit was conducted across 4 areas on March 21, 2026.

| Area | Rating | Critical | High | Medium | Low |
|------|--------|----------|------|--------|-----|
| Security | 7/10 | 2 | 3 | 2 | 3 |
| UI/UX Design | 6/10 | 1 | 3 | 1 | 1 |
| Code Quality | 7.5/10 | 0 | 1 | 8 | 5 |
| Database | 7/10 | 3 | 3 | 4 | 3 |
| **TOTAL** | | **6** | **10** | **15** | **12** |

**Overall Assessment:** Solid foundations. Production-ready after critical fixes.

---

# What's Working Well

**Security Strengths:**
- Multi-tenant isolation with org-level data filtering on every API route
- JWT auth with httpOnly cookies and sameSite protection
- bcryptjs password hashing (12 salt rounds)
- Comprehensive security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- Rate limiting on signup, password reset, and email verification
- Prisma parameterized queries (no SQL injection risk)

**Architecture Strengths:**
- Clean monorepo structure (Turborepo)
- Prisma client singleton for serverless (prevents connection exhaustion)
- 222+ React Query hooks for efficient data fetching
- Rich audit trails (UserActivity, BudgetRevision, BudgetAuditLog)
- 93 database indexes on query hot-paths

---

# Critical Finding 1: Admin Security Gap

**Risk Level: CRITICAL**

The admin login endpoint has two serious vulnerabilities:

**1. Hardcoded Default Secret**
If the ADMIN_SECRET environment variable is not set, the system falls back to a guessable default string. An attacker could forge admin JWT tokens and gain full platform access — all organizations, all users, all data.

**2. No Rate Limiting on Admin Login**
Every other auth endpoint has brute-force protection, but the highest-privilege endpoint (admin login) has none. Unlimited login attempts are allowed.

**Impact:** Complete platform compromise if exploited
**Fix Time:** 30 minutes
**Status:** Requires immediate fix

---

# Critical Finding 2: Database Integrity Gaps

**Risk Level: CRITICAL**

10+ database models have foreign key fields without proper Prisma relations defined.

**Affected Models:** Document, BudgetCategory, Task, AIUsage, Project, BudgetAuditLog, ExpenseAttachment, BudgetWatcher, DocumentBudgetItem, DocumentMilestone

**What This Means:**
- Documents can become orphaned when projects or budgets are deleted
- Cannot load related data efficiently (creator names, approver details)
- Subtask and nested category hierarchies don't work through the ORM
- Audit trails can't link back to users

**Impact:** Data integrity risk, N+1 query performance issues, broken navigation
**Fix Time:** 3-4 hours
**Status:** Requires fix before scaling

---

# Critical Finding 3: Design System Misalignment

**Risk Level: HIGH**

**Color Palette Conflict:**
The design specification defines teal (#1C8C7D) as the primary brand color, but the codebase implements blue (#2563EB). Every primary button, link, and active state renders in the wrong color.

**Dark Mode Inconsistency:**
18+ components use non-standard dark backgrounds (black, #0A0A0A, #111111) instead of the defined three-tier system (#1B1F23, #22272B, #282E33). The dark mode experience looks fragmented.

**Impact:** Inconsistent brand experience, harder to maintain
**Fix Time:** 4-6 hours
**Status:** Requires alignment decision from stakeholders

---

# High Priority Findings Summary

| # | Finding | Area | Impact | Fix Time |
|---|---------|------|--------|----------|
| 1 | Account lockout never escalates (code bug) | Security | Brute-force protection weakened | 10 min |
| 2 | Invitation endpoint leaks org info without auth | Security | Information disclosure | 15 min |
| 3 | CRON endpoint open if secret not configured | Security | DoS via expensive queries | 15 min |
| 4 | 2,876 lines of dead backup files | Code Quality | Codebase bloat | 10 min |
| 5 | 7+ components hardcode colors instead of tokens | UI/UX | Brand changes won't propagate | 2 hrs |
| 6 | Dark mode uses 4 different background systems | UI/UX | Fragmented visual experience | 3 hrs |

---

# Medium Priority Findings

**Security:**
- Debug endpoints exposed without authentication (/api/debug/*)
- Account lockout silently allows login on system error

**Code Quality:**
- TypeScript strict mode disabled; build errors ignored
- Unused dependencies still installed (next-intl, @trpc)
- No pagination on API list endpoints
- Only 3% test coverage (14 test files / 454 source files)
- Console.log used instead of structured logging in 20+ API routes

**Database:**
- Inconsistent soft delete strategy across models
- Missing NOT NULL constraints on audit fields
- Missing onDelete behavior on Task assignee relation

---

# Remediation Roadmap

## Week 1 — Security Critical (4-5 hours)
- Remove hardcoded admin secret fallback
- Add rate limiting to admin login
- Fix account lockout escalation bug
- Secure CRON endpoint
- Add auth to invitation endpoint
- Protect debug endpoints

## Week 2 — Schema & Design (6-8 hours)
- Add all missing Prisma relations (10+ models)
- Delete dead backup files
- Remove unused dependencies
- Align dark mode to three-tier system
- Resolve primary color palette

## Week 3 — Quality (8-10 hours)
- Add pagination to all list endpoints
- Standardize API error responses
- Enable TypeScript strictNullChecks
- Convert raw HTML elements to UI components
- Replace console.log with structured logger

## Week 4+ — Hardening (ongoing)
- Increase test coverage to 50%+
- Enable full TypeScript strict mode
- Implement connection pooling
- Add Redis caching layer

---

# Strategic Roadmap

## Phase 1: Admin Dashboard (Current Priority)
Superadmin dashboard at /admin for platform-wide management:
- Organization management (create, edit, suspend, usage stats)
- User management across all orgs
- System health monitoring
- Feature flags per org
- Audit log for admin actions

## Phase 2: White-Label Infrastructure
Enable enterprise customers with branded environments:
- Tier 1: Cosmetic branding (logo, colors, app name)
- Tier 2: Custom domains (client.example.com → Onekof)
- Tier 3: Isolated infrastructure (government contracts)

## Phase 3: Scalability (200 → 10,000+ users)
- Connection pooling (Prisma Accelerate / PgBouncer)
- Redis caching layer (Upstash)
- Database read replicas
- Per-tenant database routing

---

# Decisions Needed

1. **Primary Brand Color:** Teal (#1C8C7D) as specified in design docs, or Blue (#2563EB) as currently implemented? This affects every primary button, link, and active state across 164 pages.

2. **Debug Endpoints:** Remove entirely from production, or gate behind superadmin authentication?

3. **Test Coverage Target:** What minimum coverage percentage before shipping to enterprise clients?

4. **Remediation Priority:** Confirm Week 1-4 sequencing, or re-prioritize based on business needs?

---

# Timeline & Next Steps

| Milestone | Target Date | Owner |
|-----------|-------------|-------|
| Security critical fixes deployed | March 28, 2026 | Engineering |
| Schema & design alignment complete | April 4, 2026 | Engineering |
| Code quality improvements | April 11, 2026 | Engineering |
| Admin Dashboard MVP | April 25, 2026 | Engineering |
| White-Label Tier 1 | May 2026 | Engineering |
| First enterprise pilot | June 2026 | Business + Engineering |

---

# Thank You

**Full Audit Report:** AUDIT-REPORT-2026-03-21.md (in repository)

**Questions?**
