# Onekof Platform

> Ethiopian-first project management and collaboration platform that competes with Atlassian

## Overview

Onekof is a modern, enterprise-grade SaaS platform combining:
- **Project Management** (Jira alternative)
- **Knowledge Management** (Confluence alternative)
- **Real-time Collaboration**
- **AI-powered workflows**
- **Ethiopian localization** (Calendar, Languages, Payments)

## Architecture

- **Monorepo:** Turborepo with pnpm workspaces
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** tRPC, Prisma, PostgreSQL, Redis
- **UI:** Tailwind CSS, Radix UI, Lucide Icons
- **Real-time:** Socket.io + Yjs (CRDT)
- **AI:** Anthropic Claude 3.5 Sonnet

## Project Structure

```
onekof-platform/
├── apps/
│   ├── web/              # Main web application (Next.js 14)
│   └── api/              # Standalone API server (optional)
├── packages/
│   ├── ui/               # Shared UI component library
│   ├── database/         # Prisma schema & database client
│   ├── auth/             # Authentication & authorization
│   ├── config/           # Shared configurations
│   ├── utils/            # Shared utilities
│   └── types/            # Shared TypeScript types
└── turbo.json            # Turborepo pipeline configuration
```

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router with React Server Components)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 4
- **Components:** Radix UI (accessible primitives)
- **Icons:** Lucide React
- **State:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod validation
- **Rich Text:** Tiptap (collaborative editor)
- **Typography:** SF Pro (Latin scripts), Abyssinica SIL (Ge'ez scripts)

### Backend
- **API:** tRPC (type-safe end-to-end)
- **ORM:** Prisma 5+
- **Database:** PostgreSQL 16 with pgvector
- **Cache:** Redis (Upstash)
- **Search:** Elasticsearch 8+
- **Queue:** BullMQ
- **Storage:** Cloudflare R2 (S3-compatible)
- **Auth:** NextAuth.js v5

### Infrastructure
- **Hosting:** Vercel (frontend), Railway (backend services)
- **Database:** Supabase or Neon (managed PostgreSQL)
- **CDN:** Cloudflare
- **Monitoring:** Sentry + OpenTelemetry
- **CI/CD:** GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+
- Redis

### Installation

```bash
# Clone repository
git clone https://github.com/onekof/platform.git
cd onekof-platform

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development servers
pnpm dev
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm dev --filter=web

# Build all apps
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# Open Prisma Studio
pnpm db:studio
```

## Key Features

### 1. Project Management
- Kanban & Scrum boards
- Sprint planning & tracking
- Custom workflows (visual builder)
- Issue tracking with relationships
- Roadmap & timeline views
- Advanced filtering & JQL-like search

### 2. Knowledge Management
- Confluence-style documentation
- Real-time collaborative editing (Yjs CRDT)
- Rich text with markdown support
- Document versioning & history
- Templates & spaces
- Inline comments & mentions

### 3. AI-Powered Features
- Smart task decomposition (epic → subtasks)
- Intelligent summarization (discussions, sprints)
- Semantic search (find related work)
- Auto-tagging & categorization
- Story point estimation
- Meeting notes → action items

### 4. Ethiopian Localization
- **Languages:** English, አማርኛ (Amharic), Afaan Oromo, ትግርኛ (Tigrinya)
- **Calendar:** Gregorian ⇄ Ethiopian calendar toggle
- **Payments:** Chapa, Telebirr, CBE Birr (ETB pricing)
- **Templates:** NGO, Government, Construction workflows

### 5. Collaboration
- Real-time presence & cursors
- Comments with @mentions
- File attachments & previews
- Activity feeds & notifications
- Slack/MS Teams integrations
- Voice notes & screen recordings

## Competitive Advantages

| Feature | Jira + Confluence | Onekof |
|---------|-------------------|--------|
| **Pricing** | $13.80/user/month | **$5/user/month** |
| **Setup Time** | Hours | **5 minutes** |
| **Learning Curve** | Steep (weeks) | **Intuitive (hours)** |
| **AI Features** | Paid add-on | **Included** |
| **Mobile App** | Limited | **Offline-first native** |
| **Ethiopian Support** | None | **Full localization** |
| **Unified Platform** | Separate products | **All-in-one** |

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Proprietary - All rights reserved

## Contact

- **Website:** https://onekof.com
- **Email:** hello@onekof.com
- **Twitter:** @onekof
- **Telegram:** t.me/onekof

---

**Built with ❤️ in Ethiopia 🇪🇹**
