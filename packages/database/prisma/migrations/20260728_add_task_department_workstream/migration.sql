-- Department & Workstream classification (Phase 1 dark launch, D1/D3).
-- Adds first-class classification columns to tasks and backfills them from
-- the legacy label stamps written by the department pages. Labels themselves
-- are NOT modified — from this migration on they are free-form user tags.
-- Idempotent: additive columns, IF NOT EXISTS everywhere, backfill only
-- touches rows still NULL, so double-apply is a no-op.

ALTER TABLE "public"."tasks"
  ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "public"."tasks"
  ADD COLUMN IF NOT EXISTS "workstream" TEXT;

CREATE INDEX IF NOT EXISTS "tasks_project_id_department_workstream_idx"
  ON "public"."tasks" ("project_id", "department", "workstream");

-- Classification changes are audited as activity events.
ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS 'TASK_DEPARTMENT_CHANGED';

-- ---------------------------------------------------------------------------
-- Backfill from legacy labels (labels is JSONB array of strings; the ?
-- operator tests string membership). Department statements run in catalog
-- order — a task carrying two department labels deterministically takes the
-- first match (development > marketing > operations > research).
-- ---------------------------------------------------------------------------

UPDATE "public"."tasks" SET "department" = 'development'
  WHERE "department" IS NULL AND "labels" ? 'development';
UPDATE "public"."tasks" SET "department" = 'marketing'
  WHERE "department" IS NULL AND "labels" ? 'marketing';
UPDATE "public"."tasks" SET "department" = 'operations'
  WHERE "department" IS NULL AND "labels" ? 'operations';
UPDATE "public"."tasks" SET "department" = 'research'
  WHERE "department" IS NULL AND "labels" ? 'research';

-- Workstreams: only within the already-assigned department, first match wins.
UPDATE "public"."tasks" SET "workstream" = 'backlog'
  WHERE "workstream" IS NULL AND "department" = 'development' AND "labels" ? 'backlog';
UPDATE "public"."tasks" SET "workstream" = 'code-review'
  WHERE "workstream" IS NULL AND "department" = 'development' AND "labels" ? 'code-review';
UPDATE "public"."tasks" SET "workstream" = 'release'
  WHERE "workstream" IS NULL AND "department" = 'development' AND "labels" ? 'release';

UPDATE "public"."tasks" SET "workstream" = 'analytics'
  WHERE "workstream" IS NULL AND "department" = 'marketing' AND "labels" ? 'analytics';
UPDATE "public"."tasks" SET "workstream" = 'campaign'
  WHERE "workstream" IS NULL AND "department" = 'marketing' AND "labels" ? 'campaign';
UPDATE "public"."tasks" SET "workstream" = 'social-media'
  WHERE "workstream" IS NULL AND "department" = 'marketing' AND "labels" ? 'social-media';

UPDATE "public"."tasks" SET "workstream" = 'checklist'
  WHERE "workstream" IS NULL AND "department" = 'operations' AND "labels" ? 'checklist';
UPDATE "public"."tasks" SET "workstream" = 'incident'
  WHERE "workstream" IS NULL AND "department" = 'operations' AND "labels" ? 'incident';
UPDATE "public"."tasks" SET "workstream" = 'monitoring'
  WHERE "workstream" IS NULL AND "department" = 'operations' AND "labels" ? 'monitoring';

UPDATE "public"."tasks" SET "workstream" = 'data'
  WHERE "workstream" IS NULL AND "department" = 'research' AND "labels" ? 'data';
UPDATE "public"."tasks" SET "workstream" = 'findings'
  WHERE "workstream" IS NULL AND "department" = 'research' AND "labels" ? 'findings';
UPDATE "public"."tasks" SET "workstream" = 'inspection'
  WHERE "workstream" IS NULL AND "department" = 'research' AND "labels" ? 'inspection';
UPDATE "public"."tasks" SET "workstream" = 'materials'
  WHERE "workstream" IS NULL AND "department" = 'research' AND "labels" ? 'materials';
UPDATE "public"."tasks" SET "workstream" = 'plan'
  WHERE "workstream" IS NULL AND "department" = 'research' AND "labels" ? 'plan';
