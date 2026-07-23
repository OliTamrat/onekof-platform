# Onekof PM — Deployment, Migration & Go-Live Roadmap
**Author:** Oli T. Oli / DAPS Analytics
**Created:** 2026-05-23
**Classification:** Internal / Confidential

---

## Executive Summary

| Milestone | Target Date | Status |
|-----------|------------|--------|
| Tier 3 CI/CD live (Vercel + Supabase) | 2026-05-23 | **DONE** |
| Wave 5 INSA security hardening | 2026-05-23 | **DONE** |
| Tier 2 server provisioned (EthioTelecom) | 2026-06-07 | Pending |
| onekof.et domain registered | 2026-06-07 | Pending |
| Tier 2 go-live (Ethiopia self-hosted) | 2026-06-14 | Pending |
| Internal beta launch | 2026-06-21 | Pending |
| INSA certification submitted | 2026-06-28 | Pending |
| External / public beta | 2026-07-05 | Pending |
| First government pilot outreach | 2026-07-12 | Pending |
| Tier 1 sovereign pilot deploy | 2026-08-01 | Pending |

---

## Part 1 — Where We Are Right Now (2026-05-23)

### Completed Infrastructure
| Component | State |
|-----------|-------|
| Next.js 14 web app | Built, standalone Docker image ~300MB |
| Prisma 5 + PostgreSQL 15 | 14 migrations applied on production DB |
| NextAuth.js v5 | Working — credentials + session management |
| CI workflow (GitHub Actions) | Green — build + type check on every push to master |
| Deploy workflow (GitHub Actions) | Green — auto-deploys to Vercel on master push |
| `docker-compose.prod.yml` | Ready for Tier 2 |
| Caddyfile (auto-SSL) | Ready for Tier 2 |
| `scripts/setup-tier2-server.sh` | Idempotent setup script ready |
| `.env.production.example` | Complete with all required keys |
| Mobile app (Expo/RN) | Feature-complete, EAS build linked |
| INSA security (P1–P6) | 100% closed — Wave 5 done today |
| EIPA copyright registration | Package submitted 2026-04-11 |

### Open External Dependencies (blockers for go-live)
| Item | Blocker | Owner |
|------|---------|-------|
| onekof.et domain | EthioTelecom IANA registration | Oli |
| EthioTelecom VM | Server procurement + SSH access | Oli |
| Resend domain verification | Needs .et domain first | Oli |
| INSA certification submission | Can submit now — all gaps closed | Oli |

---

## Part 2 — Three-Tier Deployment Architecture

```
Tier 3 — Vercel + Supabase (LIVE)
  URL:    onekof.vercel.app (current) → onekof.com (future)
  DB:     Supabase PostgreSQL + Session Pooler
  Redis:  Upstash
  Deploy: GitHub push to master → auto-deploy via Actions
  Users:  Global cloud SaaS, diaspora, international orgs

Tier 2 — Self-Hosted Ethiopia (TARGET: 2026-06-14)
  URL:    onekof.et
  Server: EthioTelecom VM (Ubuntu 22.04, 4 vCPU, 8GB RAM)
  DB:     PostgreSQL 15 container (docker-compose.prod.yml)
  Redis:  Redis 7 container
  SSL:    Caddy auto Let's Encrypt
  Users:  Ethiopian businesses preferring data residency

Tier 1 — Air-Gapped Sovereign (TARGET: 2026-08-01)
  URL:    Internal — customer's own network
  Delivery: Docker image via USB or ACR pull-token
  DB:     Customer-managed PostgreSQL
  Auth:   Isolated — no external DNS or internet required
  Users:  Ethiopian government, INSA-classified environments
```

---

## Part 3 — Week-by-Week Execution Plan

### Week 1: May 25 – May 31 — Domain + Server Prep

**Goal:** Get the physical infrastructure ordered and domain process started.

#### Day 1–2 (May 25–26): Domain Registration
```
[ ] Visit EthioTelecom office (or nic.et portal) to register onekof.et
    - Required: business registration certificate, TIN, technical contact
    - Processing time: typically 3–7 business days
[ ] While waiting — configure Vercel for custom domain in advance:
    vercel domains add onekof.et
    vercel domains add www.onekof.et
```

