# Onekof Support Guide Library

Feature documentation for the DAPS Analytics Technical Assistance (TA) team.
Every guide follows the same branded 9-section template so a support agent can
open any guide and find the same things in the same places.

**Owner:** Oli Tamrat, CTO — DAPS Analytics PLC
**Audience:** TA team, trainers, and onboarding staff. Written for non-technical
readers; each guide ends with an "Under the Hood" section for senior support.

---

## The template (every guide, same 9 sections)

| # | Section | Purpose |
|---|---------|---------|
| 1 | What is …? | Plain-language definition of the feature and why it exists |
| 2 | Who Can Do What | Role/permission table — the first place to look when "the button is missing" |
| 3 | Key Terms | Vocabulary the user will meet on screen |
| 4 | Step-by-Step Guides | Numbered walkthroughs of every core flow |
| 5 | Rules the System Enforces (and Why) | Deliberate protections — turns "why can't I…" into an explanation |
| 6 | Troubleshooting & FAQ | Symptom → answer table, grounded in real testing |
| 7 | Benefits | Value framing per audience: teams / managers / leadership |
| 8 | Under the Hood | Senior-support reference: lifecycle, audit, data rules |
| 9 | Where Everything Lives | Navigation map: "I want to… → Go to…" |

Formatting standard: Onekof logo on the title page and page headers, teal
`#1C8C7D` accents, DAPS footer with page numbers, Calibri. Terminology follows
the organization's scheme (Sprint / Work Cycle) and all guides note the five
platform languages (English, Amharic, Afaan Oromo, Tigrinya, Somali).

## Regenerating a guide

Guides are **generated, not hand-edited** — the `.docx` files are build
artifacts of the scripts in `generators/`. To change a guide, edit its
generator and rebuild:

```bash
cd docs/support/generators
npm install docx        # one-time
node sprints.js         # writes ../ONEKOF_SUPPORT_GUIDE_SPRINTS.docx
```

`generators/lib/guide-lib.js` holds the shared branding and section builders.
Never edit a `.docx` directly — the next regeneration would overwrite it.

---

## Catalog & build order

Guides are organized by Onekof's own structure: the universal core every
organization uses, then the modules enabled per organization type
(Ministry/Government, NGO/Non-Profit, Business/Startup, Education — see
`apps/web/src/lib/presets/organization-presets.ts`).

### Family A — Foundations (every user, day one)

| Guide | File | Status |
|-------|------|--------|
| Getting Started & Navigation | `ONEKOF_SUPPORT_GUIDE_GETTING_STARTED.docx` | ✅ v1.0 |

Covers: sign-up and onboarding, organization types and presets, language
switching, the sidebar and mobile navigation, command palette, notifications.

### Family B — Core Project Management (every organization)

| Guide | File | Status |
|-------|------|--------|
| Projects, Issues & Boards | `ONEKOF_SUPPORT_GUIDE_PROJECTS_ISSUES_BOARDS.docx` | ✅ v1.0 |
| Sprints & Work Cycles | `ONEKOF_SUPPORT_GUIDE_SPRINTS.docx` | ✅ v1.0 |
| Goals & OKRs | `ONEKOF_SUPPORT_GUIDE_GOALS_OKRS.docx` | ⏳ Wave 2 |
| Calendar & Timeline views | folded into Projects, Issues & Boards | — |

### Family C — People & Access (every organization)

| Guide | File | Status |
|-------|------|--------|
| Teams, Members & Permissions | `ONEKOF_SUPPORT_GUIDE_TEAMS_MEMBERS_PERMISSIONS.docx` | ✅ v1.0 |

Covers: org roles vs project roles vs team roles, invitations, and the audit
trail behind people actions.

### Family D — Finance & Accountability

| Guide | File | Status |
|-------|------|--------|
| Budget & Expenses | `ONEKOF_SUPPORT_GUIDE_BUDGET_EXPENSES.docx` | ✅ v1.0 |
| Procurement (Ministry) / Grants & Donations (NGO) | appendices in Budget guide; standalone if a client needs depth | ⏳ Wave 3 |

### Family E — Knowledge & Collaboration

| Guide | File | Status |
|-------|------|--------|
| Documents (AI Documents) | `ONEKOF_SUPPORT_GUIDE_DOCUMENTS.docx` | ⏳ Wave 2 |
| Docs & Wiki | `ONEKOF_SUPPORT_GUIDE_DOCS_WIKI.docx` | ⏳ Wave 2 |

### Family F — Insight & Governance

| Guide | File | Status |
|-------|------|--------|
| Reports & Analytics | `ONEKOF_SUPPORT_GUIDE_REPORTS_ANALYTICS.docx` | ⏳ Wave 2 |
| Compliance & Audit (INSA) | `ONEKOF_SUPPORT_GUIDE_COMPLIANCE_AUDIT.docx` | ⏳ Wave 2 |
| Organization Settings & Customization | `ONEKOF_SUPPORT_GUIDE_ORG_SETTINGS.docx` | ⏳ Wave 2 |

### Family G — Automation & AI (preset-dependent)

| Guide | File | Status |
|-------|------|--------|
| Automations (workflows, triggers, history) | `ONEKOF_SUPPORT_GUIDE_AUTOMATIONS.docx` | ⏳ Wave 3 |

### Family H — Industry Modules (per-client, produced when a vertical goes live)

Medical & Patients · Education & Courses · Facilities, Equipment, Sites &
Safety · Research · Impact · Marketing · Development · Operations. Each gets a
guide in this same template when its first client deployment is scheduled —
writing them earlier would document screens that may still change.

---

## Waves

- **Wave 1 (done):** Foundations + the guides every training session needs —
  Getting Started, Projects/Issues/Boards, Sprints, Teams & Permissions,
  Budget & Expenses.
- **Wave 2:** Goals & OKRs, Documents, Docs & Wiki, Reports & Analytics,
  Compliance & Audit, Org Settings — completes the universal platform.
- **Wave 3:** Automations + industry modules, scheduled against client
  go-lives.

## Versioning rule

A guide's version bumps when the feature changes behavior, not when wording is
polished. The feature PR that changes behavior should also update the guide's
generator — the same rule the codebase already applies to migrations and
design docs.
