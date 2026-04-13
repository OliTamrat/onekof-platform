# Onekof Platform — Three-Tier Federated Hosting Architecture

**Version:** 2.0 — 2026-04-12 (Wave 2)
**Author:** Oli Tamrat Oli
**Audience:** Developers, DevOps engineers, and technical evaluators

---

## 1. Architecture Overview

Onekof uses a **federated three-tier hosting model** designed to serve the Ethiopian
and East African market where data sovereignty, unreliable internet connectivity,
and government compliance requirements make pure-cloud SaaS insufficient.

A single codebase produces a single Docker image that runs identically across all
three tiers. Tier-specific behavior is controlled entirely by environment variables
at deploy time — no code branches, no conditional compilation, no separate builds.

```
                    ┌─────────────────────────────────────────┐
                    │         Single Onekof Codebase          │
                    │    (Next.js + Prisma + PostgreSQL)       │
                    └──────────────┬──────────────────────────┘
                                   │
                    ┌──────────────┼──────────────────────────┐
                    │              │                          │
              ┌─────▼─────┐ ┌─────▼─────┐ ┌─────────────────▼┐
              │  TIER 1   │ │  TIER 2   │ │     TIER 3       │
              │Government │ │ Private   │ │   Global Cloud   │
              │EthioTeleco│ │ On-Premise│ │  Vercel+Supabase │
              │   Cloud   │ │  Servers  │ │                  │
              └───────────┘ └───────────┘ └──────────────────┘
              *.gov.onekof.et  *.onekof.et    *.onekof.com
```

---

## 2. Tier Definitions

### Tier 1 — Government (EthioTelecom Cloud)

| Property | Value |
|----------|-------|
| **Domain** | `*.gov.onekof.et` |
| **Hosting** | EthioTelecom Cloud or Raxio Ethiopia data center |
| **Database** | PostgreSQL 15 (managed or self-hosted within facility) |
| **Data residency** | All data stays in Ethiopia — no replication abroad |
| **Compliance** | Ethiopian government procurement rules, data sovereignty laws |
| **Target users** | Federal ministries, regional governments, state enterprises |
| **Status** | Not yet built — requires signed government LOI before coding |

**Key env vars:**
```env
PUBLIC_HOSTS=gov.onekof.et
AUTH_COOKIE_DOMAIN=.gov.onekof.et
STORAGE_DRIVER=local-fs
APP_PLATFORM=self-hosted
```

### Tier 2 — Private On-Premise

| Property | Value |
|----------|-------|
| **Domain** | `*.onekof.et` |
| **Hosting** | Customer-owned or Olink-managed servers in Ethiopia |
| **Database** | PostgreSQL 15 (local) |
| **Data residency** | Data stays on the physical server |
| **Target users** | Private companies, NGOs, universities, banks |
| **Status** | Code-ready (Wave 1), Docker validated, runbook written |

**Key env vars:**
```env
PUBLIC_HOSTS=onekof.et,localhost
AUTH_COOKIE_DOMAIN=.onekof.et
STORAGE_DRIVER=local-fs
APP_PLATFORM=self-hosted
```

**Deployment options:**
1. **Full server** — Ubuntu 24.04 LTS, follow `docs/deployment/tier-2-runbook.md`
2. **Docker on Ubuntu** — `docker compose up` with production docker-compose
3. **Docker on Windows** — `docker compose up` with Docker Desktop (see `docs/deployment/windows-deployment-guide.md`)
4. **Pre-built USB image** — `docker load < onekof-v1.0.tar.gz` then `docker compose up` (no source code required)

### Tier 3 — Global Cloud

| Property | Value |
|----------|-------|
| **Domain** | `*.onekof.com` |
| **Hosting** | Vercel serverless (fra1 — Frankfurt, closest to Addis Ababa) |
| **Database** | Supabase PostgreSQL 15 (aws-1-eu-central-1) |
| **Data residency** | EU (GDPR-compliant region) |
| **Target users** | Diaspora organizations, international NGOs, startups |
| **Status** | Live production — current deployment |

**Key env vars:**
```env
PUBLIC_HOSTS=onekof.com
AUTH_COOKIE_DOMAIN=.onekof.com
STORAGE_DRIVER=vercel-blob
APP_PLATFORM=vercel
```

---

