# Ethio Telecom Cloud Infrastructure — Briefing for Co-Founders

**Prepared by:** Oli Tamrat Oli (CTO, DAPS Analytics PLC)
**Date:** July 22, 2026
**Purpose:** Evaluate Ethio Telecom cloud offerings against Onekof PM deployment requirements and agree on a migration plan before updating the architecture document.

---

## 1. Context

Onekof PM received INSA certification on July 3, 2026 (valid 6 months, expires ~January 2027). To serve Ethiopian government institutions, we must deploy on sovereign infrastructure — Ethio Telecom's cloud (branded as Elastic Cloud Server / ECS). This document summarizes what Ethio Telecom offers, what we need, the gap analysis, and three deployment options for co-founder decision.

Our Docker image `ghcr.io/olitamrat/onekof-web:1.0.0` was built and published today (July 22, 2026). The deployment pipeline (`deploy-et.sh`, CI/CD, Caddyfile, backup scripts) is complete and tested.

---

## 2. What Ethio Telecom Offers

Source: https://myportal.ethiotelecom.et/cart.php?gid=35

All plans are **semi-annual (6-month) billing only** — no monthly option. All plans include:
- 30GB SSD OS storage (Ubuntu — no license cost)
- Dedicated public IP (EIP) — except the two cheapest plans which use shared proxy
- Weekly overwritten backup (1 copy)
- SSH access
- 24/7 basic support via ETZCloudSupport@ethiotelecom.et

### 2.1 RAM Optimized Servers (CSRAMOPT) — Best for Database Workloads

| SKU | vCPU | RAM | Data SSD | Bandwidth | ETB / 6 months | ~ETB / month | ~USD / month |
|-----|------|-----|----------|-----------|----------------|--------------|--------------|
| CSRAMOPT09 | 8 | 64 GB | 50 GB | 8 Mbps | 259,741 | 43,290 | ~346 |
| CSRAMOPT08 | 8 | 64 GB | 50 GB | 4 Mbps | 250,573 | 41,762 | ~334 |
| CSRAMOPT07 | 8 | 64 GB | 50 GB | 2 Mbps | 242,641 | 40,440 | ~324 |
| CSRAMOPT06 | 4 | 32 GB | 50 GB | 8 Mbps | 116,215 | 19,369 | ~155 |
| CSRAMOPT05 | 4 | 32 GB | 50 GB | 4 Mbps | 107,047 | 17,841 | ~143 |
| CSRAMOPT04 | 4 | 32 GB | 50 GB | 2 Mbps | 99,115 | 16,519 | ~132 |
| CSRAMOPT03 | 2 | 16 GB | 25 GB | 8 Mbps | 77,302 | 12,884 | ~103 |
| CSRAMOPT02 | 2 | 16 GB | 25 GB | 4 Mbps | 68,134 | 11,356 | ~91 |
| CSRAMOPT01 | 2 | 16 GB | 25 GB | 2 Mbps | 60,202 | 10,034 | ~80 |

### 2.2 CPU Optimized Servers (CSCPUOPT) — Best for Compute-Heavy Workloads

