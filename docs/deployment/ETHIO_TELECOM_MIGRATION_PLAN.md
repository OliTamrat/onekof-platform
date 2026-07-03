# Onekof PM — Ethio Telecom VM Migration Plan

**Date:** July 3, 2026
**Status:** INSA Certified (6 months, expires ~Jan 2027)
**Prepared by:** DAPS Analytics PLC

---

## Executive Summary

Onekof PM received INSA certification on July 3, 2026, valid for 6 months. This document outlines the complete migration plan from Vercel + Supabase to Ethio Telecom-provided VMs, satisfying Ethiopian data residency requirements. The platform's Docker deployment infrastructure is production-ready.

---

## 1. VM Prerequisites — Request from Ethio Telecom

### VM Specifications

Request **two VMs** (production + staging/backup):

| Resource | Production VM | Staging VM |
|---|---|---|
| vCPU | 8 cores | 4 cores |
| RAM | 32 GB | 16 GB |
| OS Disk | 100 GB SSD | 50 GB SSD |
| Data Disk | 500 GB SSD (separate mount) | 200 GB SSD |
| OS | Ubuntu Server 24.04 LTS | Ubuntu Server 24.04 LTS |
| Network | Static public IPv4 | Private or public |

### Network Requirements

**Ports open inbound:**
- 22 (SSH, IP-restricted to DAPS Analytics)
- 80 (HTTP)
- 443 (HTTPS)

**Outbound access required to:**
- `ghcr.io` — Docker image pulls
- `api.resend.com` — Transactional email
- `sentry.io` — Error tracking (optional)
- `api.chapa.co` — Ethiopian payment gateway
- `acme-v02.api.letsencrypt.org` — SSL certificate issuance
- `archive.ubuntu.com` — OS security updates

**DNS:** A record for `onekof.et` pointing to the VM public IP.

---

## 2. VM Setup & Hardening

Full procedure documented in `docs/deployment/tier-2-runbook.md` (672 lines). Summary:

1. `apt update && apt upgrade -y`
2. Install `unattended-upgrades`, `fail2ban`, `ufw`
3. SSH: disable root login, disable password auth, key-only access
4. UFW: deny all incoming, allow 22/80/443
5. Install Docker: `apt install -y docker.io docker-compose-plugin`
6. Create `onekof` user, add to docker group

---

## 3. Architecture — Production Stack

All four services run via `docker-compose.prod.yml`:

```
+-----------+     +-------------+     +------------+     +----------+
|  Caddy    | --> | Onekof Web  | --> | PostgreSQL | --> | Redis    |
| (SSL/TLS) |     | (Next.js)   |     | 15-alpine  |     | 7-alpine |
| Port 80,  |     | Port 3000   |     | Port 5432  |     | Port 6379|
| 443       |     | ~300 MB     |     | Internal   |     | Internal |
+-----------+     +-------------+     +------------+     +----------+
     |                  |
  Internet         Docker Network (onekof_prod_network)
  (public)         (internal only — DB/Redis not exposed)
```

- **Caddy:** Automatic Let's Encrypt SSL, security headers, gzip, HTTP/3
- **Onekof Web:** Next.js standalone, ~300 MB Docker image
- **PostgreSQL 15:** 70+ Prisma models, 15+ migrations
- **Redis 7:** Rate limiting, caching, session store (512 MB, LRU eviction)

---

## 4. Data Migration — Supabase to Local PostgreSQL

Since Onekof is **pre-launch** (no real customer data), use **fresh schema deployment**:

1. Start PostgreSQL via docker-compose
2. Run `prisma migrate deploy` — applies all migrations in order
3. Seed admin user and demo data

**If real data exists by migration day:**
```bash
# Export from Supabase
pg_dump --host=aws-0-us-east-1.pooler.supabase.com \
  --port=5432 --username=postgres.[ref] --dbname=postgres \
  --no-owner --no-privileges --format=custom --compress=9 \
  --file=onekof_export.dump

# Import on VM
pg_restore --host=localhost --username=onekof --dbname=onekof \
  --no-owner --no-privileges --verbose onekof_export.dump
```