#### Day 2–3 (May 26–27): Server Procurement
```
[ ] Contact EthioTelecom for VM or colocation quote:
    Minimum spec: 4 vCPU / 8GB RAM / 100GB SSD / Ubuntu 22.04 LTS
    Preferred: static public IPv4, ports 80+443 open, port 22 restricted to your IP
[ ] Alternative if EthioTelecom slow: DigitalOcean Addis Ababa region (DO has
    Addis presence via Packet/Equinix) or AWS af-south-1 (Cape Town, low latency)
[ ] Confirm: root or sudo SSH access to server
```

#### Day 3–5 (May 27–29): Vercel Env Cleanup
```
[ ] Run: vercel env ls   (check for stale/duplicate vars)
[ ] Confirm these are set in Vercel (production):
    DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
    RESEND_API_KEY, SENTRY_DSN, FIELD_ENCRYPTION_KEY, BLOB_ENCRYPTION_KEY
[ ] Set NEXTAUTH_URL to production Vercel URL if not already:
    vercel env add NEXTAUTH_URL production
[ ] Tag the current working commit as v1.0.0-beta:
    git tag v1.0.0-beta && git push origin v1.0.0-beta
    (triggers docker-build.yml — pushes image to GHCR)
```

#### Day 5–7 (May 29–31): INSA Certification Package
```
[ ] Compile INSA submission package:
    - Security architecture document (extract from MIGRATION_DEPLOYMENT_PLAN.md §11)
    - Wave 4 + Wave 5 audit log (P1–P6 closure evidence)
    - Penetration test summary (or engage local firm for one)
    - Data residency confirmation (Tier 2 runs entirely in Ethiopia)
[ ] Submit to INSA via their official portal or in-person at Technology House
[ ] Expected INSA response time: 2–4 weeks
```

---

### Week 2: June 1 – June 7 — Server Setup + Smoke Test

**Goal:** Server is up, Docker stack running, Tier 2 smoke test passes.

#### Step 2.1 — SSH + Hardening (Day 1)
```bash
# From your local machine
ssh ubuntu@<server-ip>

# Harden SSH: disable password auth
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Set up UFW firewall
sudo ufw allow 22/tcp    # SSH — restrict to your IP in production
sudo ufw allow 80/tcp    # HTTP (Caddy redirects to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5432/tcp   # Postgres — never expose to internet
sudo ufw deny 6379/tcp   # Redis — never expose to internet
sudo ufw enable
```

#### Step 2.2 — Clone Repo + Run Setup Script (Day 1)
```bash
# On server
git clone https://github.com/daps-analytics/onekof-platform.git /opt/onekof
cd /opt/onekof

# Run idempotent setup script
# This installs Docker, generates secrets, starts the stack, runs migrations
bash scripts/setup-tier2-server.sh
```

#### Step 2.3 — Edit .env.production (Day 1–2)
```bash
nano /opt/onekof/.env.production

# Fill in these values (auto-generated ones are already set):
NEXTAUTH_URL=https://onekof.et
NEXT_PUBLIC_APP_URL=https://onekof.et
PUBLIC_HOSTS=onekof.et
AUTH_COOKIE_DOMAIN=.onekof.et
RESEND_API_KEY=re_xxxx           # from resend.com
SENTRY_DSN=https://xxx@sentry.io # from sentry.io

# Restart app to pick up changes
docker compose -f docker-compose.prod.yml restart onekof-web
```

#### Step 2.4 — Tier 2 Smoke Test (Day 2–3)
```
[ ] docker compose -f docker-compose.prod.yml ps  — all services healthy
[ ] curl -f http://localhost:3000/api/health       — {"status":"ok"}
[ ] curl -f http://localhost:3000/api/health/detailed — DB + Redis both ok
[ ] http://<server-ip> loads the Onekof homepage
[ ] User signup works end-to-end
[ ] User login works
[ ] Project creation works
[ ] Issue creation works
[ ] File upload works (STORAGE_DRIVER=local-fs, BLOB_ENCRYPTION_KEY set)
[ ] Audit log records actions (check /api/organizations/[id]/audit-log)
[ ] Rate limit triggers (try 4+ failed logins)
[ ] docker compose logs onekof-web — no ERR or FATAL entries
```

