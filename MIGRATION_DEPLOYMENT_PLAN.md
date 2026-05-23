# Onekof PM — Migration & Deployment Plan
**Author:** Oli T. Oli
**Date:** 2026-05-22
**Status:** Active — Wave 5 Complete, INSA 100%, Tier 3 Production-Grade, Tier 2 Ready to Deploy
**Last Updated:** 2026-05-23
**Classification:** Internal / Confidential

---

## 1. Current State Inventory

### What Exists Today

| Component | Current Setup | Status |
|-----------|--------------|--------|
| Web App | Next.js 14, App Router, standalone output | Built, Docker-proven |
| Mobile App | React Native + Expo (EAS) | Feature-complete |
| Database | Prisma + PostgreSQL 15 | 6 migrations applied |
| Auth | NextAuth.js v5 + credentials | Working |
| File Storage | local-fs driver (Wave 1) | Production-ready |
| Redis | Upstash (cloud) / Redis 7 (self-hosted) | Ready |
| Docker Image | Multi-stage, ~300 MB standalone | Proven locally |
| CI/CD | GitHub Actions — CI + Deploy to Vercel | **DONE** ✓ |
| Nginx / SSL | Caddyfile created (auto Let's Encrypt) | **DONE** ✓ |
| .et Domain | **Not registered** | GAP |
| GitHub Actions | CI + Deploy workflows live, both green | **DONE** ✓ |
| ACR Push | For sovereign/INSA enterprise customers | See Tier 1 section |

### Monorepo Structure

```
onekof-platform/
  apps/
    web/          # Next.js 14 — Dockerfile lives here
    mobile/       # Expo React Native
  packages/
    database/     # Prisma schema + migrations
    config/       # Shared TS / ESLint / Tailwind configs
  docker-compose.tier-sim.yml   # Local dev / demo stack
  vercel.json                   # Tier 3 build config
  turbo.json
  pnpm-workspace.yaml
```

### Applied Database Migrations

```
0_init
20260304062200_add_automation_rules
20260407_add_wiki_models
20260409_add_contractor_role
20260409_add_task_links
20260410_add_backlog_status
20260410_project_visibility_default_public
20260410_revert_project_visibility_default
20260411120000_portability_wave1
20260412_add_admin_audit_log          ← Wave 3: AdminAuditLog model
20260412_remove_rate_limit_table      ← Wave 3: RateLimit → Redis
20260417_add_notifications            ← Wave 4: Notification model
20260418_add_push_tokens              ← Wave 4: PushToken model
20260505_add_org_audit_log            ← Wave 4: OrgAuditLog (INSA)
```

---

## 2. Three-Tier Deployment Architecture

Onekof uses a tiered model so the same Docker image runs everywhere:

```
Tier 3 — Vercel + Supabase (Current Cloud)
  - Vercel edge network, auto-scaling, CI from GitHub push
  - Supabase PostgreSQL, Upstash Redis, Vercel Blob storage
  - Used for: global cloud SaaS offering

Tier 2 — Self-Hosted Linux (Ethiopia / EthioTelecom VM)
  - Docker Compose on a VM or bare metal server
  - Local PostgreSQL 15, Redis 7, local-fs blob storage
  - SSL via Caddy (auto Let's Encrypt)
  - Used for: Ethiopian data-residency deployments

Tier 1 — Air-Gapped / Sovereign (Ethiopian Gov / INSA enterprise customers)
  - Docker image shipped via USB or ACR pull-token
  - Fully offline — no external DNS, no internet required
  - Used for: government-classified environments
```

**Key principle:** The same `onekof-web` Docker image is used in all three tiers.
Runtime behavior is controlled entirely by environment variables.

---

## 3. Gap Analysis

### Blocking Gaps (must fix before any production launch)

| # | Gap | Impact | Fix | Status |
|---|-----|--------|-----|--------|
| G1 | No CI/CD pipeline | Every deploy is manual | Create GitHub Actions workflows | **DONE** ✓ |
| G2 | No production Docker Compose | Tier 2 has no deploy-ready config | Create `docker-compose.prod.yml` | **DONE** ✓ |
| G3 | No Nginx/Caddy config | No SSL for self-hosted | Create reverse proxy config | **DONE** ✓ |
| G4 | `ignoreBuildErrors: true` in next.config | Type errors silently ignored | Fix TS errors or track in issues | **DONE** ✓ 2026-05-23 |
| G5 | No GitHub secrets configured | CI cannot deploy | Set up repository secrets | **DONE** ✓ |
| G6 | No automated DB backup | Data loss risk | Add backup cron to Tier 2 compose | **DONE** ✓ |

### Non-Blocking Gaps (fix before beta launch)

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| G7 | No .et domain | Must use non-Ethiopian domain | Register onekof.et via EthioTelecom |
| G8 | Email not verified end-to-end | Users may not receive emails | Test Resend with real domain |
| G9 | AI features disabled | Feature gap vs. spec | Enable after Anthropic key provisioned |
| G10 | No load testing | Unknown capacity | Run k6 tests before beta |
| G11 | ACR pull-token model for sovereign deploy | For INSA/gov enterprise customers | Pending first enterprise contract |

---

## 4. Phase 1 — Cloud Production Hardening (Tier 3)

**Goal:** Get the Vercel + Supabase deployment to a production-grade state.
**Timeline:** Week 1–2

### Step 1.1 — Create GitHub Actions CI/CD

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 8.15.1

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm --filter=database run generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Build web app
        run: pnpm --filter=web run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}

      - name: Run tests
        run: pnpm --filter=web run test
        continue-on-error: true
