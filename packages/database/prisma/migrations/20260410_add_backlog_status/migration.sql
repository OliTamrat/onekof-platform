-- Add BACKLOG as a new TaskStatus enum value.
-- Postgres ALTER TYPE ADD VALUE is transactional-safe since Postgres 12
-- and is fully backwards compatible: existing tasks with TODO/IN_PROGRESS/etc
-- are unaffected.
ALTER TYPE "public"."TaskStatus" ADD VALUE IF NOT EXISTS 'BACKLOG' BEFORE 'TODO';

-- Add nullable backlogOrder column to tasks for drag-to-prioritize support.
-- Nullable means existing rows get NULL (no migration of data needed).
ALTER TABLE "public"."tasks" ADD COLUMN IF NOT EXISTS "backlog_order" INTEGER;

-- Index for fast backlog queries: "all backlog tasks in project X ordered by priority"
CREATE INDEX IF NOT EXISTS "tasks_project_id_status_backlog_order_idx"
  ON "public"."tasks"("project_id", "status", "backlog_order");