#### Step 2.5 — Verify Blob Encryption (Day 3)
```bash
# Upload a test file via the web UI, then check it's unreadable on disk:
ls /var/onekof/blobs/tasks/
xxd /var/onekof/blobs/tasks/<some-file>  # should show random bytes, not file content

# Download same file via UI — should render correctly (decrypted transparently)
```

---

### Week 3: June 8 – June 14 — DNS Cutover + Tier 2 Go-Live

**Goal:** onekof.et is live, SSL valid, email working.

#### Step 3.1 — onekof.et Domain Confirmed (Day 1)
```
[ ] Confirm .et domain delegation from EthioTelecom/nic.et
[ ] Set DNS A record: onekof.et → <server-ip>
[ ] Set DNS A record: www.onekof.et → <server-ip>
[ ] Set DNS MX record for Resend email sending:
    Follow Resend domain verification guide → add SPF + DKIM + DMARC TXT records
```

#### Step 3.2 — Caddy SSL (Day 1–2)
```bash
# Update Caddyfile on server with real domain
nano /opt/onekof/Caddyfile
# (it already has onekof.et — just confirm and restart)

docker compose -f /opt/onekof/docker-compose.prod.yml restart caddy

# Caddy will auto-request Let's Encrypt cert (takes ~30 seconds)
# Verify:
curl -I https://onekof.et   # should return 200 with valid SSL
```

#### Step 3.3 — SSL Verification
```
[ ] https://onekof.et loads ✓
[ ] SSL Labs grade: A or better → https://ssllabs.com/ssltest/analyze.html?d=onekof.et
[ ] Security headers: A → https://securityheaders.com/?q=onekof.et
[ ] www.onekof.et redirects to onekof.et ✓
```

#### Step 3.4 — Resend Email Domain Verification (Day 2–3)
```bash
# In Resend dashboard: Add domain → onekof.et → copy DNS records
# After DNS propagation (~1 hour):
resend domains verify onekof.et

# Test email delivery:
curl -X POST https://onekof.et/api/integrations/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "oli@dapsanalytics.com"}'
```

#### Step 3.5 — Production Data Backup (Before Any Migration)
```bash
# Take snapshot of Tier 3 (Supabase) data before cutover
vercel env pull .env.supabase --environment=production

pg_dump \
  --no-owner \
  --no-privileges \
  --format=custom \
  "$(grep '^DIRECT_URL=' .env.supabase | cut -d= -f2-)" \
  -f onekof-supabase-export-$(date +%Y%m%d).dump

# Store backup securely (not in git):
scp onekof-supabase-export-*.dump ubuntu@<server-ip>:/opt/backups/
```

#### Step 3.6 — Tier 2 Go-Live Declaration (Day 7: June 14)
```
[ ] All smoke tests passing
[ ] SSL A+ rating confirmed
[ ] Email verified and sending
[ ] Backup cron running (check: crontab -l)
[ ] Uptime monitor configured (UptimeRobot or similar — free tier works)
[ ] Sentry receiving events
[ ] Manual signup + full user journey tested end-to-end

TIER 2 IS LIVE → announce to internal team
```

---

### Week 4: June 15 – June 21 — Internal Beta

**Goal:** Real users (team + trusted partners) using the platform. Catch any production issues before public launch.

#### Beta User Onboarding
```
[ ] Create beta organization in Onekof
[ ] Invite 5–10 internal/trusted users
[ ] Create onboarding guide (1-pager: how to create project, invite team, create issue)
[ ] Set up Sentry alerts: any P0/P1 errors → email + Slack/Telegram notification
[ ] Set up uptime alert: downtime > 2 min → SMS notification
```

