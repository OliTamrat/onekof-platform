# Infrastructure Audit — July 2026
**Conducted:** 2026-07-02
**Scope:** Full infrastructure review covering Tier 2/3 deployment configs, CI/CD pipelines,
database layer, middleware, and migration readiness ahead of EthioTelecom Phase 2.
**Method:** Static analysis of all infrastructure files. NOT a live end-to-end test.
**Confidence note:** Bugs marked P0/P1 are confirmed in source code. Items marked as risks
require live stack testing to fully verify.

---

## Test Suite Status

All 204 unit tests pass (Vitest 4.1.0, `apps/web`). Zero failures.
17 test files covering API auth, components, security, CSV, realtime, and validation.

Not run (require live infrastructure):
- `tests/k6/*.js` — load tests, need k6 binary + live server
- `apps/web/e2e/*.spec.ts` — Playwright E2E, need running Next.js server
- `apps/mobile/` — no test script configured

---

## Tier 3 (Vercel + Supabase) — Current Production

**Status: Live and stable.**

| Component | Status | Notes |
|---|---|---|
| CI pipeline (ci.yml) | LIVE | Build, type-check, 204 unit tests — all green |
| Deploy pipeline (deploy-production.yml) | LIVE | prisma migrate deploy → vercel deploy --prebuilt --prod |
| Database (Supabase PostgreSQL 15) | LIVE | 15 migrations applied including 20260625_insa_security_fixes |
| Redis (Upstash) | LIVE | Rate limiting active |
| File storage (Vercel Blob + AES-256-GCM) | LIVE | BLOB_ENCRYPTION_KEY set in Vercel |
| Sentry (web + mobile) | LIVE | Both DSNs active |
| Wildcard subdomains (*.onekof.com) | LIVE | Cloudflare wildcard A * → DNS Only |
| Supabase tier | WARNING | Free tier — 7-day backup retention, no PITR |

**Action required on Tier 3:**
Upgrade Supabase to Pro ($25/mo) before onboarding any paying customer.
Free tier has no point-in-time recovery and only 7-day backup retention.

---

## Tier 2 (EthioTelecom Self-Hosted) — Confirmed Bugs

These are verified in source code. They will cause Tier 2 to fail even after the
domain is registered and the VM is provisioned.

### BUG-1 (P0) — pgvector extension missing from Docker postgres image
**File:** `docker-compose.prod.yml`, line with `image: postgres:15-alpine`
**Problem:** The Prisma schema declares `extensions = [vector]`. The standard
`postgres:15-alpine` image does not ship with pgvector. `prisma migrate deploy` will
fail on the `CREATE EXTENSION vector` step.
**Fix:** Change the postgres image:
```yaml
# docker-compose.prod.yml
image: ankane/pgvector:pg15   # was: postgres:15-alpine
```

### BUG-2 (P0) — Caddyfile has no wildcard subdomain routing
**File:** `Caddyfile`
**Problem:** The entire multi-tenant architecture depends on `{slug}.onekof.et` routing.
The Caddyfile only handles two hostnames: `onekof.et` and `www.onekof.et`. No wildcard
block exists. Additionally, wildcard TLS via Let's Encrypt requires DNS-01 ACME challenge
(not HTTP-01), which requires the Cloudflare DNS module — not included in `caddy:2-alpine`.
**Fix:** Two-part change:
1. Update Caddyfile to add wildcard block with DNS-01 challenge config:
```
*.onekof.et {
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
    reverse_proxy onekof-web:3000
    # ... security headers
}
```
2. Replace Caddy image with one that includes the Cloudflare DNS module, or build a
   custom Caddy image using xcaddy with the cloudflare plugin.
3. Add `CLOUDFLARE_API_TOKEN` to `.env.production`.