---

## 5. DNS & Domain

- Register `onekof.et` through ETC (Ethiopian Telecommunications Corporation)
- DNS records: `A onekof.et → VM_IP` and `A www.onekof.et → VM_IP`
- Caddy automatically provisions Let's Encrypt SSL certificates
- If `.et` domain registration is slow, deploy with IP-based access first

---

## 6. Deployment Pipeline

### Phase 1 (July) — Manual SSH Deploy

```bash
# Tag and push (triggers Docker image build on GitHub Actions)
git tag v1.0.0 && git push origin v1.0.0

# Deploy to VM
./deploy-et.sh onekof@VM_IP v1.0.0
```

The `deploy-et.sh` script handles: image pull, pre-deploy DB backup, Prisma migrations, service restart, and health check.

### Offline Fallback (if VM can't reach ghcr.io)

```bash
OFFLINE=1 ./deploy-et.sh onekof@VM_IP v1.0.0
```

This saves the Docker image locally (~300 MB), transfers via SCP, and loads on the VM.

### Phase 2 (August+) — Automated CI/CD

`.github/workflows/deploy-et.yml` triggers automatically after Docker image builds succeed. Requires GitHub Secrets:
- `ET_VM_SSH_KEY` — SSH private key for VM access
- `ET_VM_HOST` — VM IP address or hostname
- `ET_VM_USER` — SSH username (e.g., `onekof`)

---

## 7. Environment Configuration

Key changes from Vercel to ET VM (template: `.env.production.example`):

| Variable | ET VM Value |
|---|---|
| `DATABASE_URL` | `postgresql://onekof:PASS@postgres:5432/onekof?schema=public` |
| `DIRECT_URL` | Same as DATABASE_URL |
| `NEXTAUTH_URL` | `https://onekof.et` |
| `AUTH_COOKIE_DOMAIN` | `.onekof.et` |
| `APP_PLATFORM` | `self-hosted` |
| `APP_REGION` | `et-addis-1` |
| `STORAGE_DRIVER` | `local-fs` |
| `STORAGE_LOCAL_ROOT` | `/var/onekof/blobs` |
| `REDIS_URL` | `redis://:PASS@redis:6379` |

### Secrets to Generate Fresh

```bash
NEXTAUTH_SECRET:      openssl rand -base64 32
POSTGRES_PASSWORD:    openssl rand -hex 24
REDIS_PASSWORD:       openssl rand -hex 24
BLOB_ENCRYPTION_KEY:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_SECRET:         openssl rand -hex 32
CRON_SECRET:          openssl rand -hex 32
```

### Dual-Stack Coexistence

During transition, both environments run simultaneously:
- **Vercel** serves `onekof.com` (international / demo)
- **ET VM** serves `onekof.et` (Ethiopian data-resident production)
- Separate databases, separate secrets, no shared sessions

---

## 8. External Services

| Service | Required? | Ethiopian Network Notes |
|---|---|---|
| Resend (email) | Yes | Test `curl api.resend.com` from VM; fallback: local SMTP |
| Sentry (errors) | Optional | Disable or self-host GlitchTip for data residency |
| Stripe (payments) | Demo mode OK | Not operational in Ethiopia |
| Chapa (payments) | Yes | Native Ethiopian gateway, should work well |
| Anthropic (AI) | Optional | Disable via `NEXT_PUBLIC_ENABLE_AI_FEATURES=false` |
| Let's Encrypt | Yes | If blocked, use ZeroSSL or internal CA |

---

## 9. Monitoring, Backup & DR

### Health Checks (Built-in)
- `/api/health` — Unauthenticated, returns DB connectivity + uptime
- `/api/health/detailed` — Authenticated, returns full system status

### Logging
Docker Compose configures JSON logs with rotation:
- PostgreSQL: 50 MB x 3 files
- Redis: 20 MB x 3 files
- Onekof Web: 100 MB x 5 files
- Caddy: 50 MB x 3 files + access log (100 MB roll, 7 files)