| SKU | vCPU | RAM | Data SSD | Bandwidth | ETB / 6 months | ~ETB / month | ~USD / month |
|-----|------|-----|----------|-----------|----------------|--------------|--------------|
| CSCPUOPT18 | 32 | 64 GB | 50 GB | 8 Mbps | 345,730 | 57,622 | ~461 |
| CSCPUOPT17 | 32 | 64 GB | 50 GB | 4 Mbps | 336,562 | 56,094 | ~449 |
| CSCPUOPT16 | 32 | 64 GB | 50 GB | 2 Mbps | 328,630 | 54,772 | ~438 |
| CSCPUOPT15 | 16 | 32 GB | 50 GB | 8 Mbps | 201,348 | 33,558 | ~268 |
| CSCPUOPT14 | 16 | 32 GB | 50 GB | 4 Mbps | 192,180 | 32,030 | ~256 |
| CSCPUOPT13 | 16 | 32 GB | 50 GB | 2 Mbps | 184,248 | 30,708 | ~246 |
| CSCPUOPT12 | 8 | 16 GB | 50 GB | 8 Mbps | 116,215 | 19,369 | ~155 |
| CSCPUOPT11 | 8 | 16 GB | 50 GB | 4 Mbps | 107,047 | 17,841 | ~143 |
| CSCPUOPT10 | 8 | 16 GB | 50 GB | 2 Mbps | 99,115 | 16,519 | ~132 |
| CSCPUOPT09 | 4 | 8 GB | 50 GB | 8 Mbps | 75,113 | 12,519 | ~100 |
| CSCPUOPT08 | 4 | 8 GB | 50 GB | 4 Mbps | 65,945 | 10,991 | ~88 |
| CSCPUOPT07 | 4 | 8 GB | 50 GB | 2 Mbps | 58,013 | 9,669 | ~77 |
| CSCPUOPT06 | 2 | 4 GB | 25 GB | 8 Mbps | 46,745 | 7,791 | ~62 |
| CSCPUOPT05 | 2 | 4 GB | 25 GB | 4 Mbps | 37,577 | 6,263 | ~50 |
| CSCPUOPT04 | 2 | 4 GB | 25 GB | 2 Mbps | 29,645 | 4,941 | ~40 |
| CSCPUOPT03 | 1 | 2 GB | 25 GB | 8 Mbps | 36,306 | 6,051 | ~48 |
| CSCPUOPT02 | 1 | 2 GB | 30 GB | 4 Mbps | 27,138 | 4,523 | ~36 |
| CSCPUOPT01 | 1 | 2 GB | 30 GB | 2 Mbps | 19,206 | 3,201 | ~26 |

*USD estimates at ~125 ETB/USD (July 2026 parallel rate). Official NBE rate may differ.*

---

## 3. What Onekof PM Requires

Onekof PM runs as a Docker stack with four containers:

| Container | Role | Resource Profile |
|-----------|------|-----------------|
| **onekof-web** | Next.js 14 standalone (Node.js) | CPU-moderate, 1-2 GB RAM |
| **postgres** | PostgreSQL 15 (with pgvector) | RAM-heavy (query cache, connections), disk I/O |
| **redis** | Session cache, rate limiting | Light (~128 MB) |
| **caddy** | Reverse proxy, auto-TLS | Light (~64 MB) |

### Minimum Production Requirements

| Resource | Minimum | Comfortable | Arch Doc (Original) |
|----------|---------|-------------|-------------------|
| vCPU | 2 | 4 | 8 |
| RAM | 8 GB | 16-32 GB | 32 GB |
| OS Disk | 30 GB | 30 GB | 100 GB |
| Data Disk | 25 GB | 50 GB | 500 GB |
| Bandwidth | 2 Mbps | 4 Mbps | Not specified |
| Public IP | Required | Required | Required |

### Why RAM Matters More Than CPU

Onekof is a database-backed web application, not a compute-intensive workload. PostgreSQL performance scales primarily with RAM (buffer cache, sort memory, connection pooling). Next.js server-side rendering is moderate CPU. **RAM-optimized plans are the correct choice**, not CPU-optimized.

---

## 4. Gap Analysis — Ethio Telecom vs. Our Requirements

| Requirement | Arch Doc Spec | Ethio Telecom Reality | Gap |
|-------------|---------------|----------------------|-----|
| **Prod vCPU** | 8 cores | 4 or 8 available | 4c/32GB exists, 8c only with 64GB (overkill) |
| **Prod RAM** | 32 GB | 32 GB or 64 GB | Exact match at 32GB tier |
| **Prod Data Disk** | 500 GB SSD | 50 GB SSD max | **Critical gap** — must ask about EVS add-ons |
| **Staging VM** | 4c / 16 GB | 2c/16GB closest | Minor — 2c is fine for staging |
| **Staging Data Disk** | 200 GB SSD | 25 GB SSD max | **Same storage gap** |
| **Billing** | Monthly | Semi-annual only | 6-month minimum commitment |
| **Backup** | Daily pg_dump, 7-day retention | Weekly overwrite, 1 copy | **Our backup-db.sh script fills this gap internally** |
| **OS** | Ubuntu 24.04 LTS | Not specified (likely available) | Confirm with support |

### Storage: The Real Constraint

50 GB data SSD is the maximum available in the self-service portal. At launch this is workable:

