# Onekof Web Platform — Session Briefing
> Last updated: 2026-05-29 — Resume after disconnect

---

## WHERE WE LEFT OFF

Web platform is live at **vision.onekof.com** (and other org subdomains).

**Session work completed today:**
1. ✅ Investigated 403 errors on issue detail slideout and task status updates
2. ✅ Fixed `requireProjectAccess` inconsistency in `authorization.ts` — MEMBER users on PUBLIC/INTERNAL projects can now open issue details, update status/priority, and change assignees without 403
3. ✅ Confirmed department task creation fix (commits 188f2e1 + e4b1994) is working
4. ✅ Build passed, pushed to master (`7a77fa7`), deployed to Vercel

**Verified working:**
- Issue detail slideout loads ✓
- Task status updates (TODO → IN PROGRESS → DONE) ✓
- Assignee changes ✓
- Department page task creation across all 11 departments ✓

---

## KNOWN REMAINING ISSUES

| # | Issue | Status |
|---|---|---|
| 1 | Assignee dropdown may show empty on some accounts (org-members 403) | To investigate |
| 2 | Android Play Store submission | Pending (see mobile section) |

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