### Automated Backups
- `pg_dump` at 3:00 AM EAT daily, 7-day retention
- rsync blob directory to staging VM nightly
- Full procedure in `docs/deployment/tier-2-runbook.md` section 11

### Disaster Recovery
- **RTO:** 4 hours
- **RPO:** 24 hours (nightly backup)

---

## 10. Cutover Checklist

### Day -7: Pre-flight
- [ ] VM access confirmed (SSH + sudo working)
- [ ] Outbound connectivity tested (`curl ghcr.io`, `curl api.resend.com`)
- [ ] `.et` domain registered and DNS propagated (or IP fallback planned)
- [ ] Docker image `v1.0.0` pushed to GHCR
- [ ] `.env.production` prepared with all secrets generated

### Day -1: Staging Test
- [ ] Full deployment on staging VM
- [ ] Migrations applied, health endpoint returns 200
- [ ] SSL certificate issued by Let's Encrypt
- [ ] Test: signup, org creation, file upload/download

### Day 0: Production Go-Live
- [ ] Deploy to production VM: `./deploy-et.sh onekof@VM_IP v1.0.0`
- [ ] Verify `https://onekof.et/api/health` returns healthy
- [ ] Create admin user
- [ ] Full user flow test: signup -> org -> project -> file upload -> verify
- [ ] Enable backup timer: `systemctl enable --now onekof-backup.timer`
- [ ] Notify INSA of new deployment location (if required)

### Rollback
- **Image rollback:** Change tag in `.env.production`, `docker compose pull && up -d`
- **DB rollback:** Restore pre-deploy `pg_dump`
- **Full fallback:** Vercel + Supabase remains running on `onekof.com`

---

## 11. Timeline — July 2026

| Week | Dates | Activities |
|---|---|---|
| **Week 1** | Jul 1-4 | Submit VM specs to Ethio Telecom, begin `.et` domain registration, tag v1.0.0 |
| **Week 2** | Jul 7-11 | Receive VM access, OS hardening, Docker install, test connectivity |
| **Week 3** | Jul 14-18 | Staging deployment, full verification checklist, backup/restore test |
| **Week 4** | Jul 21-25 | Production cutover, monitoring enabled, INSA notification |
| **Week 5+** | Jul 28+ | Stabilization, automated deploy pipeline, performance tuning |

---

## 12. INSA Certification Maintenance

- **Validity:** 6 months (expires ~January 2027)
- **Renewal:** Start process at month 5 (~December 2026)
- **Audit logs:** Keep intact (`LOG_RETENTION_DAYS=30`)
- **Security fixes:** Ensure migration `20260625_insa_security_fixes` remains applied
- **Documentation:** Update submission docs with ET VM deployment details for renewal

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| VM provisioning delayed | High | Timeline slip | Start request immediately; bare-metal backup plan |
| Outbound internet blocked | Medium | External services unavailable | Test first; offline image deploy; local SMTP |
| `.et` domain registration slow | Medium | No domain for SSL | IP-based access initially |
| Let's Encrypt ACME blocked | Low | No auto-SSL | Manual cert from ZeroSSL or internal CA |
| Power outage at datacenter | Medium | Downtime | Request UPS info from Ethio Telecom |

---

## Critical Files Reference

| File | Purpose |
|---|---|
| `docker-compose.prod.yml` | Production Docker stack (4 services) |
| `.env.production.example` | Complete env var template |
| `docs/deployment/tier-2-runbook.md` | 672-line operational runbook |
| `.github/workflows/docker-build.yml` | Docker image CI pipeline |
| `.github/workflows/deploy-et.yml` | Automated SSH deploy to ET VMs |
| `deploy-et.sh` | One-command manual deploy script |
| `apps/web/Dockerfile` | Multi-stage build (~300 MB image) |
| `Caddyfile` | Reverse proxy + auto SSL + security headers |

---

*Prepared by DAPS Analytics PLC for Ethio Telecom Implementation Phase*
