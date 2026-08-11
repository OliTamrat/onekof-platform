# The knowledge base — OKM index

Onekof already had the deepest docs tree in the Olink fleet before OKM
arrived — nine sections, from architecture to legal-ip. OKM Phase 1 here
adds what was missing, not a rewrite: this index, the append-only
decisions record, and a checker that grades the claims that can be graded
(`scripts/docs-truth.mjs`, wired into CI).

The operational briefing remains `PROJECT_BRIEFING.md`; the standing rules
remain `PROJECT_GUIDELINES.md`. Durable knowledge graduates here.

| Where | What |
|---|---|
| `architecture/` | System + module architecture, audits (pre-OKM, authoritative) |
| `deployment/` | Tier 2/3 deployment, Ethio Telecom ECS, INSA materials |
| `security/` | INSA P1–P6 and security posture |
| `business/`, `marketing/`, `legal-ip/`, `support/`, `video-scripts/`, `development/` | Their names |
| `decisions/` | **New:** ADRs — append-only, superseded never edited |

## Rules

1. One source per fact — pages link to the file that owns a value.
2. Decisions are append-only ADRs; a session that decides something real
   ends by appending one.
3. Checkable claims are checked: `scripts/docs-truth.mjs` runs in CI and
   fails naming the sentence to fix.