| Usage | Estimated Size |
|-------|---------------|
| Docker images (4 containers) | ~2 GB |
| PostgreSQL data (early stage, <50 orgs) | ~2-5 GB |
| Daily backup archive (7 days) | ~5-10 GB |
| Uploaded documents (Vercel Blob in Tier 3, local in Tier 2) | ~5-15 GB |
| OS and logs | ~5 GB |
| **Total estimate at launch** | **~20-35 GB** |

50 GB works for the first 6-12 months. Beyond that, we need to contact Ethio Telecom about additional EVS (Elastic Volume Service) block storage, which is almost certainly available but not listed on the self-service portal.

**Action item:** Email ETZCloudSupport@ethiotelecom.et to ask about:
1. Additional EVS volume pricing (100GB, 200GB, 500GB options)
2. Whether Ubuntu 24.04 LTS is available as an OS image
3. Whether custom security group / firewall rules can be configured

---

## 5. Three Options for Co-Founder Decision

### Option A: Lean Launch — Single Production VM (Recommended)

| Component | Where | SKU | Cost / 6 months |
|-----------|-------|-----|-----------------|
| **Production** | Ethio Telecom ECS | CSRAMOPT05 (4c/32GB/50GB/4Mbps) | 107,047 ETB |
| **Staging** | Vercel (existing, free tier) | — | 0 ETB |
| **Tier 3 (Global)** | Vercel + Supabase (existing) | — | ~$20/mo (Supabase Pro) |
| **Total new cost** | | | **107,047 ETB / 6 months (~$856)** |

**Pros:**
- Lowest cost, fastest to deploy
- Staging already works on Vercel — no setup time
- 32 GB RAM is generous for launch
- Full data sovereignty on production (see Section 6)

**Cons:**
- Only 4 vCPU (sufficient for <500 concurrent users)
- 4 Mbps bandwidth (sufficient for internal gov users, not public-facing high traffic)
- No dedicated staging in Ethiopia

---

### Option B: Two-VM Setup — Production + Staging in Ethiopia

| Component | Where | SKU | Cost / 6 months |
|-----------|-------|-----|-----------------|
| **Production** | Ethio Telecom ECS | CSRAMOPT06 (4c/32GB/50GB/8Mbps) | 116,215 ETB |
| **Staging** | Ethio Telecom ECS | CSRAMOPT01 (2c/16GB/25GB/2Mbps) | 60,202 ETB |
| **Tier 3 (Global)** | Vercel + Supabase (existing) | — | ~$20/mo |
| **Total new cost** | | | **176,417 ETB / 6 months (~$1,411)** |

**Pros:**
- Full sovereignty on both production and staging
- Staging mirrors production environment exactly
- 8 Mbps on production for better performance

**Cons:**
- 65% more expensive than Option A
- Staging VM will be idle most of the time
- Both VMs still limited to 50 GB / 25 GB data storage

---

### Option C: Maximum Spec — Closest to Original Architecture Document

| Component | Where | SKU | Cost / 6 months |
|-----------|-------|-----|-----------------|
| **Production** | Ethio Telecom ECS | CSRAMOPT08 (8c/64GB/50GB/4Mbps) | 250,573 ETB |
| **Staging** | Ethio Telecom ECS | CSRAMOPT02 (2c/16GB/25GB/4Mbps) | 68,134 ETB |
| **Tier 3 (Global)** | Vercel + Supabase (existing) | — | ~$20/mo |
| **Total new cost** | | | **318,707 ETB / 6 months (~$2,550)** |

**Pros:**
- Maximum headroom — 8 CPU, 64 GB RAM handles thousands of users
- Room for future services (AI processing, reporting engine)
- Matches the ambition of the architecture document

**Cons:**
- 3x the cost of Option A with zero paying customers today
- 64 GB RAM is overkill at launch
- Storage gap remains the same (50 GB max)

---

## 6. The Staging-on-Vercel Question: Data Sovereignty Impact

This is the most important architectural decision in this document.

### What "Data Sovereignty" Means for Onekof

INSA certification and Ethiopian government procurement require that **production data belonging to government organizations stays on Ethiopian soil**. This means:

- Real user accounts, projects, issues, budgets, documents of government tenants → must be in Ethiopia
- The production database, file storage, and backups → must be on Ethio Telecom ECS (or equivalent Ethiopian infrastructure)

### What Staging Is

Staging is a **testing environment** used by DAPS Analytics developers to verify code changes before deploying to production. It contains:

