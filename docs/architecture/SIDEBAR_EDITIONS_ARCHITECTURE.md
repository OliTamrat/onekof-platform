# Sidebar Editions Architecture — Per-Organization-Type Navigation

> **Status: v1.0 — PROPOSED (awaiting founder approval of Decisions S1–S9)**
> Author: Oli Tamrat, CTO — DAPS Analytics PLC
> Method follows `SPRINT_AND_SETTINGS_ARCHITECTURE.md`, `DEPARTMENT_WORKSTREAMS_ARCHITECTURE.md` and `MEDICAL_MODULE_ARCHITECTURE.md`: decisions stated explicitly, approved before building, phased.

---

## 1. Why this document exists

The product position is that **every organization gets a sidebar shaped to its sector** — education, health, government, business/startup, construction. That is the promise onboarding makes when it asks a new customer what kind of institution they are.

Today the platform does not deliver it, and the gap is not a bug to patch. It is a missing design. This document supplies the design so it can be built once, deliberately, rather than accreted one section at a time.

The immediate trigger was M3. The Medical module shipped with working pages, a working API and no sidebar entry — reachable only by typing the URL. That was fixed directly (PR #199). But fixing it exposed that the *mechanism* being patched was never designed to do what the product claims, so the next module will land in the same hole.

---

## 2. What exists today — findings, not impressions

### 2.1 There are two navigation systems. One is dead.

**System A — `lib/sidebar-navigation-dynamic.ts` (LIVE).**
One fixed structure of nine sections in one fixed order, identical for every organization on the platform:

```
Home · Projects · Teams · Budget · Development · Marketing · Operations · Medical · Research · Knowledge
```

Per-organization variation is achieved **only by deletion**: `resolveEnabledSections()` produces a set of enabled ids and sections not in the set are filtered out. Nothing is reordered, renamed, regrouped, or added.

**System B — `config/organization-types.ts` (DEAD).**
283 lines defining, for each of six org types, a navigation array with `priority` ordering and sector-specific entries — Procurement for government, Grants and Impact for NGOs, Courses for education, Sites for construction, Facilities and Resources for healthcare.

It is reached only through `getNavigationForType()`, whose only caller is `isNavigationItemVisible()`, which **has zero callers anywhere in the codebase.** Verified by full-tree grep. This is the design the product promise describes, and none of it runs.

### 2.2 The consequence, stated plainly

"Custom sidebar per organization type" currently means **a subset of one universal menu**. Here is what each preset actually enables:

| Preset | `enabledSections` |
|---|---|
| Ministry / Government | teams, budget, goals, projects, documents, docs, timeline, calendar, issues, analytics, operations, research |
| Construction | teams, budget, goals, projects, documents, docs, timeline, calendar, issues, analytics, operations, research |
| NGO | …same as Ministry, **+ marketing** |
| Healthcare | …same as Ministry, **+ medical** |
| Business / Startup | …**+ development, marketing, automations**, **− research** |
| Education | teams, budget, goals, projects, documents, docs, calendar, issues, timeline, research |

**Ministry and Construction are byte-identical.** A government ministry and a road contractor see exactly the same sidebar, in the same order, with the same labels, despite having separate presets and separate onboarding paths. Four of the six editions differ from the government baseline by one or two entries.

### 2.3 The sector-specific pages exist, and are honest placeholders

`/dashboard/procurement`, `/grants`, `/impact`, `/courses`, `/sites`, `/resources`, `/compliance` all exist and render a titled `EmptyState` that routes the user to issue creation. `/equipment`, `/safety`, `/facilities` are redirects into their real M4 homes under Operations.

These are the survivors of the fabricated-page cleanup: they promise nothing they do not do. **They are not reachable from the sidebar.** So the sector vocabulary the product speaks in onboarding exists as routes, exists as a dead config, and appears nowhere a customer can click.

### 2.4 The filter matches destinations by substring

Section membership is decided with `itemPath.includes('/budget')`, `.includes('/docs')`, and so on. It works today by luck of the current path set. It is a latent hazard: any new route whose path contains an existing token inherits that token's gate silently. `/dashboard/issues?department=medical` is currently gated on `issues` for this reason — correct by accident, not by intent.

---

## 3. What "custom sidebar" has to mean

A sector edition can vary along four independent axes. Today only the first exists.

| Axis | Meaning | Today |
|---|---|---|
| **1. Membership** | Which sections appear | ✅ works |
| **2. Order** | What sits at the top, where the eye lands first | ❌ fixed for all |
| **3. Vocabulary** | What things are called — "Beneficiaries" vs "Members", "Sites" vs "Projects" | ❌ fixed for all |
| **4. Composition** | Sector entries that exist only for that sector, and grouping | ❌ dead config |

Order and vocabulary are where a sector edition is actually *felt*. A hospital administrator opening Onekof should not have to scroll past Development and Marketing to reach Medical. A ministry's first item should be Budget, because public-fund accountability is the job. Membership alone cannot express that.

---

## 4. Decisions requiring approval

### S1 — One navigation source of truth. Delete System B.

Two systems where one is dead is worse than either alone: the dead one reads as authoritative and misleads whoever finds it first (it misled this work). `config/organization-types.ts` keeps `getOrganizationConfig`/`isFeatureEnabled`, which `useOrganizationFeatures` genuinely uses. Its `navigation` arrays and `getNavigationForType`/`isNavigationItemVisible` are deleted — **after** their sector vocabulary is migrated into the new edition definitions under S2.

**Rationale.** The information in System B is valuable; its implementation is not. Migrate the content, delete the mechanism.

### S2 — A sector edition is data, declared in one file, per org type.

Introduce `lib/navigation/editions.ts`. Each edition declares the four axes explicitly:

```ts
export const HEALTHCARE_EDITION: SidebarEdition = {
  id: 'healthcare',
  // Axis 2 — order. Sections not listed keep the base order, after these.
  lead: ['medical', 'operations', 'projects'],
  // Axis 3 — vocabulary. Overrides the base nameKey for this edition only.
  vocabulary: { 'sidebar.operations': 'sidebar.facilityOperations' },
  // Axis 4 — composition. Sector entries that exist ONLY here.
  extras: [{ section: 'medical', item: { nameKey: 'sidebar.resources', href: '/dashboard/resources' } }],
};
```

Membership (axis 1) stays where it is — in the industry presets — because it is already customer-editable from the Customization page, and moving it would break that. **Editions govern order, vocabulary and composition; presets govern membership.** That split is the core of this proposal and the thing to accept or reject.

### S3 — An edition may only reorder and rename what membership already granted.

An edition must never be able to add a section the preset did not enable, or resurrect one the customer disabled. Order is applied *after* filtering. This keeps the Customization page authoritative over what a customer can see, and keeps exactly one answer to "why is this visible?"

### S4 — Replace substring matching with an explicit gate on each entry.

Every section and sub-item declares `requires: 'budget'` (or `null`) as data. The `itemPath.includes(...)` ladder is deleted. A destination with no declared gate is a compile-time error, not a silent pass.

**Rationale.** §2.4. The current mechanism cannot be extended safely, and every sector entry added under S2 widens the hazard.

### S5 — The dead-switch invariant becomes structural, not a test.

Today `NAVIGABLE_SECTION_IDS` is a hand-maintained list, kept honest by a guard test. Under S2 the navigable set is *derived* from the edition definitions, so the list cannot drift. The guard test stays, but as a second line rather than the only one.

### S6 — Sector vocabulary ships as i18n keys in all five locales, or not at all.

Renaming a section for one sector means new keys in `en, am, om, ti, so`. An edition that renames into a key missing from a locale falls back to the base key rather than rendering a raw key string. A guard test enumerates every edition's vocabulary keys against every locale file.

### S7 — Onboarding must not promise a section the edition does not deliver.

The M0 honesty rule from the Medical doc, generalised: the onboarding summary text for each org type is generated from that type's resolved edition, not hand-written. It cannot drift from what the customer gets, because it is the same data.

### S8 — Sector landing pages are reachable or deleted. No third state.

`procurement`, `grants`, `impact`, `courses`, `sites`, `resources`, `compliance` are honest placeholders today but unreachable (§2.3). Each is either wired into its edition under S2, or removed. A route that exists and cannot be reached is a promise the product cannot keep and nobody can audit.

**Recommendation:** wire Procurement (government), Grants + Impact (NGO), Courses (education), Sites (construction). These are the concepts those sectors actually name. `compliance` and `resources` need a scope decision first — see Open Questions.

### S9 — Legacy fail-open is preserved.

An organization with neither settings nor an industry still receives every section, so navigation survives a settings-load failure. This is pre-existing and deliberate. It is safe because access is enforced server-side — the Medical pages gate on residency posture plus the patient access grant, not on whether a link renders. Editions do not change this.

---

## 5. Phasing

| Phase | Contents | Ships behind |
|---|---|---|
| **E1** | `editions.ts` + types + explicit `requires` gates (S2, S4). Base edition only — **no visible change**, pure refactor with tests proving the rendered output is identical for all six types. | — |
| **E2** | Order and vocabulary for all six editions (S2 axes 2–3, S6). First visible change. | i18n complete |
| **E3** | Sector entries wired; System B deleted (S1, S8). | S8 scope decision |
| **E4** | Onboarding summary generated from editions (S7). | E2 |

E1 shipping without visible change is deliberate: it makes the risky mechanical change auditable on its own, so E2's visible change has a clean diff.

---

## 6. Open questions for the founder

1. **`compliance` and `resources`** — real modules, or vocabulary for things that already exist? Compliance overlaps the audit-log work; Resources overlaps Teams and Budget. Building either as a page needs a scope decision first, and S8 is blocked on it.
2. **Per-customer order override.** Should a customer be able to reorder their own sidebar, or is order a sector property only? Customer override is more work and creates a second source of truth for axis 2. **Recommendation: sector-only for now** — no customer has asked, and it can be added later without redesign.
3. **Education is the thinnest edition** (no analytics, no operations). Is that intentional for Ethiopian schools and universities, or an oversight from when the preset was written?
4. **Construction vs Ministry being identical** (§2.2) — which sections should actually differ? This is the clearest evidence that membership alone cannot express a sector, and Construction is the best test case for whether S2 earns its keep.

---

## 7. What this document does not cover

Mobile navigation, the collapsed-rail icon treatment, and the project-scoped picker are unchanged by this proposal. Dashboard widgets per org type are a separate surface with their own config and are out of scope here.
