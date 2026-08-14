# ADR-0003 — Departments and workstreams as the organizing architecture

**Status:** accepted · **Date:** 2026-07 (D1–D9, PRs #161–#171)

## Context
Orgs of different verticals need different surfaces from one product
without forking it.

## Decision
Department & Workstream architecture (D1–D9):
`architecture/DEPARTMENT_WORKSTREAMS_ARCHITECTURE.md` is the design
document; sidebar editions and per-vertical presets gate what each org
sees.

## Consequences
Vertical presets are configuration over a stable core — but every switch
a preset enables must lead somewhere real (ADR-0005 records the failure
that taught this).
