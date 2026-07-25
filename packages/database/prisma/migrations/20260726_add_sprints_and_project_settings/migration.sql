-- Sprint & Settings foundation (Phase 1).
-- Design: docs/architecture/SPRINT_AND_SETTINGS_ARCHITECTURE.md (approved v1.2).
-- Idempotent by design: safe to run on a fresh DB and on the baseline-reconciled
-- production path. All new Task columns are nullable — zero backfill, zero
-- downtime, existing queries untouched.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "public"."SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."EstimationUnit" AS ENUM ('HOURS', 'POINTS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."TerminologyScheme" AS ENUM ('AGILE', 'FORMAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- New activity types for sprints and settings changes
ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS 'SPRINT_CREATED';
ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS 'SPRINT_UPDATED';
ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS 'SPRINT_STARTED';
ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS 'SPRINT_COMPLETED';
ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS 'SPRINT_DELETED';
ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS 'TASK_SPRINT_CHANGED';
ALTER TYPE "public"."ActivityType" ADD VALUE IF NOT EXISTS 'PROJECT_SETTINGS_CHANGED';

-- ---------------------------------------------------------------------------
-- Sprints
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "public"."sprints" (
  "id"                 TEXT NOT NULL,
  "project_id"         TEXT NOT NULL,
  "name"               TEXT NOT NULL,
  "goal"               TEXT,
  "status"             "public"."SprintStatus" NOT NULL DEFAULT 'PLANNED',
  "position"           INTEGER NOT NULL DEFAULT 0,
  "start_date"         TIMESTAMP(3),
  "end_date"           TIMESTAMP(3),
  "committed_count"    INTEGER,
  "committed_estimate" INTEGER,
  "completed_count"    INTEGER,
  "completed_estimate" INTEGER,
  "completed_at"       TIMESTAMP(3),
  "rollover_target_id" TEXT,
  "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"         TIMESTAMP(3) NOT NULL,
  "deleted_at"         TIMESTAMP(3),
  "created_by"         TEXT NOT NULL,

  CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "public"."sprints"
    ADD CONSTRAINT "sprints_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "sprints_project_id_status_deleted_at_idx"
  ON "public"."sprints"("project_id", "status", "deleted_at");

CREATE INDEX IF NOT EXISTS "sprints_project_id_position_idx"
  ON "public"."sprints"("project_id", "position");

-- One ACTIVE sprint per project, enforced at the database level.
-- Parallel sprints later = drop this index; no schema change needed.
CREATE UNIQUE INDEX IF NOT EXISTS "sprints_one_active_per_project"
  ON "public"."sprints"("project_id")
  WHERE "status" = 'ACTIVE' AND "deleted_at" IS NULL;

-- ---------------------------------------------------------------------------
-- Task sprint membership (all nullable — null = backlog)
-- ---------------------------------------------------------------------------

ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "sprint_id" TEXT;
ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "sprint_order" INTEGER;
ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "story_points" INTEGER;

DO $$ BEGIN
  ALTER TABLE "public"."tasks"
    ADD CONSTRAINT "tasks_sprint_id_fkey"
    FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "tasks_sprint_id_sprint_order_idx"
  ON "public"."tasks"("sprint_id", "sprint_order");

-- ---------------------------------------------------------------------------
-- Project settings (nullable columns = inherit from organization)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "public"."project_settings" (
  "id"                   TEXT NOT NULL,
  "project_id"           TEXT NOT NULL,
  "sprints_enabled"      BOOLEAN,
  "estimation_unit"      "public"."EstimationUnit",
  "enforce_workflow"     BOOLEAN,
  "workflow_transitions" JSONB,
  "extra"                JSONB NOT NULL DEFAULT '{}',
  "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"           TIMESTAMP(3) NOT NULL,

  CONSTRAINT "project_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_settings_project_id_key"
  ON "public"."project_settings"("project_id");

DO $$ BEGIN
  ALTER TABLE "public"."project_settings"
    ADD CONSTRAINT "project_settings_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Organization-level defaults (the org layer of the settings hierarchy)
-- ---------------------------------------------------------------------------

ALTER TABLE "public"."organization_settings"
  ADD COLUMN IF NOT EXISTS "sprints_enabled_default" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."organization_settings"
  ADD COLUMN IF NOT EXISTS "estimation_unit_default" "public"."EstimationUnit" NOT NULL DEFAULT 'HOURS';
ALTER TABLE "public"."organization_settings"
  ADD COLUMN IF NOT EXISTS "enforce_workflow_default" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."organization_settings"
  ADD COLUMN IF NOT EXISTS "terminology_scheme" "public"."TerminologyScheme" NOT NULL DEFAULT 'AGILE';
