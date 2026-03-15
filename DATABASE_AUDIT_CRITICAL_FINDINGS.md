# Database Schema Audit - Critical Findings Summary

**Audit Date:** March 8, 2026
**Database:** PostgreSQL (Supabase)
**Status:** Production-ready with critical fixes needed
**Priority:** CRITICAL

## CRITICAL ISSUES SUMMARY (Must fix immediately)

### 1. N+1 Query Vulnerability - 500-1000x Slowdown
**File:** `apps/web/src/app/api/analytics/projects/route.ts` (Lines 60-84)
**Issue:** Loads all tasks and members for all projects, then does linear search
**Impact:** Will timeout with >1,000 records
**Fix Effort:** 2-3 days

### 2. Missing Foreign Key Constraints (6 total)
**Issue:** No referential integrity on:
- Task.assigneeId (User)
- Task.reporterId (User)
- Project.leadId (User)
- Goal.ownerId (User)
- Goal.createdBy (User)
- Budget.approvedBy (User)

**Impact:** Orphaned references when users deleted
**Fix Effort:** 1 day

### 3. Missing Indexes on Member Tables
**Missing from:**
- OrganizationMember: [organizationId], [userId], [role]
- ProjectMember: [projectId], [userId], [role]
- TeamMember: [teamId], [userId]

**Impact:** 5-10x slower permission checks
**Fix Effort:** 1 day

### 4. Soft Delete Inconsistency
**Missing deletedAt from:** Team, TeamMember, ProjectMember, ProjectTeam
**Impact:** Can't safely delete teams
**Fix Effort:** 1 day

---

## PHASE 1: CRITICAL FIXES (1-2 weeks)

### Week 1: Data Integrity
- [ ] Add 6 missing FK constraints to schema
- [ ] Deploy migration to production
- [ ] Implement soft delete middleware for all queries
- [ ] Add deletedAt to Team, TeamMember, ProjectMember

### Week 2: Performance
- [ ] Fix N+1 query in analytics endpoint
- [ ] Add missing member table indexes
- [ ] Implement pagination limits
- [ ] Add query optimization middleware

---

## IMPLEMENTATION ROADMAP

**Week 1:** Critical fixes (40 hours)
**Week 2:** High-priority items (40 hours)
**Week 3:** Medium-priority items (30 hours)
**Week 4:** Low-priority items (20 hours)

**Total:** 4 weeks to full optimization

---

## DETAILED FINDINGS

See full audit report for:
- Complete schema analysis (39 models)
- Performance recommendations
- Security assessment
- Budget system analysis
- Automation system review

