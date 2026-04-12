# Onekof Prisma Migrations

## Current state (as of 2026-04-11, Wave 1 portability PR)

### `0_init/` — baseline (NEW as of 2026-04-11)

`0_init/migration.sql` is the **baseline migration** that creates the full
Onekof schema from empty. It contains every enum, table, index, and foreign
key currently in `schema.prisma` (1,389 lines of SQL covering ~80 models).

It was generated via:
```
cd apps/web
pnpm exec prisma migrate diff \
  --from-empty \
  --to-schema-datamodel ../../packages/database/prisma/schema.prisma \
  --script > ../../packages/database/prisma/migrations/0_init/migration.sql
```

**This baseline did not exist before 2026-04-11.** The Onekof production
schema on Supabase was bootstrapped via `prisma db push` or direct dashboard
edits, without a `0_init` migration. A multi-specialist code review
(DB engineer) flagged the missing baseline as a CRITICAL blocker to
deploying Onekof on any new Postgres host (Tier 1 EthioTelecom Cloud, Tier 2
on-premise Ethiopian server), because `prisma migrate deploy` against a blank
database would only apply the 7 incremental migrations and produce a broken
partial schema.

### Older incremental migrations (pre-baseline)

| Directory | Idempotent? | Content |
|---|---|---|
| `20260304062200_add_automation_rules/` | NO (`CREATE TABLE`) | Adds automation_rules + enums |
| `20260407_add_wiki_models/` | TBD | Adds wiki_categories, wiki_articles |
| `20260409_add_contractor_role/` | YES (`ADD VALUE IF NOT EXISTS`) | Adds ProjectRole.CONTRACTOR |
| `20260409_add_task_links/` | TBD | Adds TaskLink table |
| `20260410_add_backlog_status/` | YES (`ADD VALUE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`) | Adds TaskStatus.BACKLOG, Task.backlogOrder |
| `20260410_project_visibility_default_public/` | TBD | Sets default ProjectVisibility |
| `20260410_revert_project_visibility_default/` | TBD | Reverts above |

Because these migrations were authored BEFORE the baseline existed, their
cumulative effect is **already captured in `0_init/migration.sql`**. On a
fresh database, applying `0_init` followed by these 7 migrations would fail:
the non-idempotent ones try to `CREATE TABLE` tables that the baseline has
already created.

## Deployment instructions

### For the existing Supabase database (Tier 3)

Supabase already has every schema change applied. Mark `0_init` as applied
without re-running it:

```
cd apps/web
DATABASE_URL="<supabase-url>" pnpm exec prisma migrate resolve --applied 0_init
```

Verify:
```
DATABASE_URL="<supabase-url>" pnpm exec prisma migrate status
```

All migrations should show "Database schema is up to date!". The `_prisma_migrations`
table on Supabase already has entries for the 7 older migrations.

### For a NEW database (Tier 2 on-premise, future Tier 1)

**Option A — Recommended:** Archive the 7 older migrations before deploying.

The baseline contains their cumulative effect, so they are redundant for
any deployment that starts from `0_init`. Move them out of the active
migrations folder:

```
mkdir -p packages/database/prisma/migrations/_archived_pre_baseline
git mv packages/database/prisma/migrations/20260* \
       packages/database/prisma/migrations/_archived_pre_baseline/
```

Then on the new database:
```
cd apps/web
DATABASE_URL="<new-db-url>" pnpm exec prisma migrate deploy
```

This applies only `0_init` and any post-baseline migrations, producing a
clean schema that matches production.

**Option B — Preserve the old migrations:** If you want to keep the 7 older
migrations in the active folder for audit purposes, manually mark them as
applied on the new database after applying `0_init`:

```
cd apps/web
DATABASE_URL="<new-db-url>" pnpm exec prisma migrate deploy
# 0_init will apply successfully
# The next migration will fail because tables already exist
# For each failing migration, mark it as applied:
DATABASE_URL="<new-db-url>" pnpm exec prisma migrate resolve --applied 20260304062200_add_automation_rules
DATABASE_URL="<new-db-url>" pnpm exec prisma migrate resolve --applied 20260407_add_wiki_models
# ... repeat for all 7
```

Option A is cleaner and reflects that the baseline is the source of truth.
Option B preserves history at the cost of manual deployment steps.

## Future migrations

All migrations added AFTER 2026-04-11 follow the standard Prisma workflow
and should use `ADD COLUMN IF NOT EXISTS`, `ADD VALUE IF NOT EXISTS`, and
similar idempotent patterns whenever possible (per `PROJECT_GUIDELINES.md`
Database / Migration Rules section).

To create a new migration:
```
cd apps/web
pnpm exec prisma migrate dev --name <descriptive_name> \
  --schema ../../packages/database/prisma/schema.prisma
```

## References

- `onekof-platform/PROJECT_GUIDELINES.md` — Database / Migration Rules
- `onekof-platform/DATABASE_BACKUP_STRATEGY.md` — Backup and restore procedures
- Multi-specialist code review findings (2026-04-11) — full report in session history
