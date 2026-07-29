# API Authorization Audit — full sweep of 163 routes

> **Status: v1.0 — findings verified 2026-07-29**
> Author: Oli Tamrat, CTO — DAPS Analytics PLC
> Supersedes three ad-hoc reports made earlier the same day, two of which overstated the problem. This document exists because those reports were unreliable and the founder asked for the whole surface to be scoped properly rather than sampled.

---

## 1. Why this document exists, and why the earlier reports were wrong

Three separate authorization defects were found on 2026-07-29 by pulling on threads rather than by auditing. Each time, a grep was used to estimate how widespread the problem was, and each time the grep was wrong:

| Attempt | Claim | Why it was wrong |
|---|---|---|
| 1st | "Risk is in `[organizationId]` path routes; need a tenancy helper" | Four of five such routes already authorized correctly. The helper would have solved a problem that mostly did not exist. |
| 2nd | "13 routes have no authorization" | The pattern did not include `requireProjectAccess`. `issues/[id]` was a false positive. |
| 3rd | "5 routes, `expenses/[id]/pay` confirmed exploitable" | The pattern did not include `requireExpenseAccess`. **`expenses/[id]/pay` was never vulnerable** — it gates on line 20, before any mutation. It was reported as *verified*, and it was not. |

**The common error: testing for a known list of helper names.** Every time the codebase used a helper that was not in the list, the route was misclassified as unguarded. Absence from a grep was read as absence from the code.

**The method here is the inverse.** The audit script extracts *every* guard-shaped call it finds — anything matching `require*`, `check*`, `can*`, `resolveUserOrganization`, `hasRole`, `hasAccessLevel`, plus membership lookups — and reports what is present rather than testing for what is expected. Routes with nothing are then **read by hand**, not trusted to the tool.

Even so, the script needed two corrections during this audit, both recorded in its comments:
- It matched only `prisma.*` mutations and so classed every `db.*` mutation as read-only.
- It cannot see mutations performed through service functions (`updateSlackConfig(...)`), which is why the integrations findings came from reading, not from the tool.

**A tool that flags nothing is not evidence of safety.** That is the lesson worth keeping.

---

## 2. Method

Script: `scripts/audit-routes.py`. For each `app/api/**/route.ts` it strips comments (so prose describing a fix cannot satisfy a check for it), then records: exported HTTP methods, whether a mutation occurs, every guard-shaped call, and whether a membership lookup occurs.

Routes that mutate, authenticate, and show **neither** a guard nor a membership lookup are the read-by-hand set. Every route in that set was opened and read for this document.

**Scope limit, stated plainly:** the script proves the *presence* of a guard, never its correctness. A route calling `requireProjectAccess` against the wrong project id would pass this audit. That class of error needs review, not tooling.

---

## 3. Numbers

| Measure | Count |
|---|---|
| Total API routes | 163 |
| Mutating routes | 88 |
| Mutating, authenticated, no guard and no membership lookup | 6 |
| Of those 6, genuine authorization gaps after reading | **1** (`issues/[id]/watchers`) |
| Of those 6, user-self-scoped and correct | 4 |
| Of those 6, a different class of problem | 1 (`budgets/process-document`) |

**The headline: the codebase is in better shape than any of my three earlier reports implied.** The right helpers exist and the overwhelming majority of routes use them. The defects are individual oversights, not a systemic absence.

---

## 4. Findings

### F1 — `issues/[id]/watchers` (GET and POST) — genuine gap, fixed

Both verbs fetch the task **including its owning `organizationId`**, under a comment reading *"Verify issue exists and user has access"* — and then never check it. The organization id is selected and discarded.

- **GET** returned the watcher list — names and email addresses of another organization's members — for any task id.
- **POST** added a watcher to any task id.

Fixed by calling `requireProjectAccess` after the task is loaded.

**This one matters beyond itself:** it sits in the same directory as `comments`, `subtasks` and `transitions`, all fixed hours earlier the same day, and the ad-hoc grep missed it because that grep required the exact string `where: { id: params.id }` and this route spans several lines with a `deletedAt` clause. A one-character difference in formatting hid a live defect from three consecutive searches.

### F2 — Integrations resolve the wrong organization — 16 routes, FIXED

Every route under `app/api/integrations/` authorizes with `session.user.organizations?.[0]` — the user's **first** organization — rather than the organization of the current request.

