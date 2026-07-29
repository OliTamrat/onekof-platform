# Medical Module Architecture — Healthcare Operations for Onekof

> **Status: v1.1 — PROPOSED (awaiting founder approval of Decisions M1–M8)**
> Author: Oli Tamrat, CTO — DAPS Analytics PLC
> Method follows `SPRINT_AND_SETTINGS_ARCHITECTURE.md` and `DEPARTMENT_WORKSTREAMS_ARCHITECTURE.md`: decisions stated explicitly, approved before building, phased with a dark launch first.
>
> **v1.1 changes.** M5 rewritten against the actual statute (Personal Data Protection Proclamation No. 1321/2024) instead of a hedge; the tier numbering in v1.0 was inverted and is corrected; M5a added, recording that the residency finding is platform-wide rather than Medical-specific; M6 now recommends a specific retention default with its reasoning. The residency gate is implemented in `lib/compliance/residency.ts`. **Legal citations are research, not a legal opinion — M5 still needs counsel sign-off, which is what `docs/business/ONEKOF_DATA_RESIDENCY_COUNSEL_BRIEF.docx` exists to obtain.**

---

## 1. Why this document exists

The Healthcare edition currently **promises more than the platform delivers**. Onboarding tells a new hospital it has enabled "Facility management, Medical projects, Compliance tracking, Resource allocation." In reality `/dashboard/medical`, `/dashboard/patients`, `/dashboard/facilities`, `/dashboard/equipment` and `/dashboard/safety` are placeholder pages — a title, a description and an empty state whose button redirects to generic issue creation. The Healthcare preset also enables `medical` and `compliance` sections that **do not exist in the sidebar navigation at all**, so the switches do nothing.

Two responses were possible: withdraw the promise, or build the module properly. **The founder chose to build it properly**, with the same design-doc discipline as Sprints. This document is that design.

**Immediate honesty fix (not dependent on approval):** until Phase M3 ships UI, the onboarding summary must stop advertising capabilities that do not exist, and presets must not enable sections with no destination. That correction is Phase M0 below and should ship regardless of what happens to the rest of this plan.

---

## 2. The decision that shapes everything else

### M1 — Onekof builds healthcare **operations**, NOT an Electronic Medical Record. This boundary is architectural, not a matter of taste.

**In scope** — coordination of work *around* patients:
- A patient registry sufficient to identify who care is being coordinated for
- Care-coordination items (admissions logistics, follow-up scheduling, referral progress, discharge tasks) linked to a patient
- Referral tracking between facilities
- Facility, equipment and safety operations (maintenance schedules, inspections, incident follow-up)
- Clinical **research** project management (protocols as documents, study tasks — the Research department already exists)
- Accreditation and compliance tracking

**Explicitly out of scope — permanent non-goals:**
- Diagnoses, ICD coding, problem lists
- Prescriptions, medication administration records, drug interaction checking
- Lab or imaging results, vitals, clinical notes
- Anything that constitutes a legal medical record or influences a clinical decision

**Why this line, and why it is not negotiable later:** the moment the platform stores clinical findings or influences treatment decisions, it moves from "business software used by a hospital" into the regulated space of health information systems — engaging Ethiopian health-sector regulation, the standards INSA certification would be measured against, and (for any international deployment) HIPAA-class obligations and potential medical-device software classification. That is a different company, a different certification path, and a different liability profile. A PM platform can serve hospitals extremely well without crossing it. **Every later feature request must be tested against this boundary**, and the answer to "can we just add lab results?" is no, not without a board-level decision to become a different kind of company.

---

## 3. Data protection decisions

### M2 — Patient identifiers are encrypted at rest, and the patient record is minimal by construction