#### Beta Monitoring Checklist (run daily)
```
[ ] docker compose -f docker-compose.prod.yml ps — all healthy
[ ] Sentry dashboard — zero P0 errors
[ ] /api/health/detailed — DB + Redis green
[ ] Server resources: docker stats — CPU < 70%, RAM < 80%
[ ] Disk usage: df -h /var/onekof/blobs — not > 80% full
[ ] Backup completed: ls /opt/backups/ — fresh .sql.gz from last night
```

#### Load Test (Day 3–4: June 17–18)
```bash
# Install k6
sudo apt-get install k6

# Run baseline load test (50 concurrent users, 5 minutes)
k6 run --vus 50 --duration 5m - <<'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const res = http.get('https://onekof.et/api/health');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

# Pass criteria: p95 latency < 500ms, 0 errors
```

#### TypeScript Error Cleanup (Day 5–7)
```bash
# Remove ignoreBuildErrors — catch all TS errors properly
# In apps/web/next.config.mjs:
#   typescript: { ignoreBuildErrors: false }  ← change to false

cd apps/web
pnpm tsc --noEmit 2>&1 | tee ts-errors.txt | wc -l

# Fix errors one by one — most are cosmetic @types/react duplicates
# Run: pnpm dedupe  (resolves most automatically)
pnpm dedupe
pnpm tsc --noEmit  # should be 0 errors after dedupe
```

---

### Week 5: June 22 – June 28 — INSA + Public Beta Prep

**Goal:** INSA certification response received (or follow-up sent). Public beta launch ready.

#### INSA Follow-Up (Day 1–2)
```
[ ] Follow up on INSA submission sent May 30
[ ] If additional documentation requested — respond within 48 hours
[ ] Prepare INSA compliance summary (1-page executive brief for gov procurement)
[ ] Prepare data residency letter for enterprise customers:
    "All data processed by Onekof on our self-hosted Tier 2 deployment
    is stored exclusively on servers physically located within Ethiopia
    (EthioTelecom data center, Addis Ababa). No data leaves Ethiopia."
```

#### Public Beta Preparation
```
[ ] Landing page updated: onekof.et homepage with signup CTA
[ ] Pricing page (even if "Request Access" only — no public pricing yet)
[ ] Privacy Policy + Terms of Service live (already in apps/web/src/app/privacy, terms)
[ ] Contact/support email configured: support@onekof.et (forwarding to Resend inbox)
[ ] Social media accounts: LinkedIn, Telegram (primary channel in Ethiopia)
[ ] Product Hunt draft ready (for launch day)
```

#### Mobile App Submission (Day 3–5)
```bash
# Build production APK/IPA via EAS
cd apps/mobile
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android  # Google Play (needs developer account)
eas submit --platform ios      # App Store (needs Apple developer account, $99/yr)

# While store review is pending — distribute Android APK directly via:
# Telegram channel + onekof.et/download page
```

---

### Week 6: June 29 – July 5 — Public Beta Launch

**Goal:** Onekof is publicly accessible. First external signups.

#### Launch Day Checklist (July 1, 2026)
```
Pre-launch (48 hours before):
[ ] Final full database backup
[ ] Load test passes (p95 < 500ms)
[ ] All smoke tests passing
[ ] SSL A+ confirmed
[ ] Sentry active + alerting
[ ] Uptime monitor active
[ ] Mobile APK distributed via Telegram
[ ] Landing page live

Launch day:
[ ] Announce on LinkedIn (English + Amharic)
[ ] Post in Ethiopian tech Telegram groups
[ ] Send email to beta waitlist
[ ] Monitor Sentry for 4 hours continuously

Post-launch (48 hours):
[ ] Zero P0/P1 errors
[ ] First 10 external signups
[ ] Response to all support inquiries within 4 hours
[ ] Server resources under control
```

---

### Week 7–8: July 6 – July 19 — Government Pilot Outreach

**Goal:** First government organization pilot initiated.

