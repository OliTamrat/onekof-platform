# The knowledge base — OKM index

Onekof already had the deepest docs tree in the Olink fleet before OKM
arrived — nine sections, from architecture to legal-ip — and that depth is
kept in its own shape rather than flattened into the fleet taxonomy: it
would mean rewriting content that was already right.

**Corrected 2026-08-11.** The first OKM pass here added only the index and
the decisions record, on the reasoning that the existing tree already
covered everything. That reasoning missed the actual point of the front
door: `overview.md` and `architecture.md` are not a *content* requirement,
they are what makes every product on the portal open the same way. A
reader who explores Bank Assist and then clicks into Onekof should not
land in a structurally different site. Both are added now, as short maps
pointing into the sections below — not duplicates of them.

The operational briefing remains `PROJECT_BRIEFING.md`; the standing rules
remain `PROJECT_GUIDELINES.md`. Durable knowledge graduates here.

| Where | What |
|---|---|
| `overview.md` | What Onekof is, the deployment tiers, who it's for |
| `architecture.md` | The department/workstream model, multi-tenancy, access control |
| `runbooks/` | Deploy (both tiers), database backup — pointers into `deployment/` |
| `integrations/` | OAuth, email, DNS — pointers into `security/` and `deployment/` |
| `architecture/` | System + module architecture, audits (pre-OKM, authoritative) |
| `deployment/` | Tier 2/3 deployment, Ethio Telecom ECS, INSA materials |
| `security/` | INSA P1–P6 and security posture |
| `business/`, `marketing/`, `legal-ip/`, `support/`, `video-scripts/`, `development/` | Their names |
| `decisions/` | ADRs — append-only, superseded never edited |

## Rules

1. One source per fact — pages link to the file that owns a value. The
   new front-door pages point into the sections above rather than
   restating them; if a pointer and its target disagree, the target wins.
2. Decisions are append-only ADRs; a session that decides something real
   ends by appending one.
3. Checkable claims are checked: `scripts/docs-truth.mjs` runs in CI and
   fails naming the sentence to fix. The OKM portal separately checks that
   `overview.md`, `architecture.md` and `decisions/` exist at all — this
   repo is the reason that check exists.