- Synthetic test data (fake organizations, fake users, fake projects)
- No real government data
- No real customer data
- No personally identifiable information of real users

### Does Staging on Vercel Violate Data Sovereignty?

**No.** Here is why:

| Concern | Analysis |
|---------|----------|
| **Real government data on Vercel?** | No. Staging uses only synthetic/demo data. Real government tenants are created only on the Ethio Telecom production instance. |
| **INSA certification scope** | INSA certified the application code and security posture, not the hosting location of a test environment. The certification applies to the production deployment. |
| **Separation guarantee** | Production (onekof.et) and staging (onekof.com or staging.onekof.com) are completely separate databases, separate servers, separate credentials. There is zero data flow between them. |
| **Industry standard** | Every cloud-deployed government system globally (AWS GovCloud, Azure Government) uses non-sovereign staging environments during development. The sovereignty requirement applies to production data. |
| **If a government client asks** | We can truthfully state: "Your production data is hosted exclusively on Ethio Telecom infrastructure in Addis Ababa. Our development testing environment is separate and contains no real data." |

### When Would We Need Staging in Ethiopia?

Staging should move to Ethio Telecom ECS only if:

1. A government contract **explicitly requires** that even test environments be on sovereign infrastructure (unlikely but possible for classified/military work)
2. We need to test Ethio Telecom-specific configurations (DNS, firewall rules, network latency) that cannot be simulated on Vercel — this would be a temporary need, not permanent
3. We have enough revenue to justify the cost (Option B adds ~60K ETB / 6 months)

### Recommendation

**Start with Option A (staging on Vercel)** and migrate staging to Ethiopia only when contractually required or financially justified. This saves ~60,000 ETB in the first 6 months — money better spent on sales, marketing, or the first hire.

---

## 7. Migration Timeline

Assuming Option A is approved and VM is ordered:

| Phase | Timeline | What Happens |
|-------|----------|-------------|
| **Order** | Day 0 | Order CSRAMOPT05 via myportal.ethiotelecom.et. Email support about EVS storage add-ons and Ubuntu 24.04. |
| **Provisioning** | Day 1-7 | Ethio Telecom provisions VM, assigns EIP, provides SSH credentials. |
| **Setup** | Day 8 | SSH in → OS hardening → Docker install → `docker login ghcr.io` → pull `onekof-web:1.0.0` |
| **Configure** | Day 9 | Create `.env.production` with all secrets. Run `deploy-et.sh --online`. |
| **DNS** | Day 9 | Point `onekof.et`, `www.onekof.et`, `*.onekof.et` A records to EIP. Caddy auto-provisions TLS. |
| **Verify** | Day 10-11 | Full E2E testing: auth, multi-tenant subdomains, i18n, billing demo, file upload, backup cron. |
| **Go Live** | Day 12 | First government/NGO tenant onboarded. Monitor 48 hours. |
| **Golden Image** | Day 14 | Capture IMS snapshot for disaster recovery. |

**Total: ~2 weeks from order to go-live.**

---

## 8. Ongoing Costs Summary (Option A)

| Item | Cost | Frequency |
|------|------|-----------|
| Ethio Telecom CSRAMOPT05 | 107,047 ETB (~$856) | Every 6 months |
| Vercel Pro (Tier 3 + Staging) | $20/mo | Monthly |
| Supabase Pro (Tier 3 database) | $25/mo | Monthly |
| onekof.et domain renewal | ~2,000 ETB | Annual |
| **Total annual** | **~$2,252 USD + 216,094 ETB** | |

For context: A single Monday.com license for 100 government users would cost ~$9,600/year. Our entire infrastructure costs less than 25% of that.

---

## 9. Decisions Needed from Co-Founders

1. **Which option?** A (single VM, ~107K ETB/6mo), B (two VMs, ~176K ETB/6mo), or C (max spec, ~319K ETB/6mo)?

2. **Staging location:** Accept Vercel for staging (no sovereignty impact on production data), or require both environments in Ethiopia?

3. **Storage:** Approve contacting ETZCloudSupport@ethiotelecom.et about additional EVS volume pricing?

4. **Timing:** Order the VM now (July 2026) to maximize the INSA certification window, or wait for a specific trigger (e.g., first signed government LOI)?