## 3. Environment-Driven Architecture

The core innovation is that **zero lines of runtime code differ between tiers**.
All tier-specific behavior is controlled by these environment variables:

### 3.1 Routing & Multi-Tenancy

| Variable | Purpose | Example |
|----------|---------|---------|
| `PUBLIC_HOSTS` | Base domains for subdomain extraction | `onekof.et,localhost` |
| `AUTH_COOKIE_DOMAIN` | Cookie domain for cross-subdomain SSO | `.onekof.et` |
| `NEXT_PUBLIC_SUBDOMAIN_DOMAINS` | Client-side subdomain routing | `onekof.et` |
| `NEXTAUTH_URL` | Canonical URL for auth callbacks | `https://onekof.et` |

**How subdomain routing works:**
1. Middleware reads `PUBLIC_HOSTS` env var
2. For incoming request `acme.onekof.et`, middleware strips the base host → slug `acme`
3. Slug is injected as `x-organization-slug` header
4. API routes read this header to scope all database queries to that organization
5. JWT contains user's org membership list — middleware validates the user belongs to the org

### 3.2 Storage

| Variable | Purpose | Options |
|----------|---------|---------|
| `STORAGE_DRIVER` | File storage backend | `vercel-blob`, `local-fs`, `s3` |
| `STORAGE_LOCAL_ROOT` | Local filesystem path | `/var/onekof/blobs` |
| `STORAGE_LOCAL_BASE_URL` | URL prefix for local files | `https://onekof.et/api/files` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (Tier 3 only) | `vercel_blob_...` |

**Pluggable driver architecture:**
```
StorageDriver (interface)
  ├── VercelBlobDriver  — Tier 3 (Vercel Blob)
  ├── LocalFSDriver     — Tier 1 & 2 (local disk)
  └── S3Driver           — Future (MinIO, AWS S3, Wasabi)
```

### 3.3 Runtime Detection

| Variable | Purpose | Example |
|----------|---------|---------|
| `APP_PLATFORM` | Runtime platform identifier | `vercel`, `self-hosted` |
| `APP_ENV` | Environment name | `production`, `staging` |
| `APP_REGION` | Deployment region | `fra1`, `addis-1`, `docker-local-1` |

The `getRuntimeInfo()` function in `lib/env/runtime.ts` abstracts all platform
detection. No code anywhere reads `VERCEL_*` env vars directly — everything goes
through this function.

### 3.4 Database

| Variable | Purpose | Tier 3 | Tier 1/2 |
|----------|---------|--------|----------|
| `DATABASE_URL` | Connection string | Supabase pooler (`pgbouncer=true&connection_limit=1`) | Direct PostgreSQL |
| `DIRECT_URL` | Non-pooled connection (migrations) | Supabase direct | Same as DATABASE_URL |

**Organization-level hosting tier:**
Each organization record has a `hostingTier` field (`GLOBAL_CLOUD`, `PRIVATE_ONPREM`,
`GOV_ETHIOTELECOM`). This is metadata for billing/compliance — it does NOT control
routing or behavior. All routing is environment-driven.

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
User → Browser → Subdomain (acme.onekof.et)
  → Middleware: extract slug, check JWT, verify org membership
  → NextAuth: JWT strategy, bcrypt password verification
  → Cookie: scoped to AUTH_COOKIE_DOMAIN (.onekof.et)
  → Session: contains user ID + organization memberships with roles