```prisma
model Patient {
  id             String  @id @default(cuid())
  organizationId String  @map("organization_id")

  // Facility's own identifier — the join key to their real health system.
  // Encrypted; unique per organization via a separate blind index.
  medicalRecordNumber String @map("medical_record_number")
  mrnIndex            String @map("mrn_index") // HMAC for lookup/uniqueness

  // Minimum viable identity for coordination. Encrypted at rest.
  fullName    String
  phone       String?

  // Non-identifying operational fields, plaintext (needed for filters)
  status      PatientStatus @default(ACTIVE)
  facilityId  String?       @map("facility_id")

  createdAt DateTime @default(now())
  deletedAt DateTime?

  @@unique([organizationId, mrnIndex])
  @@index([organizationId, status])
}
```

- Encryption reuses the existing `encryptField`/`decryptField` utilities already used for audit-log IP addresses — no new crypto.
- **No date of birth, no national ID, no address, no next-of-kin** in v1. Each of those must be justified by a named feature before it is added; "we might need it" is not a justification for holding identifying health-adjacent data.
- Search works through the blind index (HMAC of the MRN), never by scanning decrypted names.

### M3 — Patient access is its own ladder, independent of organization role

Following the proven `budgetAccess` pattern (money already works this way, and clinical access is stricter than money):

```
NO_ACCESS (default) < VIEW_LIMITED < VIEW_FULL < MANAGE
```

- **Every member starts at NO_ACCESS** — including organization Owners and Admins. Unlike budget access, admin role does **not** imply patient access. A ministry IT administrator has no business reading patient identities, and the system should make that structurally true rather than policy-true.
- `VIEW_LIMITED` sees the MRN and care items but not name/phone — enough to do logistics work without identity exposure.
- Granting patient access is itself an audited, Owner-only action.

### M4 — Patient record **reads** are audited, not just writes

Every other entity in Onekof audits mutations. Patient data inverts the default: **viewing a patient record writes an audit entry** (`PATIENT_VIEWED`), because "who looked at this record and when" is the question every health-data investigation actually asks. Write actions are audited as today.

This is deliberately expensive (a row per view). Mitigation: entries are batched per session per patient within a short window rather than per render, and the volume is bounded by the small number of people who will ever hold patient access.

### M5 — Data residency: the Medical module requires an in-country deployment

**v1.1 — this decision was researched after v1.0 and materially strengthened. The v1.0 text said patient data "plausibly falls under in-country data-residency expectations." That hedge was unnecessary: Ethiopia has an explicit statutory localisation requirement.**

**Personal Data Protection Proclamation No. 1321/2024** — passed 4 April 2024, published in the Federal Negarit Gazette and in force 24 July 2024:

- **Art. 22 (data sovereignty)** requires a data controller or processor to store personal data collected or obtained in Ethiopia on **a server or data centre located in Ethiopia**. The Ethiopian Communications Authority (ECA) may further designate categories of "critical personal data" that may *only* be processed in-country.
- **Health data is sensitive personal data.** Processing of sensitive personal data is prohibited except on enumerated grounds (consent, legal obligation, and similar).
- **Cross-border transfer of sensitive personal data requires prior ECA approval.** General transfers additionally require an adequacy assessment, appropriate safeguards, or explicit informed consent.
- The **ECA** is the supervisory authority.

**First, a correction to the tier numbering used in v1.0 of this document.** v1.0 called the cloud tier "Tier 1" and the sovereign deployment "Tier 2." That is inverted. The numbering published to customers in the privacy policy (`/privacy`, section 3) and used in `lib/env/runtime.ts` is:

| Tier | Infrastructure | In Ethiopia? |
|---|---|---|
| **Tier 1** | EthioTelecom Cloud — government tenants | Yes |
| **Tier 2** | On-premise / DAPS-managed Ethiopian server | Yes |
| **Tier 3** | Vercel (Frankfurt) + Supabase (EU) — today's default production | **No** |

Tier 1 is the *most* sovereign tier, not the least. Publishing one numbering to customers and using the opposite internally is how a compliance statement becomes untrue by accident, so this document now follows the published numbering, and `lib/compliance/residency.ts` encodes it with a test that fails if the ordering is ever inverted again.

