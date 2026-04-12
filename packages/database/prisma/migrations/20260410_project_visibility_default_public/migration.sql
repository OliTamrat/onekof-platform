-- Change the default value of projects.visibility from 'INTERNAL' to 'PUBLIC'.
-- Rationale: The RBAC project access filter treats INTERNAL as "only explicit
-- project members can see it", which surprises users who expect new projects
-- to be visible org-wide by default. PUBLIC matches the intuitive mental model.
--
-- Existing rows were bulk-migrated to PUBLIC via a one-time data script;
-- this migration only affects the default for NEW rows going forward.
-- Admins can still opt into INTERNAL/PRIVATE/CONFIDENTIAL via the project
-- settings UI.
ALTER TABLE "public"."projects"
  ALTER COLUMN "visibility" SET DEFAULT 'PUBLIC';
