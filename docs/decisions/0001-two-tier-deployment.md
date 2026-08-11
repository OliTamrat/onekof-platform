# ADR-0001 — Two-tier deployment: Vercel for reach, ECS for sovereignty

**Status:** accepted · **Date:** 2026 (Tier 2 approved; VM order pending)

## Context
Ethiopian government and institutional customers face data-sovereignty
expectations (and Proclamation 1321/2024 pressure) that a US-hosted SaaS
cannot meet; the global product still needs Vercel-class iteration speed.

## Decision
Tier 3 lives on Vercel + Supabase (onekof.com and org subdomains);
Tier 2 deploys the same Docker image (`ghcr.io/olitamrat/onekof-web`) to
Ethio Telecom ECS via `deploy-et.sh` (online + offline modes). Staging
stays on Vercel — free, and no sovereignty impact.

## Consequences
Everything ships as one image; a feature that cannot run in the ECS
environment is a regression. The ECS pricing/config brief lives in
`deployment/ETHIO_TELECOM_CLOUD_PRICING_BRIEFING.html`. This deployment
path is also the fleet's Ethiopia playbook (bank-assist leans on it).