```

### 4.2 Tenant Isolation (Wave 2)

**Middleware layer (edge):**
- Extracts org slug from subdomain
- Decodes JWT to get user's org membership list
- If user is not a member of the subdomain's org → redirect to `/select-organization`
- Prevents cross-tenant URL manipulation

**API layer (server):**
- `buildProjectAccessFilter()` scopes all project/issue queries by org
- Project visibility levels: PUBLIC, INTERNAL, PRIVATE, CONFIDENTIAL
- RBAC roles: OWNER, ADMIN, MEMBER, VIEWER, CONTRACTOR

**Database layer:**
- All queries include `organizationId` in WHERE clause
- No shared tables between organizations (single-database, schema-filtered)

### 4.3 Security Hardening (Wave 2)

| Feature | Implementation |
|---------|---------------|
| Admin login | bcrypt hash comparison (12 rounds) |
| User login | bcrypt + progressive account lockout (5 attempts → 15/30/60/240/1440 min) |
| Rate limiting | Redis-backed (Upstash) with in-memory fallback |
| Debug routes | Blocked in production via middleware (404) |
| Security headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Session cookies | HttpOnly, Secure, SameSite=Lax, domain-scoped |

---

## 5. Deployment Pipeline

### 5.1 Docker Image Distribution

```
Developer machine                    Target server
┌──────────────────┐                ┌──────────────────┐
│ docker build     │                │ docker load      │
│ docker save      │──── USB ──────▶│ docker compose   │
│ (300 MB .tar.gz) │   or network   │ up -d            │
└──────────────────┘                └──────────────────┘
```

**No source code leaves the build machine.** The Docker image contains only:
- Compiled Next.js standalone server
- Traced node_modules (only runtime dependencies)
- Static assets (CSS, JS bundles, images)
- Prisma client + migration files

### 5.2 Database Initialization

On a fresh deployment:
1. `prisma migrate deploy` — applies all schema migrations
2. `prisma db seed` — creates initial admin user and demo data
3. Application serves on port 3000

### 5.3 Image Tagging Convention

```
onekof-web:latest          — current build
onekof-web:v1.0.0          — release version
onekof-web:v1.0.0-tier2    — tier-specific validation tag
onekof-web:sha-abc1234     — commit-specific build
```

---

## 6. Cross-Tier Data Flow

**By design, data does NOT flow between tiers.** Each tier is an independent
deployment with its own database. This ensures:

- **Data sovereignty:** Government data never leaves Ethiopian infrastructure
- **Compliance:** Each tier can be audited independently
- **Resilience:** Tier 3 outage does not affect Tier 1/2 operations

**Future (Wave 3):** Encrypted cold backups from Tiers 1/2 can be pushed to
Vercel Blob / Supabase Storage as disaster recovery. This is one-way, encrypted,
and controlled by the tier operator.

---

## 7. Network Topology

### Tier 1/2 (Self-Hosted)

```
Internet
  │
  ▼
[Caddy / Nginx Reverse Proxy]  ← TLS termination (Let's Encrypt or .et CA)
  │
  ├──▶ :3000  Onekof Web (Docker)
  │
  ├──▶ :5432  PostgreSQL 15 (Docker or native)
  │
  └──▶ :6379  Redis 7 (Docker or native)
```

### Tier 3 (Vercel)

```
Internet
  │
  ▼
[Cloudflare CDN + WAF]  ← SSL, DDoS protection
  │
  ▼
[Vercel Edge Network]   ← Middleware runs here
  │
  ▼
[Vercel Serverless Functions (fra1)]  ← API routes
  │
  ├──▶ Supabase PostgreSQL (eu-central-1)
  ├──▶ Upstash Redis (eu-central-1)
  └──▶ Vercel Blob Storage
```

---

## 8. Scaling Considerations

| Scenario | Tier 1/2 | Tier 3 |
|----------|----------|--------|
| **Vertical scaling** | Add RAM/CPU to server | Automatic (Vercel) |
| **Horizontal scaling** | Docker Swarm or K8s (Wave 3+) | Automatic (Vercel) |
| **Database scaling** | Read replicas, connection pooling (PgBouncer) | Supabase handles it |
| **CDN** | Cloudflare free tier in front of Caddy | Vercel Edge Network |
| **Multi-region** | Not applicable (single Ethiopian location) | fra1 only (closest to Addis) |

---

## 9. Offline / Low-Connectivity Support

Ethiopian internet infrastructure has frequent outages. The architecture handles this:

- **Tier 1/2 are fully offline-capable** — all services run locally, no cloud dependency
- **Tier 3 depends on internet** — but is for diaspora/international users who have connectivity
- **Future:** Service worker + IndexedDB for client-side offline queue (Wave 4+)

---

## 10. Version History

| Wave | Date | Changes |
|------|------|---------|
| Wave 1 | 2026-04-11 | Portability: env-driven routing, storage drivers, Dockerfile, runbook |
| Wave 2 | 2026-04-12 | Security: bcrypt admin, debug route blocking, tenant isolation, standalone Docker |
| Wave 3 | Planned | DR: encrypted backups, JWT rotation, audit logging, Redis rate limiting |
