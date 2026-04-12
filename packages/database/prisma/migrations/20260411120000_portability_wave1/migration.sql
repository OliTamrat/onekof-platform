-- Wave 1 Portability Migration
-- Date: 2026-04-11
-- Purpose: Prepare Onekof for multi-tier federated deployment and fix schema gaps
-- identified in the 2026-04-11 multi-specialist code review.
--
-- Changes:
--   1. Add HostingTier enum (Tier 1/2/3 assignment)
--   2. Add Organization.hostingTier column with default GLOBAL_CLOUD (backfills all existing rows)
--   3. Add missing index on BudgetCategory.budgetId (eliminates seq scan on category loads)
--   4. Add missing composite index on AutomationRule (organizationId, isEnabled, deletedAt)
--
-- Safety notes:
--   - All changes are ADDITIVE (new enum, new column with default, new indexes)
--   - No data is modified
--   - No columns are dropped
--   - No types are changed
--   - Safe to deploy to Supabase (Tier 3) with zero downtime
--   - Idempotent via IF NOT EXISTS clauses

-- 1. Create HostingTier enum (idempotent via DO block)
DO $$ BEGIN
    CREATE TYPE "public"."HostingTier" AS ENUM ('GLOBAL_CLOUD', 'PRIVATE_ONPREM', 'GOV_ETHIOTELECOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add hosting_tier column to organizations (default backfills all existing rows)
ALTER TABLE "public"."organizations"
  ADD COLUMN IF NOT EXISTS "hosting_tier" "public"."HostingTier" NOT NULL DEFAULT 'GLOBAL_CLOUD';

-- 3. Add missing index on BudgetCategory.budget_id
CREATE INDEX IF NOT EXISTS "budget_categories_budget_id_idx"
  ON "public"."budget_categories" ("budget_id");

-- 4. Add missing composite index on AutomationRule
CREATE INDEX IF NOT EXISTS "automation_rules_organization_id_is_enabled_deleted_at_idx"
  ON "public"."automation_rules" ("organization_id", "is_enabled", "deleted_at");
