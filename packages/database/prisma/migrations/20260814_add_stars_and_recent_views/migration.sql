-- Personal workspace: pinned items and recently-opened items.
--
-- WHY TWO TABLES AND NOT ONE
-- A star is a deliberate act that persists until undone; a view is incidental
-- and is overwritten by the next one. Sharing a table would mean either
-- keeping stale views forever or letting a cleanup job delete someone's pins.
--
-- WHY NOT REUSE user_activities FOR VIEWS
-- That table records mutations — created, updated, assigned. An item you read
-- but did not change never lands in it, so it cannot answer "what did I look
-- at recently". Hence a separate, deliberately thin table.
--
-- POLYMORPHIC BY (entity_type, entity_id)
-- Neither table carries a foreign key to the entity. Both are personal
-- annotations with no referential meaning to the thing they point at, and a
-- column per starrable type would force a migration every time something new
-- becomes starrable. The trade-off is accepted knowingly: rows can outlive a
-- deleted entity, so readers must tolerate a miss when resolving them.
--
-- SAFETY: additive. Two new tables, nothing existing altered.

CREATE TABLE "public"."stars" (
  "id"          TEXT NOT NULL,
  "user_id"     TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id"   TEXT NOT NULL,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stars_pkey" PRIMARY KEY ("id")
);

-- Makes the star toggle idempotent: an upsert cannot create a duplicate.
CREATE UNIQUE INDEX "stars_user_id_entity_type_entity_id_key"
  ON "public"."stars"("user_id", "entity_type", "entity_id");
CREATE INDEX "stars_user_id_created_at_idx" ON "public"."stars"("user_id", "created_at");

ALTER TABLE "public"."stars"
  ADD CONSTRAINT "stars_user_id_fkey" FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "public"."recent_views" (
  "id"          TEXT NOT NULL,
  "user_id"     TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id"   TEXT NOT NULL,
  "viewed_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recent_views_pkey" PRIMARY KEY ("id")
);

-- One row per user and entity: a view updates the timestamp in place rather
-- than accumulating a row per open.
CREATE UNIQUE INDEX "recent_views_user_id_entity_type_entity_id_key"
  ON "public"."recent_views"("user_id", "entity_type", "entity_id");
CREATE INDEX "recent_views_user_id_viewed_at_idx"
  ON "public"."recent_views"("user_id", "viewed_at");

ALTER TABLE "public"."recent_views"
  ADD CONSTRAINT "recent_views_user_id_fkey" FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