### BUG-3 (P0) — Docker image has never been published to GHCR
**File:** `.github/workflows/docker-build.yml`
**Problem:** The workflow only triggers on `v*.*.*` semver tags or manual dispatch.
There are 425+ commits on master but zero semver tags. The image
`ghcr.io/daps-analytics/onekof-web:latest` does not exist in GitHub Container Registry.
`docker compose pull` on the VM will fail with a 404.
**Fix:** Tag a release to trigger the build:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### BUG-4 (P0) — CSRF enforcement is bypassed in middleware
**File:** `apps/web/src/middleware.ts`, function `enforceCsrfOrigin`
**Problem:** The INSA readiness report claims P1 (CSRF) is closed. In middleware.ts:
```typescript
function enforceCsrfOrigin(_request: NextRequest): NextResponse | null {
  // Pre-launch: bypass CSRF blocking so invite / create / mutation routes work.
  return null;
}
```
The function always returns null — CSRF validation never runs at the middleware layer.
Individual API routes may have their own checks, but the middleware enforcement is
a no-op. This must be re-enabled before INSA certification submission.
**Fix:** Remove the `return null` early return and finalize the allowed-origin list
using `PUBLIC_HOSTS` env var (already implemented in `getAllowedOrigins()`).

### BUG-5 (P1) — getTenantClient creates new connection pool per call
**File:** `packages/database/index.ts`, function `getTenantClient`
**Problem:** Every call to `getTenantClient(schemaName)` creates a new `PrismaClient`
instance with its own connection pool (default 10 connections). Under any real load
this will exhaust PostgreSQL's connection limit.
**Fix:** Cache clients by schema name:
```typescript
const tenantClients = new Map<string, PrismaClient>();
export function getTenantClient(schemaName: string) {
  if (!tenantClients.has(schemaName)) {
    tenantClients.set(schemaName, new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}?schema=${schemaName}` } },
    }));
  }
  return tenantClients.get(schemaName)!;
}
```

### BUG-6 (P1) — BLOB_ENCRYPTION_KEY missing from .env.example
**File:** `apps/web/.env.example`
**Problem:** INSA P4 (AES-256-GCM at-rest encryption) depends on `BLOB_ENCRYPTION_KEY`.
It is set in Vercel for Tier 3 but not included in the .env.example template. Anyone
setting up Tier 2 from the example will silently skip this.
**Fix:** Add to `apps/web/.env.example`:
```
BLOB_ENCRYPTION_KEY="generate-with-openssl-rand-hex-32"
```

### BUG-7 (P1) — GHCR image is likely private; VM needs pull credentials
**File:** `scripts/setup-tier2-server.sh`
**Problem:** Packages published via GitHub Actions are private by default. The
EthioTelecom VM will fail to pull without authentication.
**Fix:** Either make the package public (GitHub → Packages → Change visibility),
or add a docker login step to the server setup runbook:
```bash
echo $GHCR_PAT | docker login ghcr.io -u USERNAME --password-stdin
```

### BUG-8 (P2) — Caddy access log path not persisted
**File:** `docker-compose.prod.yml`, `caddy` service
**Problem:** The Caddyfile writes logs to `/var/log/caddy/access.log` inside the
container but no volume is mounted for this path. Logs are lost on every restart.
**Fix:** Add to the caddy service volumes:
```yaml
- caddy_logs:/var/log/caddy
```
And add `caddy_logs` to the volumes block.

---

## Tier 1 (INSA / Sovereign) — Remaining Items

| Item | Status |
|---|---|
| INSA code compliance (P1–P6) | Done in code (but see BUG-4 re: CSRF bypass) |
| INSA certification submission | Pending — initiate immediately post-CSRF fix |
| Offline USB installer package | Not built — needs Tier 2 stable first |
| Amharic ops runbook | English done, translation pending |
| Data residency compliance letter | Not drafted |
| Government LOI / pilot MOU | Not started |

USB delivery model (already supported by docker-build.yml):
```bash
docker pull ghcr.io/daps-analytics/onekof-web:v1.0.0
docker save ghcr.io/daps-analytics/onekof-web:v1.0.0 | gzip > onekof-web-v1.0.0.tar.gz
# Ship on USB with docker-compose.prod.yml, Caddyfile, .env.production template
```

---

## Migration Sequence (Verified Order)

Do not begin this sequence until BUG-1 through BUG-4 are fixed and a test run
on a cheap VM (not the EthioTelecom machine) has completed successfully.

```
1.  Fix BUG-1: pgvector image in docker-compose.prod.yml
2.  Fix BUG-2: Caddyfile wildcard + DNS-01 + Caddy Cloudflare module
3.  Fix BUG-4: Re-enable CSRF enforcement in middleware.ts
4.  Fix BUG-6: Add BLOB_ENCRYPTION_KEY to .env.example
5.  Fix BUG-7: Add GHCR pull auth to setup-tier2-server.sh
6.  Fix BUG-8: Add caddy log volume to docker-compose.prod.yml
7.  Tag v1.0.0 → triggers docker-build.yml → image published to GHCR (BUG-3)
8.  Smoke test on a throwaway $5 VM using docker-compose.tier-sim.yml
        → Boot must succeed before touching EthioTelecom machine
