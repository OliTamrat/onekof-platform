-- INSA Security Finding #1: Improper Session Invalidation After Logout
-- Adds server-side JWT revocation timestamp to users table
ALTER TABLE "public"."users" ADD COLUMN "session_invalidated_at" TIMESTAMP(3);