5. **Budget source:** Which DAPS Analytics account covers the semi-annual payment?

---

## 10. Available Add-On Services

### 10.1 ETZ-Backup (Add-on for Cloud/SaaS subscribers)

All plans cover up to 100GB SSD. For more than 100GB, subscribe to multiple plans.

| Tier | Frequency | Retention | ETB / 6 months | ~ETB / month |
|------|-----------|-----------|----------------|--------------|
| Weekly | Every weekend | 4 copies (4 weeks) | 11,695 | ~1,949 |
| Daily | Every day | 7 copies (7 days) | 19,768 | ~3,295 |
| Hourly | Every hour | 12 copies (12 hours) | 33,224 | ~5,537 |

**Our assessment:** Not needed at launch. Our `backup-db.sh` script already runs daily pg_dump at 03:00 EAT with 7-day rolling retention — covering the only irreplaceable data (PostgreSQL). Docker images can be re-pulled from ghcr.io, and the VM can be rebuilt with `deploy-et.sh` in under an hour. ETZ Daily Backup provides full VM snapshot recovery, which is a nice-to-have for disaster recovery but costs 19,768 ETB / 6 months. Consider adding when real customer data is at risk.

### 10.2 Cloud Firewall (Add-on for Cloud/Bare Metal subscribers)

These are dedicated firewall appliance servers, not software on your VM.

| Tier | Specs | Key Features | ETB / 6 months | ~ETB / month |
|------|-------|-------------|----------------|--------------|
| Standard | 2 CPU, 4GB RAM, 30GB SSD, 2Mbps | 4 IPSec/WireGuard VPN, 2 OpenVPN, NAT, traffic monitoring, packet capture | 30,199 | ~5,033 |
| Premium | 4 CPU, 8GB RAM, 50GB SSD, 4Mbps | Unlimited IPSec/WireGuard VPN, unlimited OpenVPN, NAT, traffic monitoring, packet capture, 3rd-party security integration | 59,858 | ~9,976 |

**Our assessment:** Not needed at launch. Caddy handles TLS termination, our INSA-hardened middleware handles application-level security (CSRF, rate limiting, session validation), and `ufw` on the VM handles port-level firewall. VPN is not needed — SSH with key-based auth is sufficient. Only add if a government contract explicitly requires a managed firewall appliance in front of the application.

### 10.3 Other Categories (Confirmed Empty / Not Applicable)

| Category | Status |
|----------|--------|
| VPS | Empty — "Product group does not contain any visible products" |
| Virtual Private Server | Empty — no products listed |
| Bare Metal DELL PowerEdge R740 | Empty — no products listed |
| Bare Metal R730 | Available but overkill: 40 cores, 512GB RAM, 3TB SSD — ETB 1,349,309/6mo (~$10,795) |
| VAAS_Enabler | Not checked — likely video/streaming service, not relevant |

---

## 11. Why Scenario 2 is the Right Choice

The difference between Scenario 1 and Scenario 2 is **19,768 ETB per 6 months (~$26/month)** — the cost of Ethio Telecom's managed Daily Backup service.

### What our script covers vs. what it doesn't

On Tier 2 (Ethio Telecom ECS), **the VM IS the infrastructure**. Our `backup-db.sh` only protects the database:

| Data at Risk | backup-db.sh | ETZ Daily Backup |
|---|:---:|:---:|
| PostgreSQL database | Covered | Covered |
| `.env.production` (secrets, API keys) | **Not covered** | Covered |
| Docker volumes (Redis state) | **Not covered** | Covered |
| Caddy TLS certificates & config | **Not covered** | Covered |
| Local file uploads (Tier 2 stores on disk) | **Not covered** | Covered |
| OS-level config (ufw, cron, Docker) | **Not covered** | Covered |

### Recovery time difference

| | Scenario 1 (Script Only) | Scenario 2 (Managed + Script) |
|--|---|---|
| **Recovery method** | Manual: reinstall Docker, re-pull images, recreate .env from docs, reconfigure ufw, restore pg_dump | Ethio Telecom restores yesterday's full VM snapshot |
| **Estimated downtime** | 4–8 hours (requires engineer with SSH knowledge) | Minutes |
| **Who can do it** | Only a developer with full system knowledge | Any authorized person can request restore |

### The government credibility factor

