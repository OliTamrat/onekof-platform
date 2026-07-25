-- Sprint budget snapshots (Tier 2b of the reporting architecture).
-- Written once at sprint completion: budget_planned = sum of estimated
-- costs, budget_invested = sum of actual costs, from TaskBudget allocations
-- of the sprint's delivered issues, filtered to the org's budget currency.
-- Nullable = budget not tracked for that sprint. Idempotent, additive only.

ALTER TABLE "public"."sprints"
  ADD COLUMN IF NOT EXISTS "budget_planned" DECIMAL(19,2);
ALTER TABLE "public"."sprints"
  ADD COLUMN IF NOT EXISTS "budget_invested" DECIMAL(19,2);
