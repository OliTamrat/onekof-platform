-- Add BUSINESS, REGIONAL and GOVERNMENT to the Plan enum.
--
-- The commercialization strategy defines seven tiers. The enum carried four,
-- so the two highest-value segments — government agencies and the large NGO /
-- university book — had no plan value to be assigned to. They could be sold
-- but not billed through the platform, and were being invoiced by hand.
--
-- REGIONAL exists because regional bureaus buy at a different price point to
-- federal agencies and under a different procurement route, so they need to be
-- distinguishable in reporting rather than folded into GOVERNMENT.
--
-- ORDERING, and why this is not four plain ADD VALUEs:
-- Postgres sorts an enum column by declaration order, not alphabetically. If
-- these were appended, GOVERNMENT would sort after ENTERPRISE but BUSINESS and
-- REGIONAL would too — putting the cheapest of the three new tiers above the
-- most expensive of the old ones in any ORDER BY. BEFORE/AFTER keeps the
-- declared order aligned with ascending contract value, so plan ordering in
-- admin reporting stays meaningful without an application-side sort map.
--
-- SAFETY: ALTER TYPE ... ADD VALUE is additive. No existing row changes, and
-- no existing value is renamed or removed, so this is backward compatible with
-- application code deployed before it — an older build simply never emits the
-- new values. Postgres 12+ permits ADD VALUE inside a transaction provided the
-- new value is not itself used in that transaction; nothing here uses them.
--
-- IRREVERSIBLE: Postgres cannot drop a value from an enum. Rolling this back
-- requires recreating the type and rewriting every dependent column, so treat
-- it as forward-only.

ALTER TYPE "public"."Plan" ADD VALUE IF NOT EXISTS 'BUSINESS' AFTER 'PROFESSIONAL';
ALTER TYPE "public"."Plan" ADD VALUE IF NOT EXISTS 'REGIONAL' AFTER 'BUSINESS';
ALTER TYPE "public"."Plan" ADD VALUE IF NOT EXISTS 'GOVERNMENT' AFTER 'ENTERPRISE';
