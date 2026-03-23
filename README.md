<div align="center">

# Onekof Platform

### *Purpose-Built Project Management for Ethiopian Organizations*

**A unified workspace for planning, budgeting, and collaboration — designed from the ground up for Ethiopian government agencies, NGOs, and enterprises.**

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

[Features](#key-features) • [Screenshots](#screenshots) • [Installation](#quick-start) • [Documentation](#documentation) • [Roadmap](#roadmap)

</div>

---

## About Onekof

Onekof is a **unified project management platform** purpose-built for Ethiopian organizations. It brings together task management, budget tracking, team collaboration, and AI-powered document processing into a single workspace — eliminating the need for multiple disconnected tools.

Unlike general-purpose project management software built for Western markets, Onekof was designed from day one to address the specific workflows, financial structures, and operational realities of Ethiopian teams.

### What Makes Onekof Different

**Ethiopian-First Design** — Native ETB currency support, project templates aligned with Ethiopian government and enterprise workflows, and infrastructure designed for local deployment requirements.

**Unified Workspace** — Task tracking, budget management, document processing, team collaboration, and reporting in one platform. No switching between separate tools.

**AI-Powered Document Processing** — Upload invoices, contracts, and RFPs. The system automatically extracts budget items, milestones, and vendor information with confidence scoring.

**Project-Type Awareness** — Six specialized project types (Software, Business, Marketing, Operations, Research, Construction) with tailored navigation, workflows, and reporting for each.

**Multi-Tenant Architecture** — Organizations operate in isolated workspaces with subdomain routing, role-based access control, and cross-organization security boundaries.

---

## Key Features

<table>
<tr>
<td width="50%">

### Multi-Project Types
- SOFTWARE projects with code integration
- BUSINESS projects with P&L tracking
- MARKETING campaigns with analytics
- OPERATIONS with process workflows
- RESEARCH with findings documentation
- CONSTRUCTION with materials & inspections

</td>
<td width="50%">

### Comprehensive Navigation
- Dynamic navigation (11-12 tabs per project type)
- Board, List, Calendar, Timeline views
- Team, Goals, Budget, Reports pages
- Documents, Wiki, Automation
- Mobile-optimized collapsible sidebar

</td>
</tr>
<tr>
<td>

### AI Document Processing
- Upload invoices, contracts, RFPs
- Automatic budget item extraction
- Vendor and milestone detection
- Confidence scoring per extraction
- 50 documents/month on free tier

</td>
<td>

### Budget Management
- Multi-category budgets (CAPEX, OPEX, etc.)
- Real-time tracking & variance alerts
- Budget watchers & notifications
- Dashboard with financial insights
- Native ETB currency support

</td>
</tr>
<tr>
<td>

### Team Collaboration
- Organization-based workspaces
- Role-based access control (RBAC)
- Member management & invitations
- Activity tracking & audit logs
- User profiles with avatars

</td>
<td>

### Enterprise Security
- JWT authentication with OAuth support
- Soft delete with data restoration
- Full audit trail on all actions
- Organization-level data isolation
- Cross-subdomain session management

</td>
</tr>
</table>

---

## Screenshots

<table>
<tr>
<td><strong>Issue Board</strong><br/><em>Visual task management with drag-and-drop</em></td>
<td><strong>Budget Dashboard</strong><br/><em>Real-time financial tracking in ETB</em></td>
</tr>
<tr>
<td><strong>AI Document Processing</strong><br/><em>Automatic data extraction from uploads</em></td>
<td><strong>Dark Mode</strong><br/><em>Full dark theme across all components</em></td>
</tr>
</table>

> *Screenshots coming soon — platform currently in active development*

---

## Quick Start

### Prerequisites

```bash
Node.js 18+  •  PostgreSQL 14+  •  Git
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/OliTamrat/onekof-platform.git
cd onekof-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your database URL and secrets

# 4. Set up the database
cd packages/database
npx prisma generate
npx prisma db push

# 5. Start development server
cd ../..
npm run dev
```

Open **http://localhost:3000** to get started.

---

## Tech Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td>Next.js 14.1, React 18, TypeScript 5, Tailwind CSS 3.4</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Next.js API Routes, Prisma ORM, PostgreSQL</td>
</tr>
<tr>
<td><strong>AI</strong></td>
<td>Anthropic Haiku (cost-optimized document processing)</td>
</tr>
<tr>
<td><strong>Auth</strong></td>
<td>NextAuth.js v4 with JWT strategy and OAuth</td>
</tr>
<tr>
<td><strong>UI</strong></td>
<td>Radix UI primitives, Lucide Icons, custom design system</td>
</tr>
<tr>
<td><strong>State</strong></td>
<td>TanStack Query, React Hook Form, Zod validation</td>
</tr>
<tr>
<td><strong>Deployment</strong></td>
<td>Vercel (frontend), PostgreSQL (managed database)</td>
</tr>
</table>

---

## Project Structure

```
onekof-platform/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── src/
│       │   ├── app/            # Next.js 14 App Router
│       │   │   ├── api/        # API routes
│       │   │   ├── dashboard/  # Dashboard pages
│       │   │   └── auth/       # Authentication pages
│       │   ├── components/     # React components
│       │   │   ├── layouts/    # Layout components
│       │   │   ├── navigation/ # Navigation components
│       │   │   └── ui/         # UI primitives
│       │   └── lib/            # Utilities & helpers
│       └── public/             # Static assets
│
├── packages/
│   ├── database/               # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── package.json
│   └── ui/                     # Shared UI components
│
├── turbo.json                  # Turborepo config
└── package.json                # Root package.json
```

---

## Roadmap

### v0.1 — Foundation (Current)
- [x] Project-type-aware navigation (6 types)
- [x] 20+ navigation pages with consistent UX
- [x] Collapsible sidebar with 7 core categories
- [x] AI-powered document processing
- [x] Advanced budget management with ETB support
- [x] Team collaboration & RBAC
- [x] Dark mode support
- [x] Mobile responsive design

### v0.2 — Enhanced Features (In Progress)
- [ ] Ethiopian calendar (Ge'ez) toggle
- [ ] Advanced reports & analytics dashboards
- [ ] Real-time notifications system
- [ ] Email integration (invites, digests)
- [ ] File attachments with drag-and-drop
- [ ] Advanced filtering & search
- [ ] Export to Excel/PDF

### v0.3 — Localization & Scale
- [ ] Amharic language support
- [ ] Full Ethiopian calendar integration
- [ ] Local payment gateways (Chapa, Telebirr, CBE Birr)
- [ ] Custom workflow builder
- [ ] Mobile apps (iOS & Android)
- [ ] Public REST API

### v1.0 — Production Ready
- [ ] Automation & rules engine
- [ ] Custom fields & dynamic forms
- [ ] Time tracking & resource planning
- [ ] White-label deployment options
- [ ] Enterprise SSO (SAML, LDAP)

---

## Documentation

### Environment Variables

Create `apps/web/.env`:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="${DATABASE_URL}"

# Authentication (Required)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# AI Document Processing (Optional)
ANTHROPIC_API_KEY="your-api-key"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-secret"
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-secret"
```

> See [VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md) for full deployment guide.

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code

# Database commands
cd packages/database
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate Prisma client
npx prisma db push   # Push schema changes
```

---

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin master
   ```

2. **Import to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Select `onekof-platform` repository
   - Framework: **Next.js**
   - Root Directory: **`apps/web`**

3. **Configure Environment Variables**
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

4. **Deploy** — Vercel auto-deploys on every push to `master`

---

## License

**Proprietary** — All rights reserved. Copyright 2026 Onekof.

This software is proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software, in whole or in part, is strictly prohibited without prior written consent from the copyright holder.

---

## Contact

**Website:** [onekof.com](https://onekof.com)

**GitHub:** [github.com/OliTamrat/onekof-platform](https://github.com/OliTamrat/onekof-platform)

**Issues:** [github.com/OliTamrat/onekof-platform/issues](https://github.com/OliTamrat/onekof-platform/issues)

---

<div align="center">

*Built for Ethiopian teams. Designed for real work.*

**[Back to Top](#onekof-platform)**

</div>
