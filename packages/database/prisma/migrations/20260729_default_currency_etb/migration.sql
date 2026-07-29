-- Default budget currency: USD -> ETB.
--
-- Onekof is an Ethiopian product sold to Ethiopian institutions. A ministry
-- creating a budget should not have to change the currency away from US
-- dollars first.
--
-- Deliberately ONLY the column default. No UPDATE statement, because an
-- organization that explicitly chose USD — an NGO reporting to a foreign
-- donor, a contractor buying imported materials — chose it on purpose, and
-- silently rewriting their currency would corrupt every figure they have
-- entered.
--
-- CONSEQUENCE, verified on a scratch database rather than assumed: this
-- affects ONLY organizations created after it runs. Postgres materialises a
-- default at INSERT time, so existing rows already hold the literal 'USD'
-- whether they chose it or merely accepted the old default — and the two are
-- indistinguishable now. Every organization that exists today stays on USD
-- and must change it in Settings.
--
-- Deciding to migrate the ones that never actively chose is not possible from
-- the data, and overwriting all of them would hit the NGOs and contractors who
-- did choose. Left alone on purpose.

ALTER TABLE "public"."organization_settings"
  ALTER COLUMN "budget_currency" SET DEFAULT 'ETB';