This is **not** an IDOR: a user cannot reach an organization they do not belong to. It is a tenancy correctness bug. A user who belongs to more than one organization will read and write the integration configuration of whichever organization happens to be first in their session, regardless of which tenant subdomain they are working in. Connecting Slack for a ministry while working in an NGO workspace is the shape of the failure.

It is also inconsistent with the platform's own model: tenancy is resolved from the hostname everywhere else (`x-organization-slug`, `resolveUserOrganization`). These 16 routes predate that decision and were never brought in line.

Affected: `email`, `github`, `google`, `google-calendar`, `jira`, `microsoft-teams`, `slack`, `webhooks`, `webhooks/endpoints`, and the `test` variants, plus the `integrations` index. All now call `resolveUserOrganization()`.

### F2a — The OAuth state was unsigned, and that was worse than F2

Found while confirming F2 was actually closed. The six connect routes resolve the organization **correctly** and then hand it to the browser like this:

```ts
const state = Buffer.from(JSON.stringify({ organizationId, userId, ... })).toString('base64url');
```

and the six callbacks did this:

```ts
state = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
await connectSlack(state.organizationId, state.userId, code);
```

base64url is an **encoding, not a signature**. The organizationId in that blob is attacker-controlled.

**The attack.** Authorise your own Slack workspace against the app to obtain a genuine `code`. Hand the callback a state naming somebody else's `organizationId`. The callback connects *your* workspace to *their* tenant — and Onekof then delivers that organization's task notifications, mentions and issue activity into your Slack channel. Organization ids are visible to any member of any organization, so this is cross-tenant exfiltration reachable by any authenticated user who knows one id.

**The routes did generate a `nonce`.** Nothing ever stored or checked it. It made the state *look* defended without defending it, which is why the shape survived review.

**Why F2's own analysis missed it.** F2 asked "does this route resolve the right organization?" and the answer was yes. Resolving correctly and *carrying* safely are different questions, and only the first was being asked. This is the same failure mode as the three ad-hoc greps in F1: a check that is precise about what it looks for and silent about everything else.

Fixed in `lib/integrations/oauth-state.ts`: HMAC-SHA256 over the exact payload bytes (so key ordering cannot change what was verified versus what is used), a ten-minute expiry (a state captured from browser history would otherwise be valid forever), and a membership re-check at callback time — signing proves we minted the state, not that the person is still in the organization they were in when they left for the provider. Length is compared before `timingSafeEqual`, which throws on a mismatch and would otherwise 500 on attacker input.

Guarded by a test that asserts no callback contains `JSON.parse(Buffer.from(stateParam`, and that reproduces the rewrite attack rather than asserting the helper is called.

### F3 — `budgets/process-document` POST — cost exposure, not disclosure, FIXED

Takes a `projectId` and never validates that the caller may use it. The `projectId` is not used to read project data — the route processes the *uploaded* file — so this is not a data-disclosure defect. Its PUT sibling does validate, against `userOrgIds`.

The real exposure is different: **an authenticated user can send 10 MB files to the Anthropic API repeatedly**, with no organization check and no rate limit on the route. This is a billing and abuse concern rather than a tenancy one, and it is the only route of its kind found.

Now rate-limited per user (keyed on identity rather than IP, so a whole ministry behind one NAT is not punished for one uploader) **and** the projectId is validated against the caller's memberships. The narrow reading — "POST never reads project data, so the id need not be checked" — was defensible and still wrong: it left an unvalidated tenant id on the only route in the codebase that spends money per request, with the rate limit as the sole thing between one account and an unbounded bill.

### F4 — `requireAuth` is named as though it authorizes

`lib/security/authorization.ts` opens with:

> *"SECURITY: Prevents IDOR (Insecure Direct Object Reference) attacks by verifying users can only access resources in their organization"*

`requireAuth()` does no such thing. It authenticates and returns. The functions that deliver on that header — `requireProjectAccess`, `requireOrganizationMembership`, `requireExpenseAccess` — sit directly beneath it.

Every defect found today shares the same shape: a route called `requireAuth()`, the author read the module header, and stopped. The name and the header both invite the mistake. **Renaming it to `requireAuthentication()` would make the gap legible at every call site**, and is a smaller change than auditing forever.

### F5 — Verified correct (recorded so the work is not repeated)

