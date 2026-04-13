-- Wave 3: Admin Audit Log
-- Tracks all admin panel actions for compliance and security review.

CREATE TABLE "public"."admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_username" TEXT NOT NULL,
    "admin_role" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "outcome" TEXT NOT NULL DEFAULT 'SUCCESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_audit_logs_admin_username_created_at_idx" ON "public"."admin_audit_logs"("admin_username", "created_at");
CREATE INDEX "admin_audit_logs_action_created_at_idx" ON "public"."admin_audit_logs"("action", "created_at");
CREATE INDEX "admin_audit_logs_resource_resource_id_created_at_idx" ON "public"."admin_audit_logs"("resource", "resource_id", "created_at");
CREATE INDEX "admin_audit_logs_created_at_idx" ON "public"."admin_audit_logs"("created_at");