**Therefore:** the Medical module is **available only on Tier 1 and Tier 2 deployments.** On Tier 3 the Healthcare edition presents everything except the patient registry, and the interface explains why rather than hiding the option silently. The gate is a single function, `canStorePatientData()`, so that when counsel confirms or revises this position exactly one place changes.

This remains the decision I am most confident about, and it is now confident for a cited reason rather than a cautious one.

### M5a — The residency finding is larger than the Medical module

Art. 22 is **not health-specific.** It covers personal data collected in Ethiopia, full stop. Onekof's Tier 3 production today stores the names, email addresses and activity of Ethiopian users of every edition — government, NGO, education, construction and business — on infrastructure in Frankfurt and the EU.

So the exposure is not created by the Medical module. The Medical module is where we happened to notice it. Gating patient data to Tier 1/2 is necessary but **not sufficient** for the platform's overall position under Art. 22.

I am not counsel and this is not a legal opinion. The question that decides how big this is:

> Does Art. 22 require that locally-collected personal data be stored **exclusively** in Ethiopia, or that it be stored in Ethiopia **with** a copy permitted abroad under the cross-border transfer rules?

- If **exclusively**: every Ethiopian tenant needs Tier 1/2, and Tier 3 becomes demo-and-diaspora only. That is a significant infrastructure commitment.
- If **in-country plus regulated transfer**: Tier 3 can continue for non-sensitive data with safeguards in place, and only patient data needs the hard gate.

Two things bound the urgency without changing the correctness. Enforcement is currently immature — a year after entry into force the ECA was still building capacity and had directives pending — so the realistic risk today is lower than the statute implies. And Onekof has **no real customers and no real patient data yet**, which is precisely the cheap moment to get this right. Both point the same way: settle the position now, before there is data to migrate.

This is tracked as an open platform decision, not a Medical one, and it should not block the Medical phases.

### M6 — Retention and erasure are real, not soft-deletes

Tasks are soft-deleted and recoverable — correct for work items, wrong for patient data. Patients get:
- A defined retention period per organization,
- A genuine **hard-delete path** that removes identifiers and leaves an anonymized shell so historical care items keep their statistics without naming anybody,
- Deletion recorded in the audit log (who, when, authority).

**v1.1 — the default is now recommended rather than left open: 24 months after the last linked care item closes.**

The Proclamation sets a *storage limitation* principle — personal data kept no longer than necessary for the purpose, then securely deleted or anonymised — but no fixed number. So the number has to be argued from what Onekof actually is.

**The argument follows directly from M1.** Onekof is healthcare *operations*, explicitly **not** the medical record. The statutory duty to retain a patient's clinical record for many years belongs to the health facility and its EMR or paper archive. Onekof holds care-coordination work items that reference a patient — not the record itself.

That inverts the usual instinct. The reflex is "medical data, retain for a decade." The correct answer here is the opposite: **a long default would quietly turn Onekof into an unmanaged parallel patient archive** — accumulating identifiers it has no clinical reason to hold, in a system nobody designated as the record, with all of the liability and none of the benefit. Short retention is not carelessness; it is the direct consequence of the scope boundary.

**24 months** covers a care episode plus follow-up and a quality-review or audit cycle, and expires well before the data becomes an archive by default. Organizations may configure within a bounded range (6–84 months). **"Forever" is not an option** — not as a default and not as a setting.

**Minors are deliberately not special-cased.** The retain-until-majority rule is a *medical record* rule. Applying it here would assert that Onekof is the record, contradicting M1. Flagged for counsel rather than decided quietly.

**The audit log is exempt from patient retention.** Access records must outlive the patient record — purging them alongside would destroy exactly the evidence of who accessed what that M4 exists to create. This is safe because audit rows reference a patient by id and never carry identifiers, so an expired patient's audit trail is already anonymous.

---

## 4. How it reuses what already exists

