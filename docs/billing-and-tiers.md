# Billing & Subscription Tiers — Solution Plan

**Status:** Draft / planning — not yet implemented
**Date:** 2026-06-24
**Owner:** Oli Tamrat Oli
**Context:** Defines how organization tiers (Free / Starter / Professional / Enterprise) limit
usage, how tiers are differentiated, and how organizations are charged on a 30-day cycle.

> ⚠️ **Implementation is intentionally deferred / flag-gated while the INSA security review and
> certification are in progress.** See [§9 Reviewer-safety guardrails](#9-insa-reviewer-safety-guardrails).

---

## 1. Current-state assessment

### What exists today (scaffolding only)
- **Data model:** `Organization.plan` enum (`FREE | STARTER | PROFESSIONAL | ENTERPRISE`),
  `status` (`ACTIVE | TRIAL | SUSPENDED | CANCELLED`), and limit fields `maxMembers` (10),
  `maxProjects` (10), `maxStorage` (5 GB). Billing fields `billingEmail`, `subscriptionId`,
  `trialEndsAt`, `currentPeriodEnd` exist. A `features` JSON array + `OrganizationSettings`
  feature flags exist. (`packages/database/prisma/schema.prisma`)
- **UI:** Pricing modal shows Free / Standard / Premium at $0 / $5 / $10 per user/month
  (`components/pricing-modal.tsx`). Admin org page shows usage bars
  (`memberCount / maxMembers`). Support/FAQ page advertises Chapa (ETB), Stripe (USD), and
  net-30 enterprise invoicing (`app/support/route.ts`).

### What does NOT exist (the gaps)
1. **No usage enforcement.** Limit fields are stored and displayed only. Project-create
   (`api/projects/route.ts` POST) and member-invite paths never check them.
2. **No functional tier differentiation.** No plan-based feature gating (`requirePlan()` /
   `hasFeature()`); Enterprise vs Starter is currently just a label + manually-typed limit numbers.
3. **No billing system.** Pricing modal CTAs have no `onClick`. No Chapa/Stripe/checkout/billing
   pages or endpoints. **No cron jobs** — `trialEndsAt`/`currentPeriodEnd` are never read, so
   trials never expire and no one is ever charged.
4. **Naming mismatch.** Marketing (Free/Standard/Premium) ≠ DB enum (FREE/STARTER/PROFESSIONAL/ENTERPRISE).

**Summary:** the vocabulary (schema) and the marketing (UI/FAQ) exist; the enforcement and payment
machinery do not. Selecting "Enterprise" at onboarding today changes a label and nothing else.

---

## 2. Product decisions (locked)

| Decision | Choice |
|---|---|
| Pricing model | **Per-seat** ($/user/month) |
| Payment providers | **Both Chapa + Stripe**, but Chapa/Telebirr are **blocked on EthioTelecom approval + INSA certification** |
| Trial expiry | **3-day grace period**, then act |
| Limit enforcement | **Hard block** at plan limits |

---

## 3. Strategic sequencing (revenue-first, dependency-aware)

Because Chapa/Telebirr are gated on INSA cert + EthioTelecom approval, and the near-term paying
customers are Ethiopian **government / ministry tenants** (cf. `GOV_ETHIOTELECOM` / `PRIVATE_ONPREM`
hosting tiers and the `create-ministry-project` flow) who pay by **net-30 bank-transfer invoice, not
card**, the build order is inverted from the obvious one:

1. **Manual / invoice billing first** (Enterprise, net-30) — no provider dependency; unblocks
   government revenue immediately.
2. **Stripe (USD)** next — works today for international / card payers.
3. **Chapa / Telebirr** built behind a feature flag, **dormant until approval lands** — then flipped
   on with no rework.

All providers sit behind a single **provider-agnostic billing interface** so Chapa slots in as just
another adapter.

---

## 4. Tier matrix (draft — numbers to confirm)

| | **FREE** | **STARTER** ($5/seat) | **PROFESSIONAL** ($10/seat) | **ENTERPRISE** (custom, invoiced) |
|---|---|---|---|---|
| Members | 10 (hard cap) | unlimited | unlimited | unlimited |
| Projects | 10 | 50 | unlimited | unlimited |
| Storage | 5 GB | 50 GB | unlimited | custom |
| Features | basic PM, Eth calendar/lang, community support | + project/user permissions, advanced reporting, priority support | + AI task generation, advanced planning, advanced admin, 24/7 support | + SSO, gov/on-prem hosting tier, SLA, dedicated support |
| Payment | — | card (Stripe/Chapa) | card | net-30 invoice / bank transfer |

Enterprise maps onto the existing `HostingTier` enum (gov / on-prem) — a natural fit.

**Naming reconciliation:** map marketing → DB as Free→`FREE`, Standard→`STARTER`,
Premium→`PROFESSIONAL`, Enterprise→`ENTERPRISE`, and align the pricing modal labels accordingly.

---

## 5. Per-seat billing mechanics

- **Billable seat definition:** count `OrganizationMember` rows, **excluding `GUEST`** (to confirm).
- **Invoice amount:** `billable_seats × tier_price` per 30-day period.
- **Mid-cycle seat changes (MVP):** **true-up at renewal** (no mid-cycle proration) for simplicity;
  add proration later if needed.
- **Tax:** Ethiopian **VAT 15%** as an explicit invoice line; capture org VAT registration number
  ("Settings → Billing → Tax Information", already promised in the FAQ).

---

## 6. Implementation phases

### Phase 1 — Tier config + hard enforcement (no payments)
- `PLAN_CONFIG[plan] = { limits, features }` as the single source of truth; sync
  `maxMembers/maxProjects/maxStorage` from it on plan change (stop hand-typing limits in admin).
- `assertWithinLimit(org, 'projects' | 'members' | 'storage')` → returns **402/403 + upgrade
  prompt**, wired into project-create, member-invite/accept, and upload paths.
- `hasFeature(org, 'ai' | 'sso' | …)` gate on tier-locked features.
- Reconcile tier names; make pricing modal CTAs functional.
- **Guarded by** `BILLING_ENFORCEMENT_ENABLED` (default **false** in production until cert done).

### Phase 2 — Subscriptions + invoicing data model
- New models: `Subscription` (plan, seats, provider, periodStart/End, status),
  `Invoice` (amount, currency, VAT line, period, PDF, tax id), `PaymentMethod`.
- Add `taxId` / VAT registration to the org.
- Admin-generated **manual invoices** for Enterprise (net-30) — first real billing path.

### Phase 3 — The 30-day cycle (cron-driven state machine)
- **Net-new:** there are zero crons today. Add a daily Vercel cron (reuse existing `CRON_SECRET`).
- See [§7 state machine](#7-billing-cycle-state-machine).

### Phase 4 — Card providers
- Stripe (USD) checkout + webhooks → can go live now.
- Chapa/Telebirr adapter behind `BILLING_CHAPA_ENABLED` → **stays off until EthioTelecom approval +
  INSA cert**, then flip the flag.

---

## 7. Billing-cycle state machine

Daily cron evaluates each org:

```
TRIAL ──(trialEndsAt reached)──▶ GRACE (3 days, banners + emails)
GRACE ──(paid)──▶ ACTIVE
GRACE ──(still unpaid after 3 days)──▶ downgrade to FREE   ◀── recommended (keeps data; not hostile)

ACTIVE ──(currentPeriodEnd reached)──▶ charge seats×price
   success ─▶ extend currentPeriodEnd +30d, email VAT invoice
   failure ─▶ PAST_DUE ─(dunning retries d1/d3/d5)─▶ SUSPENDED
```

- Requires new `OrgStatus` values: **`PAST_DUE`**, and a grace marker (new status `GRACE` or a
  `graceEndsAt` field).
- Recommended post-grace action: **downgrade to FREE** (preserves data) rather than hard-suspend.

---

## 8. Hard-limit enforcement points

| Action | Endpoint | Check |
|---|---|---|
| Create project | `api/projects` POST | `count(projects) < maxProjects` |
| Invite / accept member | invitations flow | `count(members) < maxMembers` |
| Upload file | upload paths | `usedStorage < maxStorage` |
| Use tier-locked feature | per feature | `hasFeature(org, key)` |

On block: HTTP **402 Payment Required** (or 403) with a structured body
`{ error, limit, current, upgradeUrl }` so the UI can show an upgrade prompt.

---

## 9. INSA reviewer-safety guardrails

The billing work and the active INSA review are in tension. Enforcement could block or disrupt the
reviewer mid-review. Guardrails:

1. **Do not ship enforcement or the trial-expiry cron until after the INSA review/cert completes.**
   This costs no revenue — Chapa/Telebirr are already blocked on the same cert.
2. If built during the window, ship **behind feature flags, defaulted OFF** in production
   (`BILLING_ENFORCEMENT_ENABLED=false`; no cron registered) so it stays dormant.
3. **Exempt the reviewer's org:** Enterprise/unlimited limits and `trialEndsAt = null` (or a
   `reviewMode`/exempt flag) so no cron ever touches it.
4. **Safe to build anytime (no reviewer impact):** Phase 1 config/model scaffolding and manual
   Enterprise invoicing — these don't change tenant runtime behavior.

**Risk summary if shipped live during the review:**

| Task | Reviewer risk | Reason |
|---|---|---|
| Hard limit enforcement | ⚠️ Medium | 402/403 mid-review can be mis-logged as a bug |
| Trial expiry → grace → downgrade/suspend | 🔴 High | Could expire/suspend the reviewer's test org and cut access |
| Plan-based feature gating | ⚠️ Medium | May hide features the reviewer must evaluate |
| Stripe checkout / live CTAs | ⚠️ Low | Reviewer could enter a real payment flow |
| Schema migrations | ⚠️ Low | Deploy-time blips |
| Manual Enterprise invoicing | ✅ None | Admin-only |

> Note: tier enforcement applies to **org tenants**, not admin-panel users — so the reviewer's
> **admin access itself is unaffected**. Risk materializes only if the reviewer also tests the
> platform as a regular org user (creating orgs/projects), which a thorough reviewer likely will.

---

## 10. Open questions

1. **Seat counting:** include `GUEST` role in billable seats? (Recommend: exclude.)
2. **Proration:** mid-cycle seat changes prorated, or true-up at renewal? (Recommend: true-up for MVP.)
3. **Post-grace action:** downgrade to FREE (recommended) or hard-suspend?
4. **Tier matrix numbers:** confirm the project/storage caps in §4.

---

## 11. Out of scope (for now)
- Chapa/Telebirr go-live (blocked on EthioTelecom approval + INSA cert).
- Mid-cycle proration, annual billing, discounts/coupons, dunning email templates — later phases.
