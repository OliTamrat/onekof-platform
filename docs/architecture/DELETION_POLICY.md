# Deletion Policy — when to remove, when to rebuild, and how to make either reversible

> **Status: v1.0 — ACTIVE from 2026-07-29**
> Author: Oli Tamrat, CTO — DAPS Analytics PLC
> Written after a day in which 13 pages were deleted and 2 of them rebuilt three hours later. That churn was avoidable, and this is the rule that would have avoided it.

---

## 1. Why this exists

On 2026-07-29 an audit found 13 dashboard pages rendering invented people. They were deleted. Later the same day, two of them — Goals List and Goals Board — were rebuilt against the `Goal` model, which had existed the whole time.

Both decisions were individually defensible. Together they were waste: the delete and the rebuild touched the same files, the same tab configs, the same guard test, and the same reviewer's attention, twice.

**The missing step was one question, asked before deleting: does a model already back this?** For Goals it did. The right first move was rebuild, not remove.

---

## 2. Classify before deciding

Every candidate for deletion is one of four things. Only one of them should be deleted outright.

| Kind | What it looks like | Action |
|---|---|---|
| **Fabricated** | Polished UI, hardcoded domain data, no query | **Delete** — unless rule 3 applies |
| **Honest empty** | Title, description, empty state, no promise | **Keep** — it misleads nobody |
| **Dead** | No inbound references anywhere | **Delete** — after tracing the whole cluster |
| **Real** | Queries data | **Keep** |

A fabricated page is the only kind that is actively harmful, because it looks finished. An empty placeholder is honest and costs nothing but a roadmap line.

---

## 3. The rebuild-first rule

**Before deleting anything user-facing, check whether a model and an API already exist for it. If they do, rebuild instead of deleting.**

The cost asymmetry is the whole argument:

- Rebuilding a fabricated page that has a model behind it is usually **hours** — the data, the endpoint and the types already exist; the page simply never used them.
- Deleting then rebuilding is the same hours **plus** the deletion, plus pruning every reference, plus updating the guard, plus a second review.

Goals List and Board took roughly an hour each to build once the decision was made. Deleting them first bought nothing.

**Delete outright only when:**
- no model backs the feature (Goals Timeline, Goals Pages — nothing to query), **or**
- the feature is genuinely unwanted, not merely unbuilt, **or**
- it is dead code with no inbound references.

---

## 4. Every deletion must be reversible and self-explaining

Git history alone is not enough — it records *what* was removed, rarely *why*, and never *under what condition it may return*.

A deletion is complete only when all five hold:

1. **The reason is in the commit message**, in terms of behaviour rather than tidiness. "Rendered invented people two clicks from the sidebar" — not "removed unused pages".
2. **Every reference is pruned in the same change.** No route may 404 because a page went and a link stayed. Grep for the path, not just the import.
3. **A guard test states the re-entry condition.** Not "this must never exist" — that is how a guard becomes an obstacle to correct work. State what has to be true for it to come back.
4. **The audit doc records the decision**, so the next person finds the reasoning without archaeology through commits.
5. **Nothing kept is left half-wired.** If a page survives but its tab was removed, either the tab returns or the page goes. Unreachable-but-present is the worst state: it looks deleted and isn't.

### Guards must permit their own reversal

The `no-fabricated-pages` guard blocked the Goals rebuild, correctly, and its comment already allowed re-entry *"in the change that makes it query real data"*. That sentence is the pattern.

When the rebuild landed, the guard was made **stricter, not looser**: the rebuilt pages must now call `useQuery` and `fetchGoals` and must not declare a top-level row array. A guard that simply forbids a path can only be deleted; a guard that states a condition can be *satisfied*.

---

## 5. Infrastructure deletions are the founder's, not the engineer's

Code can be restored from git. A deleted Vercel project, database, or DNS record often cannot, and may carry configuration nobody wrote down.

**Rule: propose, do not delete.** State the evidence, the saving, and the risk — then stop.

Live example, unresolved at time of writing: two Vercel projects, `onekof-platform` and `onekof-platform-web`, both build `apps/web`. Every push deploys the same commit twice, which halved the free-tier quota and contributed to hitting the 100-deployments-per-day limit on 2026-07-29. Deleting one would double the headroom.

I have not deleted it, and will not. I cannot tell from the repository whether the second project is a leftover or serves a purpose recorded only in the Vercel dashboard, and the cost of being wrong — a broken production domain — is far higher than the quota.

---

## 6. Deployment cadence is part of this

Batch related work into one push. On 2026-07-29 roughly twenty pushes were made, several cancelling their own in-flight CI, each triggering two Vercel deployments. That is waste independent of any quota: cancelled runs produce nothing and burn build minutes.

**Push when a coherent piece of work is complete and verified, not after each file.**

---

## 7. The rule in one line

> **Classify it, check for a model, rebuild if one exists, and leave behind a reason and a re-entry condition rather than a hole.**