#### Target Government Segments (Priority Order)
```
Priority 1 — Ministry of Innovation & Technology (MInT)
  - Direct relationship: MInT oversees INSA
  - Use case: project management for digital transformation initiatives
  - Contact: Director-General's office

Priority 2 — Ethiopian Investment Commission (EIC)
  - Use case: tracking investment facilitation projects
  - Contact: IT Director

Priority 3 — Commercial Bank of Ethiopia (CBE)
  - Use case: internal project/task management
  - Contact: Digital Banking division

Priority 4 — Ethio Telecom (existing infrastructure relationship)
  - Use case: infrastructure rollout project tracking
  - Contact: IT PMO
```

#### Government Pitch Package
```
[ ] 1-page executive summary (Amharic + English)
[ ] INSA compliance certificate (or submitted confirmation)
[ ] Data residency letter (data stays in Ethiopia)
[ ] Pricing: government tier — negotiated, annual contract
[ ] Reference: DAPS Analytics as local IP owner (builds trust)
[ ] Demo environment: create a "Ministry of X" demo org with sample projects
[ ] Tier 1 deployment brief: "runs fully offline in your data center"
```

---

### Week 9–12: July 20 – August 15 — Tier 1 Sovereign Deploy

**Goal:** First Tier 1 (air-gapped) deployment for a government customer.

#### Step 9.1 — Build Offline Package
```bash
# Tag release for Tier 1 delivery
git tag v1.0.0-tier1-$(date +%Y%m%d)
git push origin --tags

# GitHub Actions docker-build.yml triggers automatically — pushes to GHCR

# Pull and save image for USB delivery
docker pull ghcr.io/daps-analytics/onekof-web:v1.0.0-tier1-20260720
docker save ghcr.io/daps-analytics/onekof-web:v1.0.0-tier1-20260720 | \
  gzip > onekof-tier1-v1.0.0.tar.gz

# Verify image integrity
sha256sum onekof-tier1-v1.0.0.tar.gz > onekof-tier1-v1.0.0.tar.gz.sha256
```

#### Tier 1 USB Delivery Package Contents
```
USB drive (16GB+):
├── onekof-tier1-v1.0.0.tar.gz          # Docker image
├── onekof-tier1-v1.0.0.tar.gz.sha256   # integrity hash
├── docker-compose.prod.yml              # stack config
├── .env.production.example              # env template
├── Caddyfile                            # reverse proxy (if needed)
├── TIER1_DEPLOYMENT_RUNBOOK.md          # step-by-step for their IT team
├── TIER1_DEPLOYMENT_RUNBOOK_AM.md       # same in Amharic
└── scripts/
    └── setup-tier2-server.sh            # works for Tier 1 too (offline mode)
```

#### Tier 1 Prerequisites (Customer's IT Team)
```
Infrastructure requirements:
[ ] Ubuntu 22.04 LTS server (4 vCPU, 8GB RAM, 100GB SSD)
[ ] Docker Engine + Compose plugin installed
[ ] PostgreSQL 15 (can use the containerized version in compose)
[ ] Internal DNS record pointing to the server (e.g., onekof.internal)
[ ] Port 80/443 open internally

Onekof requirements:
[ ] INSA certification presented to customer (demonstrates compliance)
[ ] License agreement signed (DAPS Analytics commercial license)
[ ] Deployment support contract agreed (included in Tier 1 pricing)
[ ] First-year support: Oli provides remote SSH support during setup
```

#### Step 9.2 — Tier 1 Deployment (On-Site or Remote)
```bash
# Customer's IT team loads the USB and runs:
docker load < onekof-tier1-v1.0.0.tar.gz

cp .env.production.example .env.production
nano .env.production  # fill in local values

docker compose -f docker-compose.prod.yml up -d

docker compose exec onekof-web \
  npx prisma migrate deploy \
  --schema /app/packages/database/prisma/schema.prisma

# Verify:
curl http://localhost:3000/api/health
```

---

## Part 4 — Data Migration Plan (Tier 3 → Tier 2)

When a customer wants to migrate their data from the cloud (Tier 3) to self-hosted (Tier 2), follow this procedure. This does NOT affect other customers — each organization's data is isolated.

### Migration Window: ~2 hours of maintenance

