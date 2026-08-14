# syntax=docker/dockerfile:1.7
#
# Onekof Platform — Tier 2 / Tier 1 Dockerfile
# ============================================
#
# Multi-stage build for a self-hosted Onekof deployment on any Linux host
# (on-premise Ethiopian server, EthioTelecom Cloud VM, etc.). Produces an
# image that runs `node server.js` against a standalone Next.js build.
# Wave 2 enabled `output: 'standalone'` in next.config.mjs, which lets
# Next.js trace only the files needed at runtime — reducing the image
# from ~2.6 GB to ~300 MB. This enables USB-based deployment.
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
# Stage 3: runner — minimal runtime image (~300 MB with standalone output)
# ---------------------------------------------------------------------------
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create a non-root user so the container does not run as uid 0 at runtime.
# The uid/gid are the Next.js-recommended defaults.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /home/nextjs/.cache/node/corepack \
  && chown -R nextjs:nodejs /home/nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# The docker-build workflow has passed BUILD_SHA=${{ github.sha }} since it
# was written, but nothing here declared the ARG, so Docker silently dropped
# it and /api/health on a Tier 2 deployment could not say which commit it was
# running. Declared in this stage because an ARG is scoped to the stage that
# names it — declaring it at the top of the file would not reach the runner.
ARG BUILD_SHA=""
ENV GIT_COMMIT_SHA=$BUILD_SHA

# Copy standalone output — Next.js traces only the files actually imported
# at runtime, producing a self-contained server (~300 MB vs 2.6 GB full copy).
# The standalone folder includes its own node_modules with only needed deps.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Prisma migration files for `prisma migrate deploy` on fresh databases.
# The Prisma client itself is included by Next.js standalone trace via
# outputFileTracingIncludes in next.config.mjs.
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/prisma ./packages/database/prisma

# Create the local-fs storage directory used by the Wave 1 storage driver
# when STORAGE_DRIVER=local-fs. Docker-compose mounts a named volume here
# so uploaded files survive container restarts.
RUN mkdir -p /var/onekof/blobs && chown -R nextjs:nodejs /var/onekof

USER nextjs

EXPOSE 3000

# Health check — use node to avoid wget/curl header issues with NextAuth
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',{headers:{host:'localhost'}},r=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

# Standalone output produces a server.js at the repo root that includes
# the Next.js server. No need for pnpm or node_modules/.bin/next.
CMD ["node", "apps/web/server.js"]