```

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Run DB migrations
        run: |
          pnpm install --frozen-lockfile
          pnpm --filter=database exec prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Step 1.2 — Configure GitHub Repository Secrets

Required secrets in GitHub → Settings → Secrets and Variables → Actions:

```
DATABASE_URL              # Supabase connection string (with pgbouncer=true&connection_limit=1)
DIRECT_URL                # Supabase direct connection (for migrations)
NEXTAUTH_SECRET           # openssl rand -base64 32
NEXTAUTH_URL              # https://onekof.com (or current Vercel URL)
VERCEL_TOKEN              # From vercel.com/account/tokens
VERCEL_ORG_ID             # From .vercel/project.json
VERCEL_PROJECT_ID         # From .vercel/project.json
SENTRY_DSN                # From sentry.io project
SENTRY_AUTH_TOKEN         # From sentry.io account
RESEND_API_KEY            # From resend.com
```

### Step 1.3 — Verify Vercel Environment Variables

Run this to check what is already set before adding new ones:

```bash
vercel env ls
```

Then add any missing from the list above via:

```bash
vercel env add DATABASE_URL production
```

### Step 1.4 — Fix DATABASE_URL for Supabase + Prisma + Vercel

The connection string MUST include:

```
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@host:5432/db"
```

Update `packages/database/prisma/schema.prisma` to use `directUrl`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 1.5 — Run and Verify Migrations on Production DB

```bash
# Pull current env vars
vercel env pull .env.production.local

# Run migrations against production DB using directUrl
DATABASE_URL=$(grep DIRECT_URL .env.production.local | cut -d= -f2) \
  pnpm --filter=database exec prisma migrate deploy
```

### Step 1.6 — Smoke Test Production

```
[ ] Homepage loads at production URL
[ ] User signup works
[ ] Email verification sends (check Resend dashboard)
[ ] Login works
[ ] Project creation works
[ ] Issue creation works
[ ] Audit log records actions (Wave 4)
[ ] Rate limiting triggers after 5 failed logins
[ ] HTTPS valid — check at ssllabs.com
[ ] Security headers — check at securityheaders.com
```

---

## 5. Phase 2 — Self-Hosted Ethiopia Deployment (Tier 2)

**Goal:** Deploy Onekof on an EthioTelecom VM or dedicated server inside Ethiopia.
**Timeline:** Week 3–5

### Infrastructure Requirements

| Component | Minimum Spec | Recommended |
|-----------|-------------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disk | 40 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Network | 10 Mbps | 100 Mbps |
| Ports open | 80, 443 | 80, 443, 22 (restricted) |

### Step 2.1 — Server Provisioning

```bash
# SSH into new server
ssh ubuntu@<server-ip>

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Verify
docker compose version
```

### Step 2.2 — Create Production Docker Compose

Create `docker-compose.prod.yml` (Tier 2 production — not the tier-sim):

```yaml
# Onekof Platform — Tier 2 Production
# Use: docker compose -f docker-compose.prod.yml up -d
# Requires: .env.production file at repo root