#### Step M1 — Pre-Migration Backup (T-48 hours)
```bash
# From Vercel (cloud) — export the specific organization's data
vercel env pull .env.supabase --environment=production

pg_dump \
  --no-owner --no-privileges \
  --format=custom \
  --table=organizations \
  --table=organization_members \
  --table=projects \
  --table=issues \
  --table=tasks \
  --table=attachments \
  --table=comments \
  --table=goals \
  --table=documents \
  --table=wiki_pages \
  --table=audit_log \
  --table=org_audit_log \
  "$(grep DIRECT_URL .env.supabase | cut -d= -f2-)" \
  -f org-export-$(date +%Y%m%d).dump
```

#### Step M2 — Dry Run on Staging (T-24 hours)
```bash
# Restore to a staging Tier 2 environment first
docker compose exec -T postgres \
  pg_restore --no-owner --no-privileges \
  -U onekof -d onekof < org-export-*.dump

# Verify counts match source
docker compose exec postgres psql -U onekof -d onekof -c "
  SELECT
    (SELECT COUNT(*) FROM organizations) as orgs,
    (SELECT COUNT(*) FROM projects) as projects,
    (SELECT COUNT(*) FROM issues) as issues,
    (SELECT COUNT(*) FROM users) as users;
"
```

#### Step M3 — Migration Day (Maintenance Window)
```
T-60 min:  Notify affected users of maintenance window
T-30 min:  Set NEXT_PUBLIC_MAINTENANCE=true → deploy (shows maintenance page)
T-0:       Final export from Supabase (latest data)
T+10 min:  Restore to Tier 2 PostgreSQL
T+15 min:  Verify data counts match
T+20 min:  Update organization's DNS / give users new URL (onekof.et/[org-slug])
T+25 min:  Remove maintenance mode → NEXT_PUBLIC_MAINTENANCE=false → deploy
T+30 min:  User acceptance test — org admin verifies their data
T+60 min:  Decommission org data from Supabase (GDPR / data residency compliance)
```

---

## Part 5 — Rollback Plans

### Tier 3 (Vercel) Rollback
```bash
# Via CLI — instant, zero-downtime
vercel rollback

# Via dashboard:
# Vercel → Project → Deployments → [previous] → ... → Promote to Production
```

### Tier 2 (Self-Hosted) Rollback
```bash
# Switch to previous Docker image tag
docker compose -f docker-compose.prod.yml stop onekof-web

# Edit .env.production: DOCKER_IMAGE=ghcr.io/daps-analytics/onekof-web:v0.9.x
nano .env.production

docker compose -f docker-compose.prod.yml pull onekof-web
docker compose -f docker-compose.prod.yml up -d onekof-web

# If DB migration rollback needed:
docker compose exec -T postgres \
  psql -U onekof -d onekof \
  < /opt/backups/onekof-$(date +%Y%m%d --date=yesterday).sql.gz
```

### Tier 1 Rollback
- Load previous USB image: `docker load < onekof-tier1-vPREVIOUS.tar.gz`
- Customer IT team restores from their backup (runbook includes backup procedure)

---

## Part 6 — Success Metrics

### Beta Phase (Week 4–6)
| Metric | Target |
|--------|--------|
| Internal beta users | 10+ |
| Projects created | 5+ |
| Issues created | 50+ |
| P0 production incidents | 0 |
| Uptime | > 99.5% |
| Page load (p95) | < 2 seconds |
| API response (p95) | < 500ms |

### Public Beta Phase (Week 6–8)
| Metric | Target |
|--------|--------|
| Registered users | 50+ |
| Active organizations | 10+ |
| Weekly active users | 25+ |
| Email delivery rate | > 98% |
| Bug reports | < 5 P1 bugs |

### Government Pilot Phase (Week 9–12)
| Metric | Target |
|--------|--------|
| Government organizations in pilot | 1–2 |
| Tier 1 deployments | 1 |
| INSA certification status | Submitted (awaiting) |
| Enterprise contract conversations | 3+ active |

---

## Part 7 — Open Items Tracker (Updated)

