-- Board approval: a recorded sign-off between review and completion.
--
-- The request: "approval button, after review and before DONE". Rather than a
-- new TaskStatus value — which would ripple through every board column,
-- filter, and the mobile app — approval is a recorded fact on the task
-- (who, when) plus a per-project gate: when projects.require_approval is on,
-- the transition into DONE demands approved_at to be set.
--
-- approved_by/approved_at survive completion as the audit record of who
-- signed off. The application clears them whenever the task returns to
-- active work, so an old approval cannot silently satisfy a later gate.
--
-- SAFETY: additive — two nullable columns on tasks, one on project_settings.
-- Nothing existing is altered; deploys ahead of the code that uses it.

ALTER TABLE "public"."tasks"
  ADD COLUMN IF NOT EXISTS "approved_by" TEXT,
  ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3);

ALTER TABLE "public"."project_settings"
  ADD COLUMN IF NOT EXISTS "require_approval" BOOLEAN;