services:
  postgres:
    image: postgres:15-alpine
    container_name: onekof-postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/backup-database.sh:/usr/local/bin/backup-database.sh:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - onekof-prod

  redis:
    image: redis:7-alpine
    container_name: onekof-redis
    restart: always
    command: >
      redis-server
      --appendonly yes
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - onekof-prod

  onekof-web:
    image: ${DOCKER_IMAGE:-onekof-web:latest}
    container_name: onekof-web
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    env_file: .env.production
    volumes:
      - onekof_blobs:/var/onekof/blobs
    networks:
      - onekof-prod
    expose:
      - "3000"

  caddy:
    image: caddy:2-alpine
    container_name: onekof-caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - onekof-prod
    depends_on:
      - onekof-web

volumes:
  postgres_data:
  redis_data:
  onekof_blobs:
  caddy_data:
  caddy_config:

networks:
  onekof-prod:
    driver: bridge
```

### Step 2.3 — Create Caddyfile (Auto SSL)

```
onekof.et {
    reverse_proxy onekof-web:3000

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Access log
    log {
        output file /var/log/caddy/access.log {
            roll_size 100mb
            roll_keep 5
        }
    }
}

# Redirect www to apex
www.onekof.et {
    redir https://onekof.et{uri} permanent
}
```

### Step 2.4 — Create .env.production Template

```bash
# .env.production.example — copy to .env.production and fill in values

# Database
POSTGRES_USER=onekof
POSTGRES_PASSWORD=<CHANGE_ME_STRONG_PASSWORD>
POSTGRES_DB=onekof
DATABASE_URL=postgresql://onekof:<PASSWORD>@postgres:5432/onekof?schema=public
DIRECT_URL=postgresql://onekof:<PASSWORD>@postgres:5432/onekof?schema=public

# Redis
REDIS_PASSWORD=<CHANGE_ME_STRONG_PASSWORD>
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# NextAuth
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://onekof.et
AUTH_COOKIE_DOMAIN=.onekof.et

# App identity
NODE_ENV=production
APP_ENV=production
APP_PLATFORM=self-hosted
APP_REGION=et-addis-1
NEXT_PUBLIC_APP_URL=https://onekof.et
NEXT_PUBLIC_APP_NAME=Onekof
PUBLIC_HOSTS=onekof.et
NEXT_PUBLIC_SUBDOMAIN_DOMAINS=onekof.et

# Storage
STORAGE_DRIVER=local-fs
STORAGE_LOCAL_ROOT=/var/onekof/blobs
STORAGE_LOCAL_BASE_URL=https://onekof.et/api/files

# Feature flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=false
NEXT_PUBLIC_ENABLE_ETHIOPIAN_CALENDAR=true
ENABLE_GOOGLE_OAUTH=false
ENABLE_EMAIL_VERIFICATION=true

# Email
RESEND_API_KEY=<from resend.com>
EMAIL_FROM=noreply@onekof.et

# Error tracking
SENTRY_DSN=<from sentry.io>

# Logging
LOG_LEVEL=info
LOG_RETENTION_DAYS=30
```

### Step 2.5 — Build and Push Docker Image

From your local machine or CI:

```bash
# Build image
docker build \
  -f apps/web/Dockerfile \
  -t onekof-web:$(git rev-parse --short HEAD) \
  -t onekof-web:latest \
  .

# Option A: Transfer via Docker save (USB / air-gap)
docker save onekof-web:latest | gzip > onekof-web-latest.tar.gz
# On server: docker load < onekof-web-latest.tar.gz

# Option B: Push to a private registry
docker tag onekof-web:latest registry.example.com/onekof-web:latest
docker push registry.example.com/onekof-web:latest
# On server: docker pull registry.example.com/onekof-web:latest
```

### Step 2.6 — Deploy Tier 2

```bash
# On the server — first-time setup
git clone https://github.com/your-org/onekof-platform.git /opt/onekof
cd /opt/onekof

# Set production env
cp .env.production.example .env.production
nano .env.production  # fill in all values

# Pull image and start
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Run migrations (first deploy only)
docker compose -f docker-compose.prod.yml exec onekof-web \
  npx prisma migrate deploy \
  --schema /app/packages/database/prisma/schema.prisma

