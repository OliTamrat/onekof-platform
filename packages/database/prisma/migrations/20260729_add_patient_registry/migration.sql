-- M1 — Patient registry (dark launch, zero UI).
--
-- Onekof holds healthcare OPERATIONS, not an Electronic Medical Record.
-- There is deliberately no column here for diagnoses, prescriptions,
-- laboratory or imaging results, or clinical notes.
-- See docs/architecture/MEDICAL_MODULE_ARCHITECTURE.md (M1).
--
-- Hand-authored and idempotent, per the project convention: safe to apply
-- twice, every object "public"-qualified, enum values added with
-- IF NOT EXISTS.

-- ---------------------------------------------------------------------------
-- Patient access ladder (M3)
--
-- Separate from OrgRole on purpose. Holding OWNER in an organization does not
-- confer patient access — running the institution is not a clinical reason to
-- read someone's record. Granting this is an explicit, audited act.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'PatientAccess' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "public"."PatientAccess" AS ENUM (
      'NO_ACCESS', 'LIMITED', 'FULL', 'MANAGE'
    );
  END IF;
END
$$;

ALTER TABLE "public"."organization_members"
  ADD COLUMN IF NOT EXISTS "patient_access" "public"."PatientAccess"
  NOT NULL DEFAULT 'NO_ACCESS';

-- ---------------------------------------------------------------------------
-- Patient registry
--
-- identifier_encrypted : ciphertext, random IV, never queried directly
-- identifier_index     : keyed HMAC of the normalised identifier; this is what
--                        lookup matches on, so plaintext is never decrypted
--                        merely to find someone
-- birth_year           : year only. Enough to tell two same-named people
--                        apart, far less identifying than a full date.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "public"."patients" (
  "id"                     TEXT PRIMARY KEY,
  "organization_id"        TEXT NOT NULL,
  "identifier_encrypted"   TEXT,
  "identifier_index"       TEXT,
  "display_name_encrypted" TEXT,
  "birth_year"             INTEGER,
  "last_activity_at"       TIMESTAMP(3),
  "retention_months"       INTEGER NOT NULL DEFAULT 12,
  "erased_at"              TIMESTAMP(3),
  "erased_by"              TEXT,
  "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by"             TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'patients_organization_id_fkey'
  ) THEN
    ALTER TABLE "public"."patients"
      ADD CONSTRAINT "patients_organization_id_fkey"
      FOREIGN KEY ("organization_id")
      REFERENCES "public"."organizations"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- One person registered twice in the same organization is a data-quality
-- error, not two patients. Partial index so that anonymised shells — which
-- have had their identifier removed by erasure (M6) — do not collide on NULL.
CREATE UNIQUE INDEX IF NOT EXISTS "patients_organization_id_identifier_index_key"
  ON "public"."patients" ("organization_id", "identifier_index")
  WHERE "identifier_index" IS NOT NULL;

-- Retention sweep: find patients whose last care activity fell due.
CREATE INDEX IF NOT EXISTS "patients_organization_id_last_activity_at_idx"
  ON "public"."patients" ("organization_id", "last_activity_at");

-- Separating live records from anonymised shells.
CREATE INDEX IF NOT EXISTS "patients_organization_id_erased_at_idx"
  ON "public"."patients" ("organization_id", "erased_at");
