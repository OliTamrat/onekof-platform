# ADR-0005 — No vocabulary without destinations

**Status:** accepted · **Date:** 2026-07-28

## Context
The medical gap's root cause, named so it cannot repeat: presets enabled
`medical` + `compliance` switches, onboarding promised the features, and
the sidebar sections behind them did not exist. Correct gating,
convincing vocabulary, no destinations — the worst combination, because
it demos as done.

## Decision
A preset may only enable a section that exists and leads to a real
surface. Adding the word to onboarding or a preset without the surface
behind it is a regression, whatever the roadmap says.

## Consequences
`PRODUCT_SURFACE_AUDIT.md` is the periodic check that promises and
surfaces still match; the medical module (ADR-0004) is the debt being
repaid under this rule.
