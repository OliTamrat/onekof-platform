# Product Surface Audit — what is real, what is empty, what is fabricated

> **Status: v1.0 — findings verified 2026-07-29**
> Author: Oli Tamrat, CTO — DAPS Analytics PLC
> Companion to `API_AUTHORIZATION_AUDIT.md`. That document covers whether routes are safe; this one covers whether screens are honest.

---

## 1. Why this exists

The founder asked for the whole surface to be scoped and for the work that genuinely needs doing to be separated from the work that does not — specifically so the product delivers what signup promises.

The edition audit (#174) already fixed the *promises*: onboarding no longer advertises capability that does not exist. This document asks the next question — **when a customer clicks into an enabled section, what do they actually see?**

The answer is worse than expected in one specific way.

---

## 2. Three categories, and only one of them is fine

| Category | Meaning | Honest? |
|---|---|---|
| **Real** | Queries the organization's data | Yes |
| **Empty placeholder** | Title, description, empty state, no data call | Yes — it promises nothing |
| **Fabricated** | Polished UI rendering hardcoded invented data | **No** |

An empty placeholder is honest. It says "nothing here yet" and a customer understands. **A fabricated page is not**, because it looks like a working feature until someone reads the names on it.

---

## 3. The finding: 11 pages render invented people and projects

These pages contain hardcoded arrays — names like *John Smith*, *Sarah Johnson*, *Emily Brown*; goals like *"Increase Product Revenue"*, *"Launch Mobile App"*; dates in 2024 — and make **no data call at all**.

| Page | Fabricated rows |
|---|---|
| `teams/activity` | 8 |
| `teams/board` | 7 |
| `teams/list` | 6 |
| `teams/goals` | 6 |
| `teams/pages` | 4 |
| `goals/board` | 7 |
| `goals/active` | 6 |
| `goals/completed` | 6 |
| `goals/list` | 6 |
| `goals/teams` | 6 |
| `goals/pages` | 4 |

**66 fabricated rows across 11 pages.**

> **RESOLVED 2026-07-29 — founder chose removal. All 13 pages deleted.**
> The 11 above plus `goals/teams` and `goals/timeline`, which the first count missed: my detector keyed on `{ id: N,` row literals and those two used `teamName:` and a `TIMELINE_EVENTS` array instead. The corrected total is **13**.
> Dead tab entries pruned from `TEAMS_TABS`, `GOALS_TABS`, `lib/dashboard-navigation.ts` and the inline tab bars in the five surviving pages, so nothing links to a 404.
> Two guards added: no dashboard page may contain the invented names, and every Teams/Goals tab must resolve to a page that exists. Re-adding any of these routes is welcome — in the change that makes it query real data.

### They are fully reachable, and that is the problem

`/dashboard/teams` and `/dashboard/goals/summary` are **real** — they query the organization's data. But both render a tab bar (`TEAMS_TABS`, `GOALS_TABS`) whose other tabs point at the pages above.

So the journey is: a customer opens Teams, sees their own people, clicks the **List** tab beside it, and is shown six strangers who do not work for them.

**Teams is enabled in every preset. Goals in four of six.** This is not an edge case reachable by URL-guessing; it is two clicks from the sidebar for effectively every customer.

### Why this is worse than a missing feature

A missing feature costs a sale. A screen full of invented colleagues costs credibility — and it fails in the worst possible setting, which is a demo to a ministry or a hospital where someone reads the screen carefully. It also cannot be explained away as "not built yet", because the UI is finished and polished; it looks deliberate.

---

## 4. Empty placeholders — honest, and lower priority

Confirmed as title-plus-empty-state with no data call: `compliance`, `courses`, `grants`, `impact`, `medical`, `patients`, `procurement`, `sites`.

**None of these is currently reachable from the sidebar.** #174 removed `medical`, `courses`, `compliance` and `impact` from every preset precisely because they had no navigation destination, and the remainder were never in one. They are dead routes, not dishonest screens.

They need real work eventually. They are not urgent, because nobody is being misled by them today.

---

## 5. What actually needs doing, in priority order

| # | Work | Why |
|---|---|---|
| 1 | **Retire the 11 fabricated pages** | Live credibility risk, two clicks from the sidebar, affects every customer |
| 2 | `requireAuth` → `requireAuthentication` rename | Cause of every authorization defect found today (see auth audit F4) |
| 3 | Integrations tenancy — 16 routes | Wrong-organization writes for multi-org users (auth audit F2) |
| 4 | Rate-limit `budgets/process-document` | Billing exposure (auth audit F3) |
| 5 | Remaining audit events — team/project member | Government customers will ask; catalogue promises them |
| 6 | Shared `Button` sweep | Broke four screens in one session |
| 7 | Empty placeholders → real features | Real work, but nobody is misled meanwhile |

### On item 1, the choice is not obvious and belongs to the founder

Three options, in increasing cost:

- **Remove the tabs.** Cheapest and immediately honest. Teams and Goals keep their real landing pages; the fake tabs disappear. Loses nothing that works.
- **Convert to empty states.** Keeps the navigation shape, shows "nothing here yet". Honest, preserves the intended structure, small effort.
- **Make them real.** Each needs a query, an empty state, i18n across five locales, and tests. This is genuine product work, several days, and worth doing for the tabs that earn it — List and Board plausibly do; Code, Forms and Pages may not belong in Teams or Goals at all.

**Recommendation: option 1 now, option 3 later for the tabs that deserve it.** Removing a tab is reversible in an afternoon; a fabricated screen in front of a ministry is not.

---

## 6. Method and limits

Pages were classified by whether they contain hardcoded `{ id: N, ... }` row literals and whether they make any data call (`useQuery`, `useSWR`, `fetch`, direct Prisma). Every page reported as fabricated was **opened and read** — an earlier heuristic in this same session wrongly flagged `goals/summary` as a stub when it does fetch, and that is exactly the error class this audit exists to avoid.

**Limit:** this finds pages with *no* data call. A page that fetches real data and *also* renders hardcoded rows alongside it would not be flagged. `goals/summary` is 687 lines, fetches, and contains 8 row literals — it was read and is a hybrid worth a closer look, but it is not in the fabricated list because it does query real data.
