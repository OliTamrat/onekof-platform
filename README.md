<div align="center">

# Onekof Platform

### Enterprise Project Management for Ethiopia & East Africa

**A self-hosted, multi-tenant workspace for planning, budgeting, and collaboration — built for data sovereignty, offline deployment, and local languages.**

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-408MB-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

[Features](#features) | [Architecture](#three-tier-architecture) | [Quick Start](#quick-start) | [Deployment](#deployment) | [Tech Stack](#tech-stack) | [Roadmap](#roadmap)

</div>

---

## About

Onekof is a **132,000+ line production platform** that combines project management, budget tracking, team collaboration, and knowledge management into a single workspace. It is the only PM tool that supports on-premise deployment in Ethiopia, 4 local languages, Ethiopian Birr, and offline operation — from a single 408 MB Docker image.

### Why Onekof Exists

International PM tools (Jira, Asana, Monday.com) cannot serve the Ethiopian market:

| Problem | International Tools | Onekof |
|---------|-------------------|--------|
| Data sovereignty | Data stored in US/EU | Data stays on your server in Ethiopia |
| Internet dependency | 100% cloud, no offline | Runs entirely offline on local hardware |
| Cost | $8-42K/year in USD | Affordable monthly/yearly plans in ETB |
| Language | English only | Amharic, Oromo, Tigrinya, Somali, English |
| Currency | USD/EUR | Ethiopian Birr (ETB) default |
| Fiscal year | January start | July start (Ethiopian fiscal year) |

---

## Features

<table>
<tr>
<td width="50%">

### Project Management
- Kanban boards with drag-and-drop
- Backlog management and sprint planning
- Gantt timeline views
- Task dependencies and linking
- 6 project types (Software, Business, Marketing, Operations, Research, Construction)
- 172 application pages

</td>
<td width="50%">

### Multi-Language (i18n)
- English (EN)
- Amharic (AM) with Ge'ez script support
- Oromo (OM)
- Tigrinya (TI) with Ge'ez script support
- Somali (SO)
- Language switcher in navigation
- Abyssinica SIL font for Ge'ez scripts

</td>
</tr>
<tr>
<td>

### Budget & Finance
- Multi-category budgets (CAPEX, OPEX)
- Real-time tracking and variance alerts
- Expense approval workflows
- Budget audit logs for compliance
- Native ETB currency throughout
- Ethiopian fiscal year (July start)

</td>
<td>

### Team Collaboration
- Organization-based workspaces
- Teams, goals, and progress tracking
- Real-time activity feeds
- Comments and mentions
- Knowledge base / Wiki with rich editing
- Department dashboards (Dev, Marketing, Ops, Research)

</td>
</tr>
<tr>
<td>

### Security (Wave 2)
- bcrypt password hashing (12 rounds)
- Progressive account lockout (5 attempts)
- JWT sessions with HTTP-only cookies
- Tenant isolation at middleware edge
- RBAC: 5 roles, 4 project visibility levels
- Redis-backed rate limiting (Upstash)
- Admin audit logging
- CSP, HSTS, X-Frame-Options headers
- Debug routes blocked in production

</td>
<td>

### Self-Hosted Deployment (Wave 1)
- Single 408 MB Docker image
- Runs on Windows, Ubuntu, or any Linux
- USB-deployable (no internet required)
- Environment-driven tier configuration
- Pluggable storage (local-fs, Vercel Blob, S3)
- Source code never exposed to clients
- Comprehensive deployment runbooks

</td>
</tr>
<tr>
<td>

### AI Document Processing
- Upload invoices, contracts, RFPs
- Automatic budget item extraction
- Vendor and milestone detection
- Confidence scoring per extraction
- Powered by Anthropic API (optional)

</td>
<td>

### Theme & Design
- Light, Dark, and System preference modes
- Ge'ez script font support in all themes
- Inter font for Latin languages
- Ethiopian calendar integration
- Responsive mobile design
- Teal (#1C8C7D) primary accent

</td>
</tr>
</table>

---

## Three-Tier Architecture

A single codebase and Docker image serves three deployment tiers with zero code changes:

```
                         Single Codebase (132,000+ lines)
                                    |
                 ----------------------------------------
                 |                  |                    |
           TIER 1              TIER 2               TIER 3
         Government         Private/On-Prem       Global Cloud
      EthioTelecom Cloud    Customer Servers     Vercel + Supabase
       *.gov.onekof.et        *.onekof.et          *.onekof.com
```

| Tier | Domain | Hosting | Data Residency | Status |
|------|--------|---------|----------------|--------|
| **Tier 1 - Government** | `*.gov.onekof.et` | EthioTelecom Cloud / Raxio | Ethiopia (government-controlled) | Planned |
| **Tier 2 - Private** | `*.onekof.et` | Customer's own server | Ethiopia (customer-controlled) | Docker-ready |
| **Tier 3 - Global** | `*.onekof.com` | Vercel serverless (fra1) | EU (Frankfurt) | Live production |

All tier-specific behavior is controlled by environment variables at deploy time:

```env
PUBLIC_HOSTS=onekof.et          # Subdomain routing base domains
AUTH_COOKIE_DOMAIN=.onekof.et   # Cross-subdomain session cookies
STORAGE_DRIVER=local-fs         # File storage backend (local-fs | vercel-blob | s3)
APP_PLATFORM=self-hosted        # Runtime platform identifier
```

> Full architecture documentation: [`docs/architecture/three-tier-federation.md`](docs/architecture/three-tier-federation.md)

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone and configure
git clone https://github.com/OliTamrat/onekof-platform.git
cd onekof-platform
cp .env.tier2.example .env

# 2. Generate a NextAuth secret and add to .env
openssl rand -base64 32

# 3. Start the full stack (Postgres + Redis + Onekof)
docker compose -f docker-compose.tier-sim.yml up -d --build

# 4. Initialize the database (first run only)
# See docs/deployment/windows-deployment-guide.md for detailed steps

# 5. Open http://localhost:3000
# Login: test@onekof.com / password123
```

### Option 2: Development (pnpm)

```bash
# Prerequisites: Node.js 20+, PostgreSQL 15+, pnpm 8+

# 1. Clone and install
git clone https://github.com/OliTamrat/onekof-platform.git
cd onekof-platform
pnpm install

# 2. Configure environment
cp apps/web/.env.example apps/web/.env
# Edit with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Set up database
pnpm exec prisma generate --schema packages/database/prisma/schema.prisma
pnpm exec prisma migrate deploy --schema packages/database/prisma/schema.prisma
pnpm exec prisma db seed --schema packages/database/prisma/schema.prisma

# 4. Start development server
pnpm run dev
```

Open **http://localhost:3000** to get started.

---

## Deployment

### Tier 3 — Vercel (Cloud)

1. Import repository to [vercel.com/new](https://vercel.com/new)
2. Framework: **Next.js** | Root Directory: **`apps/web`**
3. Add environment variables (see [`.env.tier3.example`](.env.tier3.example))
4. Deploy — auto-deploys on every push to `master`

### Tier 2 — Docker (On-Premise)

```bash
# Build the 408 MB standalone image
docker compose -f docker-compose.tier-sim.yml up -d --build

# Export for USB distribution (no source code exposed)
docker save onekof-platform-onekof-web | gzip > onekof-v1.0.tar.gz

# On target server:
docker load < onekof-v1.0.tar.gz
docker compose -f docker-compose.tier-sim.yml up -d
```

| Platform | Guide |
|----------|-------|
| Ubuntu Server | [`docs/deployment/tier-2-runbook.md`](docs/deployment/tier-2-runbook.md) |
| Windows (Docker Desktop) | [`docs/deployment/windows-deployment-guide.md`](docs/deployment/windows-deployment-guide.md) |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript 5.3 | Server-side rendering, app router |
| **Styling** | Tailwind CSS 3.4, Radix UI | Responsive design, accessible components |
| **Backend** | Next.js API Routes | Serverless-compatible REST API |
| **Database** | PostgreSQL 15, Prisma 5.22 | Type-safe ORM, automatic migrations |
| **Auth** | NextAuth.js v4 | JWT sessions, OAuth, credential auth |
| **Cache** | Redis 7 (Upstash) | Rate limiting, session caching |
| **Storage** | Pluggable (Vercel Blob / Local FS / S3) | File uploads with data sovereignty |
| **Container** | Docker (408 MB standalone) | Portable deployment, USB distribution |
| **AI** | Anthropic API (optional) | Document processing, data extraction |
| **Monitoring** | Sentry (optional) | Error tracking, performance monitoring |
| **Email** | Resend (optional) | Transactional email, invitations |

---

## Project Structure

```
onekof-platform/
|-- apps/
|   `-- web/                          # Next.js 14 application
|       |-- src/
|       |   |-- app/                  # App Router (172 pages)
|       |   |   |-- api/              # REST API routes (120+)
|       |   |   |-- admin/            # Admin panel
|       |   |   |-- auth/             # Authentication pages
|       |   |   `-- dashboard/        # Dashboard pages
|       |   |-- components/           # React components
|       |   |-- lib/
|       |   |   |-- env/              # Runtime abstraction (Wave 1)
|       |   |   |-- routing/          # Subdomain helpers (Wave 1)
|       |   |   |-- security/         # Auth, rate-limit, lockout, audit
|       |   |   `-- storage/          # Pluggable storage drivers (Wave 1)
|       |   `-- locales/              # i18n: en, am, om, ti, so
|       |-- Dockerfile                # Multi-stage standalone build
|       `-- next.config.mjs           # Standalone output config
|
|-- packages/
|   |-- database/                     # Prisma schema, migrations, seed
|   `-- config/                       # Shared ESLint, TS, Tailwind config
|
|-- docs/
|   |-- architecture/                 # Three-tier federation docs
|   |-- deployment/                   # Runbooks (Ubuntu, Windows)
|   `-- business/                     # EthioTelecom letter, strategy
|
|-- scripts/
|   |-- backup-database.sh            # Encrypted backup (GPG + SHA-256)
|   `-- generate-admin-hash.mjs       # Admin password hash generator
|
|-- docker-compose.tier-sim.yml       # Full Tier 2 stack simulation
|-- .env.tier2.example                # On-premise environment template
|-- .env.tier3.example                # Cloud environment reference
`-- PROJECT_GUIDELINES.md             # Development rules and standards
```

---

## Security

| Layer | Protection |
|-------|-----------|
| Authentication | bcrypt (12 rounds), progressive lockout, Google OAuth |
| Sessions | JWT in HTTP-only cookies, subdomain-scoped, 24h expiry |
| Tenant Isolation | JWT membership validation at middleware edge |
| Access Control | 5 roles (Owner, Admin, Member, Viewer, Contractor) + 4 visibility levels |
| Rate Limiting | Redis-backed (Upstash), per-endpoint throttling |
| Admin Audit | Every admin action logged with IP, user-agent, outcome |
| Backups | GPG-encrypted with SHA-256 checksums |
| Headers | CSP, HSTS, X-Frame-Options, XSS protection |
| Production | Debug routes return 404, source code never distributed |

---

## Roadmap

### Wave 1 — Portability (Shipped 2026-04-11)
- [x] Environment-driven multi-tier architecture
- [x] Pluggable storage drivers (local-fs, Vercel Blob, S3)
- [x] Docker multi-stage build with Tier 2 simulation
- [x] Subdomain routing via `PUBLIC_HOSTS` env var
- [x] Ubuntu deployment runbook (671 lines)
- [x] Organization hosting tier classification

### Wave 2 — Security Hardening (Shipped 2026-04-12)
- [x] Admin bcrypt password hashing
- [x] Tenant isolation at middleware edge (JWT validation)
- [x] Debug routes blocked in production
- [x] Standalone Docker output (2.6 GB to 408 MB)
- [x] Windows deployment guide
- [x] Three-tier architecture documentation

### Wave 3 — Data Retention & Audit (Shipped 2026-04-12)
- [x] UserActivity 90-day rolling retention cleanup
- [x] RateLimit table removed (Redis-only architecture)
- [x] AdminAuditLog model and route instrumentation
- [x] Encrypted backup pipeline (GPG + Shamir key split docs)

### Next — Production Readiness
- [ ] Cloudflare Full Strict SSL (requires Advanced Certificate Manager)
- [ ] Sentry error monitoring
- [ ] Mobile UX refinement
- [ ] Bulk operations (status, delete, label)
- [ ] Offline mode (service worker)
- [ ] Amharic AI task parsing (voice and text)

---

## Environment Variables

### Required

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="https://onekof.com"
```

### Tier Configuration (Wave 1)

```env
PUBLIC_HOSTS="onekof.et,localhost"
AUTH_COOKIE_DOMAIN=".onekof.et"
STORAGE_DRIVER="local-fs"
APP_PLATFORM="self-hosted"
```

### Optional Services

```env
ANTHROPIC_API_KEY=""          # AI document processing
UPSTASH_REDIS_REST_URL=""     # Production rate limiting
UPSTASH_REDIS_REST_TOKEN=""
RESEND_API_KEY=""             # Transactional email
GOOGLE_CLIENT_ID=""           # OAuth login
ADMIN_SECRET=""               # Admin panel JWT signing
ADMIN_USERS=""                # Admin credentials (bcrypt hashes)
```

> Full templates: [`.env.tier2.example`](.env.tier2.example) | [`.env.tier3.example`](.env.tier3.example)

---

## Documentation

| Document | Description |
|----------|-------------|
| [`PROJECT_GUIDELINES.md`](PROJECT_GUIDELINES.md) | Development rules, design system, security policies |
| [`docs/architecture/three-tier-federation.md`](docs/architecture/three-tier-federation.md) | Complete architecture reference |
| [`docs/deployment/tier-2-runbook.md`](docs/deployment/tier-2-runbook.md) | Ubuntu server deployment (671 lines) |
| [`docs/deployment/windows-deployment-guide.md`](docs/deployment/windows-deployment-guide.md) | Windows Docker Desktop deployment |
| [`.env.tier2.example`](.env.tier2.example) | On-premise environment template |
| [`.env.tier3.example`](.env.tier3.example) | Cloud environment reference |

---

## License

**Proprietary** -- All rights reserved.

Copyright 2026 Oli Tamrat Oli. Commercial rights held by DABS Analytics.

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software, in whole or in part, is strictly prohibited without prior written consent from the copyright holder.

EIPA Copyright Registration: Filed 2026-04-11.

---

<div align="center">

**Built for Ethiopia. Designed for real work.**

*132,000+ lines | 172 pages | 5 languages | 408 MB Docker image | 3 deployment tiers*

[Back to Top](#onekof-platform)

</div>
