-- REVERT: restore projects.visibility default back to 'INTERNAL'.
-- The previous migration (20260410_project_visibility_default_public) was
-- applied in error based on a misdiagnosed user issue. This migration
-- restores the schema to its pre-session state.
ALTER TABLE "public"."projects"
  ALTER COLUMN "visibility" SET DEFAULT 'INTERNAL';
