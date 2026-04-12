-- CreateEnum
CREATE TYPE "public"."AutomationScope" AS ENUM ('ORGANIZATION', 'PROJECT', 'TEAM');

-- CreateEnum
CREATE TYPE "public"."AutomationEntity" AS ENUM ('TASK', 'PROJECT', 'COMMENT', 'MILESTONE', 'GOAL');

-- CreateEnum
CREATE TYPE "public"."AutomationTrigger" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'FIELD_CHANGED', 'ASSIGNED', 'COMPLETED', 'DUE_DATE_APPROACHING', 'DUE_DATE_PASSED', 'BLOCKED', 'COMMENTED', 'PROGRESS_THRESHOLD_REACHED', 'BUDGET_THRESHOLD_REACHED');

-- CreateEnum
CREATE TYPE "public"."AutomationRunMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateTable
CREATE TABLE "public"."automation_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "natural_language" TEXT,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "scope" "public"."AutomationScope" NOT NULL DEFAULT 'PROJECT',
    "entityType" "public"."AutomationEntity" NOT NULL DEFAULT 'TASK',
    "triggerEvent" "public"."AutomationTrigger" NOT NULL DEFAULT 'CREATED',
    "runMode" "public"."AutomationRunMode" NOT NULL DEFAULT 'AUTOMATIC',
    "execution_order" INTEGER NOT NULL DEFAULT 1,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "execution_count" INTEGER NOT NULL DEFAULT 0,
    "last_executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."automation_rules" ADD CONSTRAINT "automation_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