9.  Register onekof.et domain (EthioTelecom / ETHIO-NET)
10. Provision EthioTelecom VM (Ubuntu 22.04, 4 vCPU, 8 GB RAM, 100 GB SSD)
11. Run setup-tier2-server.sh (Docker install + docker login to GHCR)
12. Create .env.production on VM from template
13. docker compose -f docker-compose.prod.yml pull
14. docker compose -f docker-compose.prod.yml up -d
15. prisma migrate deploy inside container (15 migrations)
16. Configure Cloudflare DNS: A * → VM IP, DNS Only
17. Verify Caddy issues wildcard cert via DNS-01
18. Run tier-2-runbook.md smoke test checklist
19. pg_dump from Supabase → pg_restore into Tier 2 postgres container
20. Configure Resend for @onekof.et email domain
21. Submit INSA certification
22. Build offline USB installer for Tier 1
```

---

## Key Architecture Gaps (Not Bugs, But Phase 2 Risks)

**Multi-schema tenant isolation is aspirational, not implemented.**
The schema declares `previewFeatures = ["multiSchema"]` and the architecture doc
describes schema-per-tenant isolation. In reality all data is in the `public` schema.
This is fine for current scale, but the feature that distinguishes Tier 1 data
sovereignty is not yet built.

**Connection pooling is missing.**
For Vercel serverless (Tier 3), `DATABASE_URL` should point to PgBouncer/Supabase
connection pooler (port 6543), and `DIRECT_URL` to the raw connection (port 5432).
The current setup uses Upstash Redis for rate limiting but no connection pooling
for the database. This will become a bottleneck around 50-100 concurrent users.
Prisma Accelerate or pgBouncer should be configured before public launch.

**No automated backup for Tier 2.**
`scripts/backup-database.sh` exists but is not scheduled anywhere in the Docker
setup. Add a cron entry to `setup-tier2-server.sh` or a backup sidecar container.

**Supabase free tier.**
7-day backup retention, no PITR. Upgrade to Pro ($25/mo) before first paying customer.

---

## What This Audit Can and Cannot Guarantee

CAN guarantee (read directly from source files):
- The bugs listed above exist exactly where described
- The unit tests pass (204/204 confirmed by running vitest)
- The CI/CD workflows are syntactically correct

CANNOT guarantee without live stack testing:
- Whether there are additional bugs not visible in static analysis
- Whether getTenantClient is called in hot paths (may not be used yet)
- Whether the GHCR image will be private or public after first publish
- End-to-end latency, connection pool behavior under load

**Recommended validation before Phase 2 begins:**
Run `docker-compose.tier-sim.yml` on a test machine and complete the full
signup → org create → project create → file upload → subdomain routing flow.
That test is the ground truth. This document is the map; the running stack is the territory.

---

**Document owner:** Oli T. Oli / DAPS Analytics
**Next review:** After Tier 2 test deploy completes
**Source:** Static analysis of repo at commit HEAD, 2026-07-02
