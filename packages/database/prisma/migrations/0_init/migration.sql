-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."OrgStatus" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'GUEST');

-- CreateEnum
CREATE TYPE "public"."Language" AS ENUM ('EN', 'AM', 'OM', 'TI', 'SO');

-- CreateEnum
CREATE TYPE "public"."Calendar" AS ENUM ('GREGORIAN', 'ETHIOPIAN');

-- CreateEnum
CREATE TYPE "public"."ProjectType" AS ENUM ('SOFTWARE', 'BUSINESS', 'MARKETING', 'OPERATIONS', 'RESEARCH', 'CONSTRUCTION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ProjectTemplate" AS ENUM ('KANBAN', 'SCRUM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ProjectRole" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "public"."ProjectPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE');

-- CreateEnum
CREATE TYPE "public"."ProjectEntityType" AS ENUM ('INTERNAL', 'EXTERNAL', 'JOINT_VENTURE', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "public"."ProjectVisibility" AS ENUM ('PUBLIC', 'INTERNAL', 'PRIVATE', 'CONFIDENTIAL');

-- CreateEnum
CREATE TYPE "public"."ProjectRiskLevel" AS ENUM ('NOT_ASSESSED', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."TaskType" AS ENUM ('TASK', 'STORY', 'BUG', 'EPIC', 'SUBTASK');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST');

-- CreateEnum
CREATE TYPE "public"."TaskLinkType" AS ENUM ('BLOCKS', 'IS_BLOCKED_BY', 'CLONES', 'IS_CLONED_BY', 'DUPLICATES', 'IS_DUPLICATED_BY', 'RELATES_TO', 'CAUSES', 'IS_CAUSED_BY');

-- CreateEnum
CREATE TYPE "public"."TeamRole" AS ENUM ('LEAD', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'AT_RISK', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."GoalPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "public"."AutomationScope" AS ENUM ('ORGANIZATION', 'PROJECT', 'TEAM');

-- CreateEnum
CREATE TYPE "public"."AutomationEntity" AS ENUM ('TASK', 'PROJECT', 'COMMENT', 'MILESTONE', 'GOAL');

-- CreateEnum
CREATE TYPE "public"."AutomationTrigger" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'FIELD_CHANGED', 'ASSIGNED', 'COMPLETED', 'DUE_DATE_APPROACHING', 'DUE_DATE_PASSED', 'BLOCKED', 'COMMENTED', 'PROGRESS_THRESHOLD_REACHED', 'BUDGET_THRESHOLD_REACHED');

-- CreateEnum
CREATE TYPE "public"."AutomationRunMode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."WatchReason" AS ENUM ('MANUAL', 'AUTO_ASSIGNED', 'AUTO_MENTIONED', 'AUTO_CREATED', 'AUTO_PARTICIPATED');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('LOGIN', 'LOGOUT', 'PASSWORD_CHANGED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED', 'TASK_PRIORITY_CHANGED', 'TASK_STATUS_CHANGED', 'TASK_COMPLETED', 'TASK_REOPENED', 'TASK_DELETED', 'TASK_COMMENTED', 'TASK_WATCHED', 'TASK_UNWATCHED', 'TASK_MOVED', 'TASK_BLOCKED', 'TASK_UNBLOCKED', 'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_ARCHIVED', 'PROJECT_DELETED', 'PROJECT_MEMBER_ADDED', 'PROJECT_MEMBER_REMOVED', 'GOAL_CREATED', 'GOAL_UPDATED', 'GOAL_COMPLETED', 'GOAL_ARCHIVED', 'GOAL_PROGRESS_UPDATED', 'TEAM_CREATED', 'TEAM_UPDATED', 'TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED', 'WATCHER_ADDED', 'WATCHER_REMOVED', 'AUTOMATION_CREATED', 'AUTOMATION_EXECUTED', 'AUTOMATION_FAILED');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('ETB', 'USD', 'EUR', 'GBP', 'CNY');

-- CreateEnum
CREATE TYPE "public"."BudgetStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BudgetAccess" AS ENUM ('NO_ACCESS', 'VIEW_ONLY', 'EDIT', 'APPROVE', 'FULL_CONTROL');

-- CreateEnum
CREATE TYPE "public"."ExpenseType" AS ENUM ('ACTUAL', 'COMMITTED', 'RESERVED');

-- CreateEnum
CREATE TYPE "public"."ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "schema_name" TEXT NOT NULL,
    "plan" "public"."Plan" NOT NULL DEFAULT 'FREE',
    "status" "public"."OrgStatus" NOT NULL DEFAULT 'TRIAL',
    "billing_email" TEXT,
    "subscription_id" TEXT,
    "trial_ends_at" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "max_members" INTEGER NOT NULL DEFAULT 10,
    "max_projects" INTEGER NOT NULL DEFAULT 10,
    "max_storage" INTEGER NOT NULL DEFAULT 5,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "features" JSONB NOT NULL DEFAULT '[]',
    "preferred_calendar" "public"."Calendar" NOT NULL DEFAULT 'GREGORIAN',
    "primary_language" "public"."Language" NOT NULL DEFAULT 'EN',
    "type" TEXT,
    "department" TEXT,
    "industry" TEXT,
    "teamSize" TEXT,
    "primary_use_cases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "language" TEXT,
    "calendar_preference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_settings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "enabled_sections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budget_features" JSONB,
    "teams_features" JSONB,
    "goals_features" JSONB,
    "automations_features" JSONB,
    "documents_features" JSONB,
    "docs_features" JSONB,
    "ai_assistant" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT true,
    "integrations" BOOLEAN NOT NULL DEFAULT false,
    "custom_branding" BOOLEAN NOT NULL DEFAULT false,
    "primary_color" TEXT NOT NULL DEFAULT '#0065FF',
    "logo_url" TEXT,
    "budget_currency" TEXT NOT NULL DEFAULT 'USD',
    "fiscal_year_start" INTEGER NOT NULL DEFAULT 1,
    "date_format" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "language" "public"."Language" NOT NULL DEFAULT 'EN',
    "allow_member_invites" BOOLEAN NOT NULL DEFAULT true,
    "require_budget_approval" BOOLEAN NOT NULL DEFAULT true,
    "public_projects_visible" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
    "language" "public"."Language" NOT NULL DEFAULT 'EN',
    "password" TEXT,
    "reset_token_hash" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_failed_login_at" TIMESTAMP(3),
    "locked_until" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "two_factor_backup_codes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "default_organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_members" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL DEFAULT 'MEMBER',
    "budget_access" "public"."BudgetAccess" NOT NULL DEFAULT 'NO_ACCESS',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invited_by" TEXT,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."OrgRole" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "owner_id" TEXT,
    "lead_id" TEXT,
    "default_assignee" TEXT,
    "department" TEXT,
    "category" TEXT,
    "entity_type" "public"."ProjectEntityType" NOT NULL DEFAULT 'INTERNAL',
    "visibility" "public"."ProjectVisibility" NOT NULL DEFAULT 'INTERNAL',
    "risk_level" "public"."ProjectRiskLevel" NOT NULL DEFAULT 'NOT_ASSESSED',
    "budget_code" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "priority" "public"."ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
    "type" "public"."ProjectType" NOT NULL DEFAULT 'BUSINESS',
    "template" "public"."ProjectTemplate" NOT NULL DEFAULT 'KANBAN',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."ProjectRole" NOT NULL DEFAULT 'MEMBER',
    "budget_access" "public"."BudgetAccess",
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."TaskType" NOT NULL DEFAULT 'TASK',
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignee_id" TEXT,
    "reporter_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "estimate" INTEGER,
    "time_spent" INTEGER,
    "due_date" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "labels" JSONB NOT NULL DEFAULT '[]',
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "backlog_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attachments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_links" (
    "id" TEXT NOT NULL,
    "from_task_id" TEXT NOT NULL,
    "to_task_id" TEXT NOT NULL,
    "type" "public"."TaskLinkType" NOT NULL DEFAULT 'RELATES_TO',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "default_hourly_rate" DECIMAL(10,2),
    "rate_currency" "public"."Currency",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."TeamRole" NOT NULL DEFAULT 'MEMBER',
    "hourly_rate" DECIMAL(10,2),
    "rate_currency" "public"."Currency",
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_teams" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "project_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."goal_projects" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "contribution_weight" INTEGER NOT NULL DEFAULT 100,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "goal_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."goals" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" "public"."GoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "owner_id" TEXT,
    "team_id" TEXT,
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."key_results" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'units',
    "target" DOUBLE PRECISION NOT NULL,
    "current" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "key_results_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."task_watchers" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "watch_reason" "public"."WatchReason" NOT NULL DEFAULT 'MANUAL',
    "notify_on_comment" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_status_change" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_assignment" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_priority_change" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_due_date" BOOLEAN NOT NULL DEFAULT true,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by" TEXT,

    CONSTRAINT "task_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."goal_watchers" (
    "id" TEXT NOT NULL,
    "goal_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "watch_reason" "public"."WatchReason" NOT NULL DEFAULT 'MANUAL',
    "notify_on_progress_update" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_status_change" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_completion" BOOLEAN NOT NULL DEFAULT true,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by" TEXT,

    CONSTRAINT "goal_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "activity_type" "public"."ActivityType" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "location" TEXT,
    "ai_summary" TEXT,
    "impact_score" INTEGER NOT NULL DEFAULT 1,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budgets" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "total_budget" DECIMAL(19,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'ETB',
    "additional_funding" JSONB NOT NULL DEFAULT '[]',
    "status" "public"."BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "fiscal_year_start" TIMESTAMP(3),
    "fiscal_year_end" TIMESTAMP(3),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "visibility_settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_categories" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "allocated_amount" DECIMAL(19,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'ETB',
    "parent_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expenses" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "category_id" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(19,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL DEFAULT 'ETB',
    "type" "public"."ExpenseType" NOT NULL DEFAULT 'ACTUAL',
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "invoice_number" TEXT,
    "vendor" TEXT,
    "receipt_url" TEXT,
    "status" "public"."ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "payment_status" "public"."PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paid_date" TIMESTAMP(3),
    "payment_method" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task_budgets" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "estimated_cost" DECIMAL(19,2),
    "currency" "public"."Currency" NOT NULL DEFAULT 'ETB',
    "actual_cost" DECIMAL(19,2),
    "override_hourly_rate" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expense_attachments" (
    "id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "expense_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_watchers" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "watched_categories" TEXT[],
    "notify_on_expense" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_threshold" BOOLEAN NOT NULL DEFAULT true,
    "threshold_percent" INTEGER,
    "notify_on_approval" BOOLEAN NOT NULL DEFAULT false,
    "notification_channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_watchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_revisions" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "revision_number" INTEGER NOT NULL,
    "change_type" TEXT NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "changed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "budget_id" TEXT,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processing_error" TEXT,
    "processed_at" TIMESTAMP(3),
    "ai_summary" TEXT,
    "aiInsights" JSONB NOT NULL DEFAULT '{}',
    "ai_confidence" DOUBLE PRECISION,
    "ai_model" TEXT,
    "ai_tokens_used" INTEGER,
    "extractedData" JSONB NOT NULL DEFAULT '{}',
    "uploaded_by" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_ai_processing" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "processing_type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION,
    "latency" INTEGER,
    "results" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "processed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_ai_processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_budget_items" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "category" TEXT,
    "vendor" TEXT,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "confidence" DOUBLE PRECISION,
    "extracted_fields" JSONB NOT NULL DEFAULT '{}',
    "expense_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_milestones" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "deliverable" TEXT,
    "budget" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "extracted_fields" JSONB NOT NULL DEFAULT '{}',
    "task_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_usage" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_count" INTEGER NOT NULL DEFAULT 0,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL DEFAULT 'monthly',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "document_limit" INTEGER NOT NULL DEFAULT 50,
    "exceeded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rate_limits" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "window_start" TIMESTAMP(3) NOT NULL,
    "window_end" TIMESTAMP(3) NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_at" TIMESTAMP(3),
    "block_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."budget_audit_logs" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "field_changed" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wiki_categories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'BookOpen',
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wiki_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wiki_articles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wiki_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_schema_name_key" ON "public"."organizations"("schema_name");

-- CreateIndex
CREATE UNIQUE INDEX "organization_settings_organization_id_key" ON "public"."organization_settings"("organization_id");

-- CreateIndex
CREATE INDEX "organization_settings_organization_id_idx" ON "public"."organization_settings"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_deleted_at_idx" ON "public"."users"("email", "deleted_at");

-- CreateIndex
CREATE INDEX "users_last_login_at_idx" ON "public"."users"("last_login_at");

-- CreateIndex
CREATE INDEX "users_default_organization_id_idx" ON "public"."users"("default_organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "public"."organization_members"("organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "public"."invitations"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "public"."sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "projects_organization_id_deleted_at_is_archived_idx" ON "public"."projects"("organization_id", "deleted_at", "is_archived");

-- CreateIndex
CREATE INDEX "projects_organization_id_is_favorite_updated_at_idx" ON "public"."projects"("organization_id", "is_favorite", "updated_at");

-- CreateIndex
CREATE INDEX "projects_organization_id_type_status_idx" ON "public"."projects"("organization_id", "type", "status");

-- CreateIndex
CREATE INDEX "projects_lead_id_deleted_at_idx" ON "public"."projects"("lead_id", "deleted_at");

-- CreateIndex
CREATE INDEX "projects_updated_at_deleted_at_idx" ON "public"."projects"("updated_at", "deleted_at");

-- CreateIndex
CREATE INDEX "projects_organization_id_priority_status_idx" ON "public"."projects"("organization_id", "priority", "status");

-- CreateIndex
CREATE INDEX "projects_organization_id_due_date_idx" ON "public"."projects"("organization_id", "due_date");

-- CreateIndex
CREATE INDEX "projects_organization_id_department_status_idx" ON "public"."projects"("organization_id", "department", "status");

-- CreateIndex
CREATE INDEX "projects_organization_id_entity_type_status_idx" ON "public"."projects"("organization_id", "entity_type", "status");

-- CreateIndex
CREATE INDEX "projects_organization_id_risk_level_idx" ON "public"."projects"("organization_id", "risk_level");

-- CreateIndex
CREATE UNIQUE INDEX "projects_organization_id_key_key" ON "public"."projects"("organization_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "public"."project_members"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "tasks_project_id_status_deleted_at_idx" ON "public"."tasks"("project_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "tasks_project_id_type_status_deleted_at_idx" ON "public"."tasks"("project_id", "type", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_status_deleted_at_idx" ON "public"."tasks"("assignee_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_due_date_idx" ON "public"."tasks"("assignee_id", "due_date");

-- CreateIndex
CREATE INDEX "tasks_project_id_created_at_deleted_at_idx" ON "public"."tasks"("project_id", "created_at", "deleted_at");

-- CreateIndex
CREATE INDEX "tasks_reporter_id_created_at_idx" ON "public"."tasks"("reporter_id", "created_at");

-- CreateIndex
CREATE INDEX "tasks_status_due_date_idx" ON "public"."tasks"("status", "due_date");

-- CreateIndex
CREATE INDEX "tasks_priority_status_deleted_at_idx" ON "public"."tasks"("priority", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "tasks_parent_id_idx" ON "public"."tasks"("parent_id");

-- CreateIndex
CREATE INDEX "tasks_project_id_status_backlog_order_idx" ON "public"."tasks"("project_id", "status", "backlog_order");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_project_id_key_key" ON "public"."tasks"("project_id", "key");

-- CreateIndex
CREATE INDEX "comments_task_id_created_at_deleted_at_idx" ON "public"."comments"("task_id", "created_at", "deleted_at");

-- CreateIndex
CREATE INDEX "comments_author_id_created_at_idx" ON "public"."comments"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "task_links_from_task_id_idx" ON "public"."task_links"("from_task_id");

-- CreateIndex
CREATE INDEX "task_links_to_task_id_idx" ON "public"."task_links"("to_task_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_links_from_task_id_to_task_id_type_key" ON "public"."task_links"("from_task_id", "to_task_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "public"."team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_teams_project_id_team_id_key" ON "public"."project_teams"("project_id", "team_id");

-- CreateIndex
CREATE INDEX "goal_projects_goal_id_idx" ON "public"."goal_projects"("goal_id");

-- CreateIndex
CREATE INDEX "goal_projects_project_id_idx" ON "public"."goal_projects"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "goal_projects_goal_id_project_id_key" ON "public"."goal_projects"("goal_id", "project_id");

-- CreateIndex
CREATE INDEX "goals_organization_id_status_deleted_at_idx" ON "public"."goals"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "goals_organization_id_priority_status_idx" ON "public"."goals"("organization_id", "priority", "status");

-- CreateIndex
CREATE INDEX "goals_team_id_status_deleted_at_idx" ON "public"."goals"("team_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "goals_owner_id_status_deleted_at_idx" ON "public"."goals"("owner_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "goals_due_date_status_idx" ON "public"."goals"("due_date", "status");

-- CreateIndex
CREATE INDEX "task_watchers_user_id_added_at_idx" ON "public"."task_watchers"("user_id", "added_at");

-- CreateIndex
CREATE INDEX "task_watchers_task_id_idx" ON "public"."task_watchers"("task_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_watchers_task_id_user_id_key" ON "public"."task_watchers"("task_id", "user_id");

-- CreateIndex
CREATE INDEX "goal_watchers_user_id_added_at_idx" ON "public"."goal_watchers"("user_id", "added_at");

-- CreateIndex
CREATE INDEX "goal_watchers_goal_id_idx" ON "public"."goal_watchers"("goal_id");

-- CreateIndex
CREATE UNIQUE INDEX "goal_watchers_goal_id_user_id_key" ON "public"."goal_watchers"("goal_id", "user_id");

-- CreateIndex
CREATE INDEX "user_activities_user_id_created_at_idx" ON "public"."user_activities"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_activities_organization_id_created_at_idx" ON "public"."user_activities"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "user_activities_organization_id_entity_type_created_at_idx" ON "public"."user_activities"("organization_id", "entity_type", "created_at");

-- CreateIndex
CREATE INDEX "user_activities_entity_type_entity_id_created_at_idx" ON "public"."user_activities"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "user_activities_activity_type_created_at_idx" ON "public"."user_activities"("activity_type", "created_at");

-- CreateIndex
CREATE INDEX "user_activities_session_id_idx" ON "public"."user_activities"("session_id");

-- CreateIndex
CREATE INDEX "user_activities_user_id_activity_type_created_at_idx" ON "public"."user_activities"("user_id", "activity_type", "created_at");

-- CreateIndex
CREATE INDEX "user_activities_user_id_entity_type_created_at_idx" ON "public"."user_activities"("user_id", "entity_type", "created_at");

-- CreateIndex
CREATE INDEX "user_activities_organization_id_activity_type_created_at_idx" ON "public"."user_activities"("organization_id", "activity_type", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_project_id_key" ON "public"."budgets"("project_id");

-- CreateIndex
CREATE INDEX "expenses_budget_id_status_deleted_at_idx" ON "public"."expenses"("budget_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "expenses_budget_id_category_id_status_transaction_date_idx" ON "public"."expenses"("budget_id", "category_id", "status", "transaction_date");

-- CreateIndex
CREATE INDEX "expenses_budget_id_payment_status_deleted_at_idx" ON "public"."expenses"("budget_id", "payment_status", "deleted_at");

-- CreateIndex
CREATE INDEX "expenses_category_id_status_idx" ON "public"."expenses"("category_id", "status");

-- CreateIndex
CREATE INDEX "expenses_transaction_date_deleted_at_idx" ON "public"."expenses"("transaction_date", "deleted_at");

-- CreateIndex
CREATE INDEX "expenses_submitted_by_status_created_at_idx" ON "public"."expenses"("submitted_by", "status", "created_at");

-- CreateIndex
CREATE INDEX "expenses_approved_by_approved_at_idx" ON "public"."expenses"("approved_by", "approved_at");

-- CreateIndex
CREATE UNIQUE INDEX "task_budgets_task_id_category_id_key" ON "public"."task_budgets"("task_id", "category_id");

-- CreateIndex
CREATE INDEX "expense_attachments_expense_id_idx" ON "public"."expense_attachments"("expense_id");

-- CreateIndex
CREATE INDEX "budget_watchers_budget_id_idx" ON "public"."budget_watchers"("budget_id");

-- CreateIndex
CREATE INDEX "budget_watchers_user_id_idx" ON "public"."budget_watchers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_watchers_budget_id_user_id_key" ON "public"."budget_watchers"("budget_id", "user_id");

-- CreateIndex
CREATE INDEX "budget_revisions_budget_id_idx" ON "public"."budget_revisions"("budget_id");

-- CreateIndex
CREATE INDEX "budget_revisions_changed_by_idx" ON "public"."budget_revisions"("changed_by");

-- CreateIndex
CREATE INDEX "budget_revisions_created_at_idx" ON "public"."budget_revisions"("created_at");

-- CreateIndex
CREATE INDEX "documents_organization_id_status_deleted_at_idx" ON "public"."documents"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "documents_organization_id_file_type_created_at_idx" ON "public"."documents"("organization_id", "file_type", "created_at");

-- CreateIndex
CREATE INDEX "documents_project_id_deleted_at_idx" ON "public"."documents"("project_id", "deleted_at");

-- CreateIndex
CREATE INDEX "documents_budget_id_file_type_deleted_at_idx" ON "public"."documents"("budget_id", "file_type", "deleted_at");

-- CreateIndex
CREATE INDEX "documents_status_deleted_at_idx" ON "public"."documents"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "documents_uploaded_by_created_at_idx" ON "public"."documents"("uploaded_by", "created_at");

-- CreateIndex
CREATE INDEX "documents_created_at_deleted_at_idx" ON "public"."documents"("created_at", "deleted_at");

-- CreateIndex
CREATE INDEX "document_ai_processing_document_id_idx" ON "public"."document_ai_processing"("document_id");

-- CreateIndex
CREATE INDEX "document_ai_processing_processing_type_idx" ON "public"."document_ai_processing"("processing_type");

-- CreateIndex
CREATE INDEX "document_ai_processing_created_at_idx" ON "public"."document_ai_processing"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_budget_items_expense_id_key" ON "public"."document_budget_items"("expense_id");

-- CreateIndex
CREATE INDEX "document_budget_items_document_id_idx" ON "public"."document_budget_items"("document_id");

-- CreateIndex
CREATE INDEX "document_budget_items_status_idx" ON "public"."document_budget_items"("status");

-- CreateIndex
CREATE INDEX "document_budget_items_category_idx" ON "public"."document_budget_items"("category");

-- CreateIndex
CREATE UNIQUE INDEX "document_milestones_task_id_key" ON "public"."document_milestones"("task_id");

-- CreateIndex
CREATE INDEX "document_milestones_document_id_idx" ON "public"."document_milestones"("document_id");

-- CreateIndex
CREATE INDEX "document_milestones_status_idx" ON "public"."document_milestones"("status");

-- CreateIndex
CREATE INDEX "ai_usage_organization_id_idx" ON "public"."ai_usage"("organization_id");

-- CreateIndex
CREATE INDEX "ai_usage_user_id_idx" ON "public"."ai_usage"("user_id");

-- CreateIndex
CREATE INDEX "ai_usage_period_start_idx" ON "public"."ai_usage"("period_start");

-- CreateIndex
CREATE UNIQUE INDEX "ai_usage_organization_id_period_period_start_key" ON "public"."ai_usage"("organization_id", "period", "period_start");

-- CreateIndex
CREATE INDEX "rate_limits_identifier_window_end_idx" ON "public"."rate_limits"("identifier", "window_end");

-- CreateIndex
CREATE INDEX "rate_limits_endpoint_window_end_idx" ON "public"."rate_limits"("endpoint", "window_end");

-- CreateIndex
CREATE INDEX "rate_limits_blocked_window_end_idx" ON "public"."rate_limits"("blocked", "window_end");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_identifier_endpoint_window_start_key" ON "public"."rate_limits"("identifier", "endpoint", "window_start");

-- CreateIndex
CREATE INDEX "budget_audit_logs_budget_id_created_at_idx" ON "public"."budget_audit_logs"("budget_id", "created_at");

-- CreateIndex
CREATE INDEX "budget_audit_logs_user_id_action_created_at_idx" ON "public"."budget_audit_logs"("user_id", "action", "created_at");

-- CreateIndex
CREATE INDEX "budget_audit_logs_action_created_at_idx" ON "public"."budget_audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "budget_audit_logs_entity_type_entity_id_created_at_idx" ON "public"."budget_audit_logs"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "password_history_user_id_created_at_idx" ON "public"."password_history"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "wiki_categories_organization_id_idx" ON "public"."wiki_categories"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "wiki_categories_organization_id_slug_key" ON "public"."wiki_categories"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "wiki_articles_organization_id_status_idx" ON "public"."wiki_articles"("organization_id", "status");

-- CreateIndex
CREATE INDEX "wiki_articles_category_id_idx" ON "public"."wiki_articles"("category_id");

-- CreateIndex
CREATE INDEX "wiki_articles_created_by_idx" ON "public"."wiki_articles"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "wiki_articles_organization_id_slug_key" ON "public"."wiki_articles"("organization_id", "slug");

-- AddForeignKey
ALTER TABLE "public"."organization_settings" ADD CONSTRAINT "organization_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_members" ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachments" ADD CONSTRAINT "attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attachments" ADD CONSTRAINT "attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_links" ADD CONSTRAINT "task_links_from_task_id_fkey" FOREIGN KEY ("from_task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_links" ADD CONSTRAINT "task_links_to_task_id_fkey" FOREIGN KEY ("to_task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_links" ADD CONSTRAINT "task_links_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_teams" ADD CONSTRAINT "project_teams_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project_teams" ADD CONSTRAINT "project_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal_projects" ADD CONSTRAINT "goal_projects_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal_projects" ADD CONSTRAINT "goal_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goals" ADD CONSTRAINT "goals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goals" ADD CONSTRAINT "goals_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."key_results" ADD CONSTRAINT "key_results_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."automation_rules" ADD CONSTRAINT "automation_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_watchers" ADD CONSTRAINT "task_watchers_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_watchers" ADD CONSTRAINT "task_watchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal_watchers" ADD CONSTRAINT "goal_watchers_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal_watchers" ADD CONSTRAINT "goal_watchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budgets" ADD CONSTRAINT "budgets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_categories" ADD CONSTRAINT "budget_categories_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_budgets" ADD CONSTRAINT "task_budgets_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_budgets" ADD CONSTRAINT "task_budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expense_attachments" ADD CONSTRAINT "expense_attachments_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_watchers" ADD CONSTRAINT "budget_watchers_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget_revisions" ADD CONSTRAINT "budget_revisions_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_ai_processing" ADD CONSTRAINT "document_ai_processing_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_budget_items" ADD CONSTRAINT "document_budget_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_milestones" ADD CONSTRAINT "document_milestones_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wiki_articles" ADD CONSTRAINT "wiki_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."wiki_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

