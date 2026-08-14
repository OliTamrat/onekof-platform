-- Per-entry time logging, and a delivery-health dimension for projects.
--
-- WHY WORK_LOGS
-- Effort was recorded only as tasks.time_spent: one cumulative integer per
-- task. It could not answer who worked, on which day, or for how long, so it
-- supported no effort report and no audit. Worse, nothing in the product ever
-- wrote to it — the column existed and every dashboard reading it showed a
-- number that never moved.
--
-- Minutes, not hours: the old column was hours as an integer, so any entry
-- under an hour truncated to zero and vanished. Storage is now exact and the
-- presentation layer converts.
--
-- tasks.time_spent is KEPT and becomes a cached sum of the entries, so board
-- and list queries stay a single row read instead of an aggregate per task.
-- The application maintains it inside the same transaction that writes a log.
--
-- WHY PROJECT HEALTH
-- projects.status is lifecycle — ACTIVE / ARCHIVED / ON_HOLD. A leadership
-- rollup needs delivery health, which is a different question and had nowhere
-- to live. health_override is nullable on purpose: NULL means the value is
-- derived from schedule and task data, so the rollup is populated on day one
-- without anyone filling in a form. A non-null value is a deliberate call by
-- the project lead and is recorded with who set it and why.
--
-- SAFETY: entirely additive. New table, new nullable columns, no existing
-- column altered or dropped, no data rewritten. Deploys cleanly ahead of the
-- application code that uses it.

CREATE TYPE "public"."ProjectHealth" AS ENUM (
  'ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'BLOCKED', 'NOT_STARTED', 'COMPLETE'
);

CREATE TABLE "public"."work_logs" (
  "id"          TEXT NOT NULL,
  "task_id"     TEXT NOT NULL,
  "user_id"     TEXT NOT NULL,
  "minutes"     INTEGER NOT NULL,
  "worked_on"   DATE NOT NULL,
  "description" TEXT,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3) NOT NULL,
  "deleted_at"  TIMESTAMP(3),
  CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_logs_task_id_deleted_at_idx"  ON "public"."work_logs"("task_id", "deleted_at");
CREATE INDEX "work_logs_user_id_worked_on_idx"   ON "public"."work_logs"("user_id", "worked_on");
CREATE INDEX "work_logs_worked_on_idx"           ON "public"."work_logs"("worked_on");

-- Cascade on task deletion: a time entry has no meaning without its task.
ALTER TABLE "public"."work_logs"
  ADD CONSTRAINT "work_logs_task_id_fkey" FOREIGN KEY ("task_id")
  REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RESTRICT on the user: deleting someone must not silently erase the effort
-- history their team's reports are built on.
ALTER TABLE "public"."work_logs"
  ADD CONSTRAINT "work_logs_user_id_fkey" FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."projects"
  ADD COLUMN "health_override"        "public"."ProjectHealth",
  ADD COLUMN "health_override_reason" TEXT,
  ADD COLUMN "health_override_by"     TEXT,
  ADD COLUMN "health_override_at"     TIMESTAMP(3);