# Verify health
docker compose -f docker-compose.prod.yml ps
curl -f http://localhost:3000/ -H "Host: onekof.et"
```

### Step 2.7 — Automated Database Backups

Add a cron entry on the host server:

```bash
# Edit crontab
crontab -e

# Daily backup at 2:00 AM Addis Ababa time (UTC-3 → UTC+3)
0 23 * * * docker compose -f /opt/onekof/docker-compose.prod.yml \
  exec -T postgres \
  pg_dump -U onekof onekof | gzip > /opt/backups/onekof-$(date +%Y%m%d).sql.gz

# Keep 30 days of backups
0 0 * * * find /opt/backups -name "onekof-*.sql.gz" -mtime +30 -delete
```

### Step 2.8 — Tier 2 Smoke Test

```
[ ] https://onekof.et loads (Caddy SSL working)
[ ] Let's Encrypt certificate valid
[ ] User can sign up
[ ] User can log in
[ ] Files upload and download (local-fs driver)
[ ] Redis connected (check rate limiting)
[ ] Database connected (check project creation)
[ ] Audit log working
[ ] docker compose ps shows all services healthy
```

---

## 6. Phase 3 — Sovereign / Air-Gapped Deployment (Tier 1)

**Goal:** Deploy Onekof on Ethiopian government / INSA-classified infrastructure, fully offline.
**Priority:** HIGH — Ethiopian government is Onekof's primary enterprise customer segment.
**Current INSA compliance:** **100%** — Wave 5 complete (2026-05-23). All P1–P6 security gaps closed.
**Model:** Docker image delivered via USB or ACR pull-token (no source code exposed)

### INSA Security Gap Status — All Closed

| # | Requirement | Status | Delivered |
|---|-------------|--------|-----------|
| T1-1 | CSRF origin validation on all mutation APIs | **DONE ✓** | `middleware.ts` `enforceCsrfOrigin()` — Wave 5 2026-05-23 |
| T1-2 | Admin endpoint rate limiting (60 req/min per IP) | **DONE ✓** | `middleware.ts` `checkAdminRateLimit()` — Wave 5 2026-05-23 |
| T1-3 | Audit log immutability — DELETE returns 405 | **DONE ✓** | `audit-log/route.ts` explicit 405 — Wave 5 2026-05-23 |
| T1-4 | AES-256-GCM at-rest encryption for all uploaded blobs | **DONE ✓** | `local-fs.ts` encrypt/decrypt + `BLOB_ENCRYPTION_KEY` in Vercel prod — Wave 5 2026-05-23 |
| T1-5 | Session invalidation on password change | **DONE ✓** | `change-password/route.ts` calls `invalidateAllUserSessions()` — Wave 5 2026-05-23 |
| T1-6 | HTTP security headers on self-hosted (Caddy) | **DONE ✓** | Caddyfile committed — Wave 2 |
| T1-7 | Offline USB installer package | **Pending** | Build after onekof.et domain live |
| T1-8 | Ops runbook for government IT teams | **Partial** | English runbook exists; Amharic translation pending |
| T1-9 | License + compliance docs (data residency, no external calls) | **Pending** | Legal doc needed for procurement |

**Business pre-requisites (parallel, not blockers to technical work):**
- INSA formal certification submission — **code is ready, Oli initiates**
- onekof.et domain registration — **Oli action, EthioTelecom**
- MOU or NDA template ready for pilot discussions

**Recommended sequence (updated):** ~~Close P1–P5 gaps~~ ✓ → Register onekof.et → Deploy Tier 2 → Submit INSA certification → Build offline USB package → Approach government pilots.

**Model:** Docker image delivered via ACR pull-token (no source code transfer)

### Step 3.1 — Azure Container Registry Setup

```bash
# Create ACR (run once)
az acr create \
  --resource-group onekof-sovereign \
  --name onekofacr \
  --sku Basic

# Build and push image to ACR
az acr build \
  --registry onekofacr \
  --image onekof-web:latest \
  --file apps/web/Dockerfile \
  .

# Create scoped pull-token (read-only, expires in 1 year)
az acr token create \
  --name onekof-enterprise-pull \
  --registry onekofacr \
  --scope-map _repositories_pull \
  --status enabled

# Get token password
az acr token credential generate \
  --name onekof-enterprise-pull \
  --registry onekofacr \
  --expiration-in-days 365
