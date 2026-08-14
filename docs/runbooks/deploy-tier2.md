# Deploy — Tier 2 (Ethio Telecom Cloud)

**Status: approved, pending VM order** (ADR-0001). The full migration
plan — from Vercel + Supabase to Ethio Telecom VMs, satisfying data
residency requirements — is `deployment/ETHIO_TELECOM_MIGRATION_PLAN.md`.
Pricing and scenario brief: `deployment/ETHIO_TELECOM_CLOUD_PRICING_BRIEFING.md`.
VM request template: `deployment/ETHIO_TELECOM_VM_REQUEST.html`.

The platform ships as one Docker image for both tiers — nothing here is
a separate build.

INSA certification (ADR-0002) is time-bound: certified 2026-07-03, valid
6 months, ~January 2027 expiry. Recertification is an operational
rhythm to track, not a one-off.