### M7 — Care items are Tasks, not a parallel work system

Care coordination items are ordinary issues carrying `department: 'medical'` (the classification architecture already shipped) plus a nullable `patientId`. This means care work inherits — for free — the board, statuses, workflow enforcement, sprints, assignment, comments, watchers, activity history, notifications and reporting.

```prisma
model Task {
  // ...existing
  patientId String? @map("patient_id")   // medical department only
  @@index([patientId])
}
```

A task with a `patientId` is visible only to members with patient access; to everyone else it appears with the patient reference withheld. **Rejected alternative:** a separate `CareItem` model. It would duplicate the entire work-management surface and immediately diverge from it — the same mistake the label-based department classification made, which we just spent a day undoing.

### M8 — Facilities, equipment and safety are Operations workstreams, not new departments

The Operations department already exists with Incidents / Monitoring / Checklists. Facility maintenance, equipment servicing and safety inspections are added as **workstreams within Operations** (catalog extension, zero schema change — this is exactly the extensibility D1 was designed for), rather than as separate top-level sections. This delivers the onboarding's "Facility management" promise using machinery that already works.

---

## 5. Phases

| Phase | Scope | Migration? |
|---|---|---|
| **M0 — Honesty first** | Onboarding stops promising unbuilt capability; presets stop enabling destination-less sections. Ships immediately, independent of the rest. **Shipped** in #174 — with one part outstanding, see below. | No |
| **M0a — Residency plumbing** | `lib/compliance/residency.ts`: deployment tier as a value the code can read, `isDataResidentInEthiopia()`, and the `canStorePatientData()` gate. Decision-independent — correct under any reading of Art. 22. **Shipped**, then corrected — see below. | No |
| **M1 — Registry dark launch** | `Patient` model + encrypted fields + blind index; `patientAccess` ladder; `PATIENT_VIEWED`/`PATIENT_*` audit types; API with access gates; idempotent migration. **Zero UI.** | Yes |
| **M2 — Care coordination** | `Task.patientId`, patient-scoped task views, care-team assignment, redaction for members without access. | Yes (single nullable column) |
| **M3 — Surfacing** | Medical section added to the sidebar (the gap found in testing), patient list/detail, referral tracking; i18n ×5; residency gate enforced in UI (Tier 1/2 only). | No |
| **M4 — Facility operations** | Operations catalog gains facility/equipment/safety workstreams. **Shipped** — see note below. Maintenance scheduling remains outstanding and is larger than v1.0 assumed. | No |
| **M5 — Documentation** | Healthcare support guide in the Wave-3 template; Industry Editions reference updated; INSA/regulatory review pack. | No |

**M4 shipped ahead of M1–M3, deliberately.** The phases were numbered in narrative order, but M4 touches **no patient data at all** — it is pure Operations vocabulary. It is therefore not behind the counsel gate, and holding it back would have meant waiting on a legal answer for work the answer cannot affect. `equipment`, `facility` and `safety` are now Operations workstreams (catalog extension, zero schema change — exactly the D1 extensibility argument), with three real pages on the existing `DepartmentTaskList` pattern, sidebar entries, and labels in all five locales reused from the retired placeholders.

The old `/dashboard/facilities`, `/equipment` and `/safety` pages are now redirects. Worth recording why they were bad: each rendered **outside `AppLayout`**, so it had no sidebar and no way back — the same orphaning defect found earlier on the Customization page. That is now three occurrences of the same class, and it suggests a route-level guard is worth more than another one-off fix.

**Correction to M0a — the gate would have failed closed on the deployment it exists to permit.** `canStorePatientData()` resolves the tier from `APP_PLATFORM` / `APP_REGION` / `APP_DEPLOYMENT_TIER`. `docker-compose.tier-sim.yml` sets those; **`docker-compose.prod.yml` — the actual Ethio Telecom deployment — did not.** With `APP_PLATFORM` unset the runtime reports `local`, which resolves to Tier 3, which refuses patient data.