When a ministry asks "What is your disaster recovery plan?" — Scenario 2 provides the winning answer:

> "We employ a dual-layer backup strategy. **Layer 1:** Ethio Telecom's managed Daily Backup service performs automated full VM snapshots with 7-day retention — managed and guaranteed by your own national telecom provider. **Layer 2:** Our application runs independent daily PostgreSQL backups with 7-day rolling retention for granular database recovery."

This demonstrates:
- **Partnership with a trusted national provider** — Ethio Telecom is a known, auditable entity
- **Professional-grade disaster recovery** — not a startup relying on scripts
- **Defense in depth** — two independent backup layers is enterprise standard
- **Accountability** — Ethio Telecom's SLA backs VM-level recovery; DAPS Analytics backs application-level recovery

### Cost in perspective

| Comparison | Cost |
|---|---|
| ETZ Daily Backup (6 months) | 19,768 ETB (~$158) |
| Monthly cost | 3,295 ETB (~$26) |
| As % of base VM cost | 18% — a standard insurance premium |
| Cost of one day of government downtime | Incalculable |

---

## 12. Total Cost Scenarios

### Scenario 1: Lean Launch

| Item | ETB / 6 months |
|------|----------------|
| CSRAMOPT05 (4c/32GB/50GB/4Mbps) — Production | 107,047 |
| Staging on Vercel (free) | 0 |
| No backup add-on (backup-db.sh only) | 0 |
| **Total** | **107,047 ETB (~$856 / 6 months, ~$143/month)** |

### Scenario 2: Lean + Managed Backup (RECOMMENDED)

| Item | ETB / 6 months |
|------|----------------|
| CSRAMOPT05 (4c/32GB/50GB/4Mbps) — Production | 107,047 |
| ETZ Daily Backup (100GB, 7-day retention) | 19,768 |
| **Total** | **126,815 ETB (~$1,015 / 6 months, ~$169/month)** |

### Scenario 3: Full 2-VM + Backup

| Item | ETB / 6 months |
|------|----------------|
| CSRAMOPT06 (4c/32GB/50GB/8Mbps) — Production | 116,215 |
| CSRAMOPT01 (2c/16GB/25GB/2Mbps) — Staging | 60,202 |
| ETZ Daily Backup (100GB, 7-day retention) | 19,768 |
| **Total** | **196,185 ETB (~$1,569 / 6 months, ~$262/month)** |

### Scenario 4: Maximum + All Add-Ons

| Item | ETB / 6 months |
|------|----------------|
| CSRAMOPT08 (8c/64GB/50GB/4Mbps) — Production | 250,573 |
| CSRAMOPT02 (2c/16GB/25GB/4Mbps) — Staging | 68,134 |
| ETZ Daily Backup | 19,768 |
| Cloud Firewall Standard | 30,199 |
| **Total** | **368,674 ETB (~$2,949 / 6 months, ~$492/month)** |

---

## 13. Summary & Next Steps

**Recommended: Scenario 2 — Lean + Managed Backup (126,815 ETB / 6 months)**

One production VM (CSRAMOPT05: 4 vCPU, 32GB RAM, 50GB SSD, 4Mbps) with Ethio Telecom's managed Daily Backup. Staging remains on Vercel (free, no sovereignty impact). Dual-layer backup strategy provides enterprise-grade disaster recovery at $169/month.

### Decisions for Co-Founder Confirmation

1. **Approve Scenario 2?** CSRAMOPT05 (107,047 ETB) + ETZ Daily Backup (19,768 ETB) = 126,815 ETB / 6 months.

2. **Staging on Vercel:** Confirm acceptance — staging uses only synthetic data, no sovereignty impact on production.

3. **Cloud Firewall:** Skip at launch. Revisit only if contractually required.

4. **Storage expansion:** Approve contacting ETZCloudSupport@ethiotelecom.et about EVS volume pricing.

5. **Timing:** Order now (July 2026) to maximize INSA certification window (expires ~January 2027)?

6. **Budget source:** Which DAPS Analytics account covers the 126,815 ETB semi-annual payment?

---

*Document prepared for internal co-founder discussion. Do not distribute externally.*
*Ethio Telecom pricing sourced from myportal.ethiotelecom.et on July 22, 2026.*
*CTO recommendation: Scenario 2 approved as best option for government-ready deployment.*
