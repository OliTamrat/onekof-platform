# Architecture

Full stack detail lives in `development/SETUP_GUIDE.md` (Node 20+, pnpm,
PostgreSQL 16, Redis optional) and the `architecture/` folder's own deep
dives; this page is the map, not a duplicate.

## The organizing idea: departments and workstreams (ADR-0003)

`architecture/DEPARTMENT_WORKSTREAMS_ARCHITECTURE.md` is the design
document. Department pages (Development → Releases/Code Review,
Marketing → Campaigns/Social/Analytics, Operations →
Incidents/Monitoring/Checklists, Research → Data/Findings/Plans) are
label-filtered lenses over one issue store — a page stamps default
labels on creation and filters by them on read, rather than each
department being its own data model. Which sections an org sees at all
is industry-gated (`architecture/SIDEBAR_EDITIONS_ARCHITECTURE.md`).

## Multi-tenancy

`architecture/MULTI_TENANT_SETUP_GUIDE.md` is the authority. Tenant
isolation and what a preset is and is not allowed to expose is also where
ADR-0005 (no vocabulary without destinations) applies most directly — a
preset enabling a department that has no real page behind it is the
specific failure that ADR exists to prevent; `PRODUCT_SURFACE_AUDIT.md`
is the periodic check that promises and surfaces still match.

## Access control

`architecture/API_AUTHORIZATION_AUDIT.md` — the authorization surface,
audited. `architecture/DELETION_POLICY.md` — what deletion actually does
per entity type, which is the question every "can I undo this" support
ticket is really asking.

## The Medical module (ADR-0004)

`architecture/MEDICAL_MODULE_ARCHITECTURE.md` (v1.0, decisions M1–M8
pending approval) and `architecture/M1_ACTIVATION_RUNBOOK.md` for the
first activation. Not yet built; the ADR is the record that the gap is
chosen-into, not overlooked.

## Deployment

See `overview.md` for the tier split. Runbooks: `runbooks/`.
