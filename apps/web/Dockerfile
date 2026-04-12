# syntax=docker/dockerfile:1.7
#
# Onekof Platform — Tier 2 / Tier 1 Dockerfile
# ============================================
#
# Multi-stage build for a self-hosted Onekof deployment on any Linux host
# (on-premise Ethiopian server, EthioTelecom Cloud VM, etc.). Produces an
# image that runs `next start` against a bundled `.next` build + shared
# node_modules copy. This is the Wave 1 reference image and intentionally
# does NOT use `output: 'standalone'` — that optimization is deferred to
# Wave 2 because it interacts with Vercel's file tracing.
#
# Build from the REPO ROOT (not apps/web), so the monorepo lockfile and
# sibling packages are available to the build context:
#
#   docker build -f apps/web/Dockerfile -t onekof-web:local .
#
# Or via docker-compose.tier-sim.yml which sets the context automatically.
#
# The final image listens on port 3000. Configure tier-specific behavior
# at runtime via env vars (see .env.tier2.example for the full list).

# ---------------------------------------------------------------------------
# Stage 1: deps — install pnpm + all workspace dependencies
# ---------------------------------------------------------------------------
FROM node:20-slim AS deps

# Install OpenSSL 3 (required by Prisma's debian-openssl-3.0.x engine) plus
# basic build tools needed for any native node_modules compilation.
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# pnpm must match the version declared in package.json#packageManager
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

WORKDIR /app

# Copy ONLY the files needed to resolve and install dependencies. This
# maximizes Docker layer cache — dependency installation only re-runs when
# package.json or the lockfile changes, not on every source edit.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/database/index.ts ./packages/database/index.ts
COPY packages/config/package.json ./packages/config/package.json

# Prisma schema is needed at install time because `postinstall` runs
# `prisma generate`, which reads the schema file to emit the typed client.
COPY packages/database/prisma ./packages/database/prisma

# --frozen-lockfile enforces exact pnpm-lock.yaml versions (reproducible builds).
# Next.js-style self-hosted builds should always use this flag in CI/CD.
RUN pnpm install --frozen-lockfile


# ---------------------------------------------------------------------------
# Stage 2: builder — compile the Next.js app
# ---------------------------------------------------------------------------
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

WORKDIR /app

# Reuse resolved node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages

# Copy workspace manifests + the full web app source
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web ./apps/web

# Copy the full `packages/config` source (eslint + tailwind + typescript
# base configs). The deps stage only copied package.json for install-time
# resolution; the actual config files are needed at build time because
# apps/web/tsconfig.json extends `@onekof/config/typescript/nextjs.json`.
COPY packages/config ./packages/config

# Copy the full `packages/database` source — the web app imports subpaths
# like `@onekof/database/src/services/activity-logger`, so the actual
# TypeScript sources need to be present at build time (not just the
# Prisma schema that the deps stage already copied).
COPY packages/database ./packages/database

# Build-time env vars for Next.js. These only affect the built artifact,
# not runtime — runtime env vars are injected by docker-compose.
# NEXT_TELEMETRY_DISABLED silences the telemetry prompt during build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the web app. `pnpm --filter=web run build` runs the `build` script
# defined in apps/web/package.json, which is:
#   prisma generate --schema=../../packages/database/prisma/schema.prisma && next build
# The schema path is relative to apps/web, which is what pnpm --filter uses
# as the working directory. This handles Prisma client regeneration as part
# of the build, so no separate `prisma generate` step is needed here.
RUN pnpm --filter=web run build


# ---------------------------------------------------------------------------
# Stage 3: runner — minimal runtime image
# ---------------------------------------------------------------------------
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    wget \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

WORKDIR /app

# Create a non-root user so the container does not run as uid 0 at runtime.
# The uid/gid are the Next.js-recommended defaults.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy the built app artifact. Because we are NOT using standalone output,
# we copy the complete apps/web directory plus the workspace node_modules
# and the Prisma client from packages/database.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/pnpm-workspace.yaml /app/turbo.json ./

# Create the local-fs storage directory used by the Wave 1 storage driver
# when STORAGE_DRIVER=local-fs. Docker-compose mounts a named volume here
# so uploaded files survive container restarts.
RUN mkdir -p /var/onekof/blobs && chown -R nextjs:nodejs /var/onekof

USER nextjs

EXPOSE 3000

# Health check hits /api/admin/health (which Wave 1 refactored to use the
# runtime abstraction, so it reports the correct platform/region even on
# self-hosted). wget is used because it's already in the base image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:3000/api/auth/session || exit 1

WORKDIR /app/apps/web

# Start Next.js directly from node_modules/.bin to avoid pnpm wrapper overhead
# at runtime. `next start` respects HOSTNAME and PORT env vars.
CMD ["./node_modules/.bin/next", "start"]
