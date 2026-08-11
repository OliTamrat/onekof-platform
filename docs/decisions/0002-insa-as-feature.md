# ADR-0002 — INSA certification is a product feature, not a checkbox

**Status:** accepted · **Date:** 2026-07-03 (certified; ~Jan 2027 expiry)

## Context
Selling to Ethiopian institutions requires INSA security certification —
and competitors treat it as paperwork.

## Decision
The P1–P6 security controls are implemented in code and the
certification is maintained as a live asset with an expiry to track.
Security docs live in `docs/security/`.

## Consequences
Six-month validity means recertification is an operational rhythm, not a
one-off. The certification experience is reused across the fleet
(bank-assist's pitch leads with it).