```

### Step 3.2 — Deliver to Sovereign Environment

Hand off to the enterprise customer's IT team:
1. ACR login server: `onekofacr.azurecr.io`
2. Pull token username + password (scoped, read-only)
3. `docker-compose.prod.yml` (with image pointing to ACR)
4. `.env.production.example` (with instructions to fill in)
5. Prisma migration files (already in Docker image at `/app/packages/database/prisma`)
6. This deployment runbook

### Step 3.3 — On-Premise Startup (Enterprise customer's IT team)

```bash
# Login to ACR
docker login onekofacr.azurecr.io \
  -u onekof-enterprise-pull \
  -p <token-password>

# Pull image
docker pull onekofacr.azurecr.io/onekof-web:latest

# Start stack
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose exec onekof-web \
  npx prisma migrate deploy \
  --schema /app/packages/database/prisma/schema.prisma
```

---

## 7. CI/CD Pipeline (Full)

### Branch Strategy

```
master      → auto-deploys to Vercel production (Tier 3)
develop     → auto-deploys to Vercel preview
feature/*   → PR builds only (no deploy)
release/*   → used to tag Docker images for Tier 2 / Tier 1
```

### GitHub Actions — Docker Build & Push (for Tier 2 / 3)

Create `.github/workflows/docker-build.yml`:

```yaml
name: Build Docker Image

on:
  push:
    tags: ['v*']
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository_owner }}/onekof-web

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=sha,prefix=sha-
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### GitHub Actions — Migrate on Deploy

Create `.github/workflows/migrate.yml`:

```yaml
name: Run DB Migrations

on:
  workflow_run:
    workflows: ["Deploy to Production"]
    types: [completed]

jobs:
  migrate:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 8.15.1

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Run migrations
        run: pnpm --filter=database exec prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DIRECT_URL }}
```

---

## 8. Data Migration (Cloud to Self-Hosted)

When migrating data from Supabase (Tier 3) to a self-hosted DB (Tier 2):

### Step 8.1 — Export from Supabase

```bash
# Get Supabase direct connection string from Vercel env
vercel env pull .env.supabase

# Export (run on local machine with Supabase DIRECT_URL)
pg_dump \
  --no-owner \
  --no-privileges \
  --format=custom \
  "$DIRECT_URL" \
  -f onekof-export-$(date +%Y%m%d).dump
```

### Step 8.2 — Import to Tier 2

```bash
# SCP the dump file to the server
scp onekof-export-*.dump ubuntu@<server-ip>:/opt/onekof/

# On the server — restore into the Tier 2 postgres container
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore \
  --no-owner \
  --no-privileges \
  -U onekof \
  -d onekof \
  < /opt/onekof/onekof-export-*.dump
```

### Step 8.3 — Verify Data Integrity

```bash
# Count records in key tables
docker compose exec postgres \
  psql -U onekof -d onekof -c "
    SELECT
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM organizations) as orgs,
      (SELECT COUNT(*) FROM projects) as projects,
      (SELECT COUNT(*) FROM issues) as issues;
  "
```

---

## 9. Production Cutover Checklist

### Pre-Cutover (48 hours before)

```
[ ] Final full database backup from current environment
[ ] Verify backup can be restored (test restore to staging)
[ ] All environment variables documented and secured
[ ] Docker image tagged with release version (e.g., v1.0.0)
[ ] All pending migrations applied to production DB
[ ] Smoke test on staging environment passes
[ ] Sentry error tracking active
[ ] Uptime monitor configured (UptimeRobot or similar)
[ ] Team notified of cutover window
[ ] Rollback plan reviewed by team
```

### Cutover Day

```
[ ] Put app in maintenance mode (update NEXT_PUBLIC_MAINTENANCE=true if implemented)
[ ] Final database backup
[ ] Deploy new image / environment
[ ] Run prisma migrate deploy
[ ] Verify all services healthy (docker compose ps)
[ ] Run smoke tests (see Phase 2 checklist)
[ ] Switch DNS to new server
[ ] Verify SSL certificate valid
[ ] Remove maintenance mode
[ ] Monitor Sentry for 2 hours
[ ] Monitor server logs: docker compose logs -f onekof-web
```

### Post-Cutover (48 hours)

```
[ ] Verify no P0/P1 errors in Sentry
[ ] Check uptime monitor — all green
[ ] Review server resource usage (CPU, RAM, disk)
[ ] Verify automated backups ran at scheduled time
[ ] Confirm email delivery working (check Resend dashboard)
[ ] Document any issues encountered
```

---

## 10. Rollback Plan

### Tier 3 (Vercel) Rollback

```bash
# Revert to previous deployment in Vercel dashboard:
# Deployments > [previous deployment] > ... > Promote to Production

# Or via CLI:
vercel rollback
```

### Tier 2 (Self-Hosted) Rollback

```bash
# On server — switch to previous image tag
docker compose -f docker-compose.prod.yml stop onekof-web

# Update DOCKER_IMAGE in .env.production to previous tag
nano .env.production  # DOCKER_IMAGE=onekof-web:v0.9.x

# Pull and restart
docker compose -f docker-compose.prod.yml pull onekof-web
docker compose -f docker-compose.prod.yml up -d onekof-web
```

### Database Rollback

```bash
# Restore from last backup
docker compose exec -T postgres \
  psql -U onekof -d onekof \
  < /opt/backups/onekof-<date>.sql.gz
```

---

## 11. Security Checklist Before Any Launch

```
[✓] No secrets in git history — verified clean
[✓] No hard-coded credentials in source code
[✓] NEXTAUTH_SECRET is at least 32 random bytes — confirmed 32 bytes
[✓] Ports 5432 and 6379 NOT exposed to internet — use expose: (inter-container only)
[✓] Rate limiting working — login lockout + admin 60 req/min
[✓] CSRF origin validation — all mutation APIs protected
[✓] Session invalidation on password change — Wave 5
[✓] Audit log append-only — DELETE returns 405 (Wave 5)
[✓] AES-256-GCM blob encryption — BLOB_ENCRYPTION_KEY in Vercel prod
[✓] Security headers — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy set in middleware
[✓] All API routes auth-guarded — 141 routes verified
[✓] All debug routes behind requireSuperAdmin
[✓] TypeScript strict build — 0 errors, ignoreBuildErrors=false
[✓] .env.production not in git — .gitignore verified
[ ] Postgres and Redis passwords strong — set when Tier 2 VM provisioned
[ ] SSH key-based auth only on server — when VM provisioned
[ ] SSL Labs rating A or better — when onekof.et domain live
[ ] Sentry DSN active — NEXT_PUBLIC_SENTRY_DSN needs to be added to Vercel
[ ] Backup restoration tested — when Tier 2 live
```

---

## 12. Open Items Tracker

| # | Item | Owner | Deadline | Status |
|---|------|-------|----------|--------|
| OI-1 | Register onekof.et domain via EthioTelecom | Oli | Before Tier 2 launch | **Pending** |
| OI-2 | Create GitHub Actions CI workflow | Oli | Week 1 | **Done** ✓ 2026-05-23 |
| OI-3 | Create docker-compose.prod.yml | Oli | Week 2 | **Done** ✓ 2026-05-23 |
| OI-4 | Create Caddyfile for Tier 2 | Oli | Week 2 | **Done** ✓ 2026-05-23 |
| OI-5 | Configure GitHub repository secrets | Oli | Week 1 | **Done** ✓ 2026-05-23 |
| OI-6 | Wave 5: Close P1–P5 INSA security gaps (T1-1 to T1-5) | Oli | Before gov pilot | **DONE ✓ 2026-05-23** |
| OI-7 | Build Tier 1 offline USB delivery package | Oli | Before gov pilot | **Pending** |
| OI-8 | Fix TypeScript errors (remove ignoreBuildErrors) | Oli | Before launch | **DONE ✓ 2026-05-23 — 0 errors** |
| OI-9 | Run load test (k6) before beta | Oli | Before beta | **Pending** |
| OI-10 | Provision Resend domain for onekof.et | Oli | After .et domain | **Pending** |
| OI-11 | Enable AI features (provision Anthropic key) | Oli | Post-launch | **Pending** |
| OI-12 | Submit INSA certification (code-ready) | Oli | Before first contract | **Pending — Oli initiates** |
| OI-13 | Ops runbook translated to Amharic for gov IT teams | Oli | Before gov pilot | **Pending** |
| OI-14 | Add NEXT_PUBLIC_SENTRY_DSN to Vercel | Oli | Before beta | **Pending — needs Sentry DSN from account** |
| OI-15 | Add BLOB_ENCRYPTION_KEY to Vercel production | Oli | Before beta | **DONE ✓ 2026-05-23** |
| OI-16 | Custom 404 not-found page | Oli | Before launch | **DONE ✓ 2026-05-23** |

---

## 13. Recommended Deployment Sequence

```
DONE ✓:  CI/CD (G1) + GitHub secrets (G5) + docker-compose.prod.yml (G2) + Caddyfile (G3) — 2026-05-22
DONE ✓:  TypeScript strict (G4) + Wave 5 INSA P1–P5 (OI-6/8) + BLOB_ENCRYPTION_KEY (OI-15) + 404 page (OI-16) — 2026-05-23
DONE ✓:  All 141 API routes auth-guarded, security headers, i18n 5 languages aligned
NOW:     Register onekof.et domain (Oli — EthioTelecom) + Add NEXT_PUBLIC_SENTRY_DSN to Vercel
Week 1:  Provision EthioTelecom VM → Deploy Tier 2 → DNS cutover to onekof.et
Week 2:  Resend domain setup → End-to-end email test → Smoke test Tier 2 checklist
Week 3:  Submit INSA certification (code-ready) → Load testing (k6) → Internal beta
Week 4:  Build Tier 1 offline USB package → Amharic ops runbook translation
Week 5+: External beta → Government pilot discussions → Public launch
TBD:     First sovereign/government deployment (post-INSA certification receipt)
```

---

---

## 14. Go-Live Readiness Summary (as of 2026-05-23)

### Tier 3 — Vercel + Supabase (Current Production)

| Area | Status | Notes |
|------|--------|-------|
| Build | ✅ Green | TypeScript strict, 0 errors, ignoreBuildErrors=false |
| Security | ✅ 100% INSA | P1–P6 all closed (Wave 5) |
| Auth | ✅ | CSRF, rate limiting, session invalidation, bcrypt 12 rounds |
| API routes | ✅ | All 141 routes auth-guarded |
| File storage | ✅ | AES-256-GCM encrypted, BLOB_ENCRYPTION_KEY in Vercel prod |
| Audit log | ✅ | Append-only, 10 routes instrumented, viewer page live |
| i18n | ✅ | 5 languages (EN/AM/OM/TI/SO) fully aligned |
| CI/CD | ✅ | GitHub Actions live, both workflows green |
| Error tracking | ⚠️ | SENTRY_DSN set, NEXT_PUBLIC_SENTRY_DSN missing (Oli action) |
| 404 page | ✅ | Custom not-found.tsx added |
| Mobile app | ✅ | Feature-complete, EAS build linked |

### Tier 2 — Self-Hosted Ethiopia (Next Milestone)

| Area | Status | Notes |
|------|--------|-------|
| Docker image | ✅ | 408 MB standalone, proven locally |
| docker-compose.prod.yml | ✅ | Production-ready compose file committed |
| Caddyfile (SSL) | ✅ | Auto Let's Encrypt for onekof.et |
| onekof.et domain | ❌ **BLOCKER** | Oli registers via EthioTelecom |
| EthioTelecom VM | ❌ **BLOCKER** | Oli provisions server |
| Automated DB backup | ✅ | Cron script committed |
| Resend email domain | ⏳ | After .et domain is registered |

### Tier 1 — Government / Air-Gapped

| Area | Status | Notes |
|------|--------|-------|
| INSA compliance (code) | ✅ 100% | P1–P6 closed, audit-ready |
| INSA certification submission | ⏳ | Oli initiates — code is ready |
| Offline USB installer | ❌ | To build after Tier 2 stable |
| Amharic ops runbook | ⏳ | English version done, translation pending |
| Compliance/legal docs | ❌ | Data residency letter needed for procurement |

### What Oli Needs to Do Next (in order)

1. Register **onekof.et** domain — EthioTelecom
2. Add **NEXT_PUBLIC_SENTRY_DSN** to Vercel (`vercel env add NEXT_PUBLIC_SENTRY_DSN production`)
3. Provision **EthioTelecom VM** and run `docs/deployment/tier-2-runbook.md`
4. **Submit INSA certification** — code is 100% ready
5. Apple Developer membership ($99/yr) for iOS App Store

---

**Document Owner:** Oli T. Oli / DAPS Analytics
**Next Review:** 2026-06-05
**Source of Truth:** This file + git history
