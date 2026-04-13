-- Wave 3: Remove rate_limits table
-- Rate limiting is handled by Upstash Redis (lib/security/rate-limit.ts).
-- The Postgres-backed RateLimit model was dead code and wrong architecture
-- for serverless multi-instance scaling.

DROP TABLE IF EXISTS "public"."rate_limits";
