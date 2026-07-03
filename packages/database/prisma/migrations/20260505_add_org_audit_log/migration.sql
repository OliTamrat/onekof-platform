-- Org-level audit log for INSA / SOC-2 compliance
-- Append-only: application role has INSERT + SELECT only (no UPDATE, no DELETE).
-- Records every destructive or privileged action by any org member.

CREATE TABLE "public"."org_audit_logs" (
    "id"            TEXT        NOT NULL,
    "organization_id" TEXT      NOT NULL,

    -- Actor (denormalized for immutability)
    "actor_id"      TEXT        NOT NULL,
    "actor_email"   TEXT        NOT NULL,
    "actor_role"    TEXT        NOT NULL,

    -- What happened
    "action"        TEXT        NOT NULL,
    "resource"      TEXT        NOT NULL,
    "resource_id"   TEXT,
    "resource_name" TEXT,

    -- Change detail
    "before"        JSONB,
    "after"         JSONB,

    -- Network context
    "ip_address"    TEXT,
    "user_agent"    TEXT,

    "outcome"       TEXT        NOT NULL DEFAULT 'SUCCESS',
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes for the access patterns used by the viewer page
CREATE INDEX "org_audit_logs_org_created_at_idx"
    ON "public"."org_audit_logs"("organization_id", "created_at");

CREATE INDEX "org_audit_logs_org_actor_created_at_idx"
    ON "public"."org_audit_logs"("organization_id", "actor_id", "created_at");

CREATE INDEX "org_audit_logs_org_action_created_at_idx"
    ON "public"."org_audit_logs"("organization_id", "action", "created_at");

CREATE INDEX "org_audit_logs_resource_created_at_idx"
    ON "public"."org_audit_logs"("resource", "resource_id", "created_at");

CREATE INDEX "org_audit_logs_created_at_idx"
    ON "public"."org_audit_logs"("created_at");
