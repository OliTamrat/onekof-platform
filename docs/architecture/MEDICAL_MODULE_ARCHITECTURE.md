# Medical Module Architecture — Healthcare Operations for Onekof

> **Status: v1.0 — PROPOSED (awaiting founder approval of Decisions M1–M8)**
> Author: Oli Tamrat, CTO — DAPS Analytics PLC
> Method follows `SPRINT_AND_SETTINGS_ARCHITECTURE.md` and `DEPARTMENT_WORKSTREAMS_ARCHITECTURE.md`: decisions stated explicitly, approved before building, phased with a dark launch first.

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

### M5 — Data residency: the Medical module requires the sovereign deployment

The cloud tier (Vercel + Supabase) stores data outside Ethiopia. Patient data plausibly falls under in-country data-residency expectations for Ethiopian health institutions, and this should be treated as a hard constraint until counsel says otherwise.

**Therefore:** the Medical module is **available only on Tier 2 (Ethio Telecom ECS, INSA-certified) deployments.** On the cloud tier, the Healthcare edition presents everything except the patient registry, and the Customization page explains why rather than hiding the option silently.

This is the decision most likely to be argued with, and it is the one I am most confident about. It is far cheaper to gate this now than to explain a cross-border patient-data incident later.

### M6 — Retention and erasure are real, not soft-deletes

Tasks are soft-deleted and recoverable — correct for work items, wrong for patient data. Patients get:
- A defined retention period per organization (default: configurable, no silent forever),
- A genuine **hard-delete path** that removes identifiers and leaves an anonymized shell so historical care items keep their statistics without naming anybody,
- Deletion recorded in the audit log (who, when, authority).

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
| **M0 — Honesty first** | Onboarding stops promising unbuilt capability; presets stop enabling destination-less sections; Customization explains the Tier 2 requirement for patient features. Ships immediately, independent of the rest. | No |
| **M1 — Registry dark launch** | `Patient` model + encrypted fields + blind index; `patientAccess` ladder; `PATIENT_VIEWED`/`PATIENT_*` audit types; API with access gates; idempotent migration. **Zero UI.** | Yes |
| **M2 — Care coordination** | `Task.patientId`, patient-scoped task views, care-team assignment, redaction for members without access. | Yes (single nullable column) |
| **M3 — Surfacing** | Medical section added to the sidebar (the gap found in testing), patient list/detail, referral tracking; i18n ×5; Tier 2 gate enforced in UI. | No |
| **M4 — Facility operations** | Operations catalog gains facility/equipment/safety workstreams; maintenance scheduling on the existing recurring-work path. | No |
| **M5 — Documentation** | Healthcare support guide in the Wave-3 template; Industry Editions reference updated; INSA/regulatory review pack. | No |

**Gate between M0 and M1:** M1 must not start until (a) counsel or the compliance adviser confirms the residency position in M5, and (b) the retention default in M6 is chosen by the founder. Building a patient registry before those answers is how avoidable regulatory debt is created.

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
