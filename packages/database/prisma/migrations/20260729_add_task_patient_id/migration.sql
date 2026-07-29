-- M2 — care coordination. A task carrying a patient_id is a care item.
--
-- One nullable column and an index. Deliberately NOT a separate CareItem
-- table: care work inherits the board, statuses, workflow enforcement,
-- sprints, assignment, comments, watchers, activity history and reporting
-- for free. A parallel model would duplicate that whole surface and then
-- drift from it.
--
-- Hand-authored and idempotent per project convention.

ALTER TABLE "public"."tasks"
  ADD COLUMN IF NOT EXISTS "patient_id" TEXT;

-- ON DELETE SET NULL, never CASCADE.
--
-- M6 erasure removes a patient's identifiers and keeps an anonymised shell so
-- operational statistics survive. If this cascaded, erasing a patient would
-- also delete the ward's work record — destroying the institution's own
-- history in the name of protecting the individual's. The care item must
-- outlive the person's identifiers and simply stop pointing at anybody.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_patient_id_fkey'
  ) THEN
    ALTER TABLE "public"."tasks"
      ADD CONSTRAINT "tasks_patient_id_fkey"
      FOREIGN KEY ("patient_id")
      REFERENCES "public"."patients"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- Care items for a patient. Partial: the overwhelming majority of tasks carry
-- no patient at all, and indexing those rows would be pure overhead on every
-- ordinary issue write.
CREATE INDEX IF NOT EXISTS "tasks_patient_id_idx"
  ON "public"."tasks" ("patient_id")
  WHERE "patient_id" IS NOT NULL;
