# Onekof — overview

The first Ethiopian-native project and department management platform,
targeting 168,000 government employees and 750,000 private-sector workers
who currently run projects on Excel and email
(`business/EXECUTIVE_SUMMARY_ONE_PAGER.md` — the pitch, with the sourced
numbers behind that claim).

Multi-tenant, industry-edition-aware: an org gets a sidebar shaped by its
industry (Development, Marketing, Operations, Research — the D1–D9
department/workstream architecture, ADR-0003) rather than one generic tool
wearing every label. Ethiopian calendar and multi-language support are
first-class, not bolted on (`video-scripts/05-ethiopian-calendar.md`,
`video-scripts/06-multi-language.md` — the training material doubles as a
feature index).

## Deployment tiers (ADR-0001)

- **Tier 3** — Vercel + Supabase, live at onekof.com. This is the tier
  everything is built and tested against first.
- **Tier 2** — the same Docker image on Ethiopia Telecom Cloud (ECS), for
  data-sovereignty requirements. INSA-certified (ADR-0002). Approved,
  pending VM order — `deployment/ETHIO_TELECOM_CLOUD_PRICING_BRIEFING.md`
  has the current pricing and scenario brief.

## Where the depth lives

This page and `architecture.md` are the front door the rest of the OKM
fleet uses; Onekof's own docs tree predates OKM and is deeper than the
taxonomy elsewhere, so it stays in its own shape rather than being
flattened into it:

| Section | What's there |
|---|---|
| `business/` | Pitch, IP registration, readiness reports, industry-edition reference |
| `deployment/` | ECS migration, DNS, backup strategy, VM requests |
| `development/` | Setup guide, logging, linguist review workflow |
| `security/` | OAuth, email integration, secrets, production hardening |
| `support/` | The 9-section guide library for the TA/support team |
| `marketing/`, `legal-ip/`, `video-scripts/` | Their names |