Read and confirmed properly authorized: `expenses/[id]` (read/update gated separately), `expenses/[id]/pay` (gated before mutation — the route I wrongly reported as exploitable), `issues/[id]`, `teams/[id]`, `organizations/[organizationId]/{audit-log,invitations,projects,settings}`. The four user-self-scoped routes (`push/register`, `user/avatar`, `user/change-password`, `user/update`) have no tenant dimension and are correct as written.

---

## 5. What to do, in order

| # | Action | Why this order |
|---|---|---|
| 1 | **F1 watchers** — DONE | Live cross-tenant read and write |
| 2 | **F4 rename `requireAuth` → `requireAuthentication`** — DONE | Mechanical, low risk, and removes the cause of every defect found today rather than another symptom |
| 3 | **F2 integrations tenancy** — DONE | 16 routes, one consistent pattern, wrong-tenant writes for multi-org users |
| 4 | **F3 rate-limit `process-document`** — DONE | Billing exposure; no customer data at risk |
| — | **F2a signed OAuth state** — DONE, and it outranked all of the above | Cross-tenant exfiltration reachable by any authenticated user; found only because F2 was re-checked rather than ticked off |

Every item on this list is closed. Two later additions are recorded elsewhere and were found the same way — by re-examining something already marked correct:

- **§5a** — the "is the guard called with the *right argument*" pass.
- **M2's care-item sweep** (`__tests__/api/care-item-coverage.test.ts`) — which found that the task **sub-resource** layer was the weak one: watcher removal had no authorization at all, attachments and links checked organization membership only, and bulk operations were not scoped to project access. Four live defects in a directory this audit had already walked.

Deliberately **not** recommended: the sweeping "tenancy helper" proposed in my first report. Four of five organization-path routes were already correct, and the real defects were in resource-id routes that a path-org helper would never have touched.

### The pattern across every finding in this document

Each defect was found by asking a *different question* of code that had already passed a check, never by running the same check more carefully:

| Found by | What it caught |
|---|---|
| "is a guard called?" | F1, the original IDOR sweep |
| "is it called with the right argument?" | §5a |
| "is the value it guards carried safely?" | F2a — the unsigned state |
| "what about resources reached *through* this one?" | M2's four sub-resource defects |

Three separate greps for a known list of helper names missed live defects. The tests that now hold this ground are the inverted kind: enumerate everything in a category and require each item to be *explicitly* accounted for, so silence is a failure rather than a pass.

---

## 5a. Second pass — are the guards called with the RIGHT argument? (2026-07-29)

§6 below states the audit proves a guard is *called*, never that it is called correctly. That gap is now closed as far as it can be mechanically.

Across all 164 routes there are **28 guard calls**. Each was classified by where its identifier comes from:

| Source | Count | Verdict |
|---|---|---|
| Derived from the fetched resource (`task.projectId`, `expense.budget.projectId`, `team.organizationId`) | 17 | Correct by construction |
| `params.id` where the route **is** that resource | 11 | Correct — the path parameter names the thing being acted on |
| Arbitrary request input guarding a *different* resource | **0** | — |

**No mismatches.** The dangerous shape — guard resource A, then act on resource B — does not occur.

Worth recording that the first classifier flagged all 11 `params.id` cases as suspicious. They are not: `expenses/[id]/pay` guarding `params.id` *is* guarding the expense it pays, and `projects/[id]/settings` guarding `params.id` *is* guarding that project. A path parameter naming the route's own resource is not user input in the sense that matters. Reading them was what settled it — the same lesson as every other scan today.

### Current state of the mutating set

Re-running `scripts/audit-routes.py` after the fixes: **164 routes, 89 mutating, 4 with no guard and no membership lookup** — down from 6. All four (`push/register`, `user/avatar`, `user/change-password`, `user/update`) are user-self-scoped and have no tenant dimension. The read-only unguarded set fell from 24 to 8 when the integration routes were fixed.

### What remains genuinely unprovable by tooling

That a guard's *logic* is right — `requireProjectAccess` itself correctly resolving visibility and membership. That needs review of the helper, not of its call sites, and the helper is small enough to read.

## 6. Standing limitation

This audit proves that a guard is called. It does not prove the guard is called with the right arguments, nor that its own logic is correct. `requireProjectAccess(someOtherProjectId, userId)` passes every check in this document.

Given that three consecutive greps were wrong today, the honest position is: **this is the most reliable picture available so far, not a guarantee.** It should be re-run when routes are added, and the read-by-hand set should be read again rather than assumed stable.
