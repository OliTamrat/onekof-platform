# Onekof Platform - Complete Setup Guide

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** 8+ (install: `npm install -g pnpm`)
- **PostgreSQL** 16+ ([download](https://www.postgresql.org/download/))
- **Redis** (optional, for caching) ([download](https://redis.io/download))
- **Git** ([download](https://git-scm.com/))

---

## Step 1: Download Required Fonts

### SF Pro (for Latin scripts: English, Oromo, Somali)

1. Visit [Apple Developer Fonts](https://developer.apple.com/fonts/)
2. Download "SF Pro" font family
3. Extract and locate these files:
   - `SF-Pro-Display-Light.woff2`
   - `SF-Pro-Display-Regular.woff2`
   - `SF-Pro-Display-Medium.woff2`
   - `SF-Pro-Display-Semibold.woff2`
   - `SF-Pro-Display-Bold.woff2`

4. Place them in: `apps/web/src/fonts/`

**Alternative:** Download from [Google Fonts](https://fonts.google.com/) and convert to WOFF2 format

### Abyssinica SIL (for Ge'ez scripts: Amharic, Tigrinya)

1. Visit [SIL Language Technology](https://software.sil.org/abyssinica/)
2. Download the Abyssinica SIL font package
3. Locate `AbyssinicaSIL-Regular.ttf`
4. Convert to WOFF2 format using [CloudConvert](https://cloudconvert.com/ttf-to-woff2) or similar tool
5. Place `AbyssinicaSIL-Regular.woff2` in: `apps/web/src/fonts/`

**Note:** If you can't access these fonts immediately, the app will fall back to system fonts. You can add proper fonts later.

---

## Step 2: Clone and Install

```bash
# Navigate to project directory
cd onekof-platform

# Install all dependencies (this may take a few minutes)
pnpm install

# This installs dependencies for:
# - Root workspace
# - apps/web
# - packages/database
# - packages/config
```

---

## Step 3: Database Setup

### Option A: Local PostgreSQL

1. **Create Database:**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE onekof;

# Create user (optional, for better security)
CREATE USER onekof_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE onekof TO onekof_user;

# Enable pgvector extension (for AI features)
\c onekof
CREATE EXTENSION IF NOT EXISTS vector;
```

2. **Configure Environment:**
```bash
# Copy environment file
cp packages/database/.env.example packages/database/.env
cp apps/web/.env.example apps/web/.env

# Edit packages/database/.env
# Set DATABASE_URL to:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/onekof?schema=public"
```

### Option B: Cloud Database (Recommended for Production)

**Using Supabase (Free tier available):**

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Project Settings → Database
3. Copy the "Connection string" (Connection pooling mode)
4. Paste into `DATABASE_URL` in `.env` files
5. Enable pgvector:
   - Go to SQL Editor
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`

**Using Neon (Free tier available):**

1. Go to [neon.tech](https://neon.tech) and create a project
2. Copy the connection string
3. Paste into `DATABASE_URL` in `.env` files
4. pgvector is enabled by default on Neon

---

## Step 4: Push Database Schema

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database (creates tables)
pnpm db:push

# Optional: Open Prisma Studio to view database
pnpm db:studio
```

---

## Step 5: Configure Environment Variables

Edit `apps/web/.env`:

```env
# Database (same as packages/database/.env)
DATABASE_URL="postgresql://..."

# NextAuth (generate secret)
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Onekof"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional: AI Features (get from anthropic.com)
ANTHROPIC_API_KEY=""

# Optional: Email (get from resend.com)
RESEND_API_KEY=""
```

**Generate NextAuth Secret:**
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32|%{Get-Random -Minimum 0 -Maximum 256}))
```

---

## Step 6: Start Development Server

```bash
# Start all apps in development mode
pnpm dev

# Or start specific app
pnpm dev --filter=web
```

The app should now be running at: **http://localhost:3000**

---

## Step 7: Verify Installation

Open your browser to `http://localhost:3000` and you should see:
- Onekof homepage with hero section
- "Work flows, teams align, Ethiopia thrives" heading
- Feature cards for Project Management, Documentation, etc.
- Clean, professional design with proper fonts

---

## Project Structure Overview

```
onekof-platform/
├── apps/
│   └── web/                    # Next.js 14 main application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── fonts/          # SF Pro & Abyssinica SIL fonts
│       │   ├── lib/            # Utilities
│       │   └── components/     # React components (to be built)
│       ├── .env                # Environment variables
│       └── package.json
│
├── packages/
│   ├── database/               # Prisma schema & client
│   │   ├── prisma/schema.prisma
│   │   └── index.ts
│   │
│   └── config/                 # Shared configurations
│       ├── eslint/             # ESLint configs
│       ├── typescript/         # TypeScript configs
│       └── tailwind/           # Tailwind config
│
├── turbo.json                  # Turborepo pipeline
├── package.json                # Root package.json
└── pnpm-workspace.yaml         # Workspace configuration
```

---

## Common Commands

```bash
# Development
pnpm dev                    # Start all apps
pnpm dev --filter=web       # Start specific app
pnpm build                  # Build all apps
pnpm lint                   # Lint all code
pnpm format                 # Format with Prettier
pnpm type-check             # TypeScript type checking

# Database
pnpm db:generate            # Generate Prisma Client
pnpm db:push                # Push schema to database
pnpm db:studio              # Open Prisma Studio

# Clean
pnpm clean                  # Remove all node_modules and build artifacts
```

---

## Next Steps

Now that your foundation is set up:

1. **Build Authentication:** Implement NextAuth.js with email/password and OAuth
2. **Create UI Components:** Build reusable components with Radix UI
3. **Implement Core Features:**
   - Project management (Kanban boards)
   - Issue tracking
   - Documentation (Tiptap editor)
   - Real-time collaboration (Yjs)
4. **Add AI Features:** Integrate Anthropic for smart suggestions
5. **Ethiopian Localization:** Implement calendar and language switching

---

## Troubleshooting

### Font Issues

**Problem:** Fonts not loading

**Solution:**
1. Check fonts exist in `apps/web/src/fonts/`
2. Verify font paths in `apps/web/src/app/layout.tsx`
3. Clear Next.js cache: `rm -rf apps/web/.next`
4. Restart dev server

### Database Connection Issues

**Problem:** `Can't reach database server`

**Solution:**
1. Verify PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
2. Check DATABASE_URL is correct in both `.env` files
3. Ensure database `onekof` exists
4. Check firewall/network settings

### pnpm Installation Issues

**Problem:** `No lockfile found`

**Solution:**
```bash
# Delete existing node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# Clear pnpm cache
pnpm store prune

# Reinstall
pnpm install
```

### Port Already in Use

**Problem:** `Port 3000 is already in use`

**Solution:**
```bash
# Find and kill process on port 3000
# On Mac/Linux
lsof -ti:3000 | xargs kill -9

# On Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use different port
PORT=3001 pnpm dev
```

---

## Getting Help

- **Documentation:** See `TECHNICAL_ARCHITECTURE.md` for architecture details
- **GitHub Issues:** Report bugs and request features
- **Community:** Join our Telegram channel (link coming soon)

---

## What's Next?

Check out `ROADMAP.md` (to be created) for the development roadmap and upcoming features.

The foundation is solid. Now we build world-class features on top of it! 🚀