So the local simulation would have permitted patient features and the real sovereign, in-country deployment would have refused them. That is precisely the pass-in-testing / fail-in-production shape the deliberate local-dev Tier 3 default was meant to prevent, arrived at by a different route — the gate was right, its inputs were never declared where it mattered.

Deployment identity is now declared explicitly in `docker-compose.prod.yml` rather than left to the untracked `.env.production` on the VM, with `APP_REGION` using an `etc-` prefix for EthioTelecom Cloud (Tier 1) and anything else meaning on-premise (Tier 2). A test asserts the production compose file declares a tier and that its default is 1 or 2 — the failure is otherwise invisible until a hospital tries to use the feature.

**Correction to v1.0's M4 scope.** v1.0 said maintenance scheduling would ride "the existing recurring-work path." There is no such path. Tasks have no recurrence: the only recurrence in the codebase is the automations *Schedule trigger* (which is plan-gated to Pro/Enterprise) and billing intervals. So recurring preventive maintenance — the thing a hospital biomedical department or a contractor's plant manager actually wants — is **net-new work**, not a wiring exercise. Sized honestly it is its own phase, and it is a general platform capability (recurring tasks) rather than a healthcare feature. Recorded here so nobody plans M4's remainder as an afternoon.

**M4 also serves Construction, not only Healthcare.** The edition audit found Construction promised sites, equipment, safety and progress photos — four of four unbuilt. Equipment and safety are now real for that sector too, from the same change.

**Open question, not guessed at:** Construction says "sites" where Healthcare says "facilities". A construction site and a hospital wing are arguably the same workstream wearing different vocabulary, and the terminology layer (AGILE/FORMAL) is precedent for industry-specific wording. But inventing a fourth `site` workstream, or silently telling a contractor their sites are "facilities", are both decisions rather than obvious calls. Left open; the onboarding text no longer promises "sites", so there is no honesty debt while it waits.

**Outstanding from M0.** M0 as written also promised that the Customization page would *explain* the residency requirement for patient features. That part did not ship in #174 — the page carries only a code comment for developers, with nothing user-facing. It is deliberately still outstanding: an explanation naming a tier requirement is a compliance statement to customers, and writing one before counsel confirms M5 risks publishing a claim we would then have to retract. It ships with M3, when the gate becomes visible in the UI, or sooner if counsel confirms first.

**Gate between M0 and M1 — current state:**

| Gate condition | Status |
|---|---|
| (a) Counsel confirms the residency position in M5 | **Open.** Research done and cited; the brief in `docs/business/ONEKOF_DATA_RESIDENCY_COUNSEL_BRIEF.docx` reduces this to a yes/no on four specific questions. |
| (b) Founder chooses the retention default in M6 | **Open, but now a decision rather than a blank.** Recommendation: 24 months, bounded 6–84, no "forever". Needs a yes or a different number. |

M1 must not start until both close. Building a patient registry before those answers is how avoidable regulatory debt is created — and unlike most of this plan, that debt would be attached to real patients.

---

## 6. Non-goals (restated for the record)

- Not an EMR (M1). Not a billing/claims system. Not appointment scheduling for patients directly (no patient-facing login in v1). Not telemedicine — Hakimet is the separate platform for that, and this module must not duplicate it.
- No patient-facing accounts in v1. Every user is staff.

---

## 7. Testing

- Pure unit tests for the blind-index derivation and redaction rules (what `VIEW_LIMITED` may and may not see).
- Access-matrix tests: every role × every access level × every endpoint, asserting that org Owner without patient access is refused (the counter-intuitive rule most likely to be broken by a future change).
- Audit tests: a read produces exactly one audit entry per session-window; a write produces both.
- Migration double-apply on scratch Postgres, as with every migration in this project.
- Residency test: with the Tier 2 flag off, patient endpoints return a clear, documented refusal rather than data.