| # | Item | Owner | Target | Status |
|---|------|-------|--------|--------|
| OI-1 | Register onekof.et domain | Oli | Jun 7 | **Pending — do first** |
| OI-2 | GitHub Actions CI/CD | Oli | Done | **Done** ✓ |
| OI-3 | docker-compose.prod.yml | Oli | Done | **Done** ✓ |
| OI-4 | Caddyfile | Oli | Done | **Done** ✓ |
| OI-5 | GitHub secrets | Oli | Done | **Done** ✓ |
| OI-6 | INSA P1–P5 security gaps (Wave 5) | Oli | Done | **Done** ✓ |
| OI-7 | Provision EthioTelecom VM | Oli | Jun 7 | **Pending** |
| OI-8 | Run setup-tier2-server.sh | Oli | Jun 7 | Blocked on OI-7 |
| OI-9 | Tier 2 smoke test | Oli | Jun 14 | Blocked on OI-7 |
| OI-10 | Resend domain + email test | Oli | Jun 14 | Blocked on OI-1 |
| OI-11 | INSA certification submit | Oli | May 31 | **Pending — do this week** |
| OI-12 | Remove `ignoreBuildErrors: true` | Oli | Jun 21 | Beta week |
| OI-13 | Load test (k6) | Oli | Jun 21 | Beta week |
| OI-14 | Mobile app store submission | Oli | Jun 28 | Pre-launch |
| OI-15 | Tier 1 offline USB package | Oli | Jul 20 | Gov pilot prep |
| OI-16 | Amharic ops runbook | Oli | Jul 20 | Gov pilot prep |
| OI-17 | Government pilot outreach | Oli | Jul 12 | Post-public-beta |
| OI-18 | First Tier 1 sovereign deploy | Oli | Aug 1 | Post-INSA cert |

---

## Part 8 — Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| EthioTelecom VM procurement delays | Medium | High | Use DigitalOcean/Linode as interim; migrate when ET VM ready |
| .et domain registration delays (> 2 weeks) | Medium | Medium | Launch on onekof.com interim; cut over to .et when ready |
| INSA certification takes > 6 weeks | Low | High | Start outreach in parallel; INSA cert strengthens but doesn't block gov conversations |
| Supabase free tier IPv6-only breaks future migration | Low | Medium | Session Pooler workaround already in place; upgrade plan $25/mo resolves permanently |
| Blob encryption breaks existing files on upgrade | Low | High | `decryptBlobBuffer` is backward-compatible — dev passthrough + no-op for unencrypted files |
| Load spikes overwhelm single Tier 2 VM | Low | Medium | Caddy + Next.js handle ~500 concurrent easily on 4 vCPU; add horizontal scale if needed |
| Government procurement cycle longer than expected | High | Medium | Use time to onboard commercial customers; gov revenue is a bonus, not the only path |

---

## Part 9 — Immediate Actions (This Week, May 25–31)

These are the 3 things that unblock everything else:

### Action 1 — Register onekof.et (Day 1, May 25)
Go to nic.et or EthioTelecom domain services in person. Bring:
- Commercial registration certificate
- TIN certificate
- Technical contact (your email)

### Action 2 — Submit INSA Certification (Day 2–3, May 26–27)
Compile and submit:
- This document (GO_LIVE_ROADMAP.md) + MIGRATION_DEPLOYMENT_PLAN.md as technical evidence
- Wave 4 + Wave 5 security audit summary
- EIPA registration confirmation (submitted 2026-04-11)

### Action 3 — Procurement Call with EthioTelecom (Day 3–4, May 27–28)
Request:
- 1× Ubuntu 22.04 VM: 4 vCPU / 8 GB RAM / 100 GB SSD
- Static public IPv4
- Ports 80, 443 open outbound + inbound
- Estimated: 3,000–8,000 ETB/month (negotiate annual contract)

---

**Document Owner:** Oli T. Oli / DAPS Analytics
**Next Review:** 2026-06-14 (Tier 2 Go-Live date)
**Source of Truth:** This file + git history + MIGRATION_DEPLOYMENT_PLAN.md
