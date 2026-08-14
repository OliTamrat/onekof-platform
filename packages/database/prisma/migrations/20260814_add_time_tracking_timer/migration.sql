-- Real time tracking: measured intervals alongside typed ones.
--
-- Additive and safe on live data. Existing work_logs rows become MANUAL,
-- which is what they are: figures somebody typed. Nothing is rewritten.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkLogSource') THEN
    CREATE TYPE "public"."WorkLogSource" AS ENUM ('MANUAL', 'TIMER');
  END IF;
END
$$;

ALTER TABLE "public"."work_logs"
  ADD COLUMN IF NOT EXISTS "source" "public"."WorkLogSource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "ended_at" TIMESTAMP(3);

-- Only running timers live here; stopping one writes a work_logs row and
-- deletes this one. The unique on user_id is the guarantee that one person
-- cannot have two clocks running against the same afternoon.
CREATE TABLE IF NOT EXISTS "public"."timer_sessions" (
  "id" TEXT NOT NULL,
  "task_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "timer_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "timer_sessions_user_id_key"
  ON "public"."timer_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "timer_sessions_task_id_idx"
  ON "public"."timer_sessions"("task_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'timer_sessions_task_id_fkey'
  ) THEN
    ALTER TABLE "public"."timer_sessions"
      ADD CONSTRAINT "timer_sessions_task_id_fkey"
      FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'timer_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE "public"."timer_sessions"
      ADD CONSTRAINT "timer_sessions_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
