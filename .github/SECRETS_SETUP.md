# GitHub Actions — Secrets Setup Guide

This is the only manual step required before CI/CD activates.
Go to your GitHub repo → **Settings → Secrets and Variables → Actions → New repository secret**
and add each secret below.

---

## Required Secrets (CI will fail without these)

### Database

| Secret | How to get it |
|--------|--------------|
| `DATABASE_URL` | Supabase dashboard → Project → Settings → Database → Connection string → **Transaction** (port 6543). Append `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Same page → Connection string → **Session** (port 5432). No extra params needed. |

Example format:
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Auth

| Secret | How to get it |
|--------|--------------|
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL — e.g., `https://onekof.et` or current Vercel URL |

### Vercel (for auto-deploy)

| Secret | How to get it |
|--------|--------------|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link` in the repo, then read `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Same file → `projectId` |

To get org and project IDs quickly:
```bash
cd onekof-platform
npx vercel link
cat .vercel/project.json
```

### Error Tracking

| Secret | How to get it |
|--------|--------------|
| `SENTRY_DSN` | sentry.io → Project → Settings → Client Keys → DSN |
| `SENTRY_ORG` | sentry.io → Organization slug (visible in the URL) |
| `SENTRY_PROJECT` | sentry.io → Project slug |
| `SENTRY_AUTH_TOKEN` | sentry.io → Account → API Tokens → Create (scope: `project:releases`) |

---

## Optional Secrets (features degrade gracefully without them)

| Secret | Used for |
|--------|---------|
| `RESEND_API_KEY` | Email delivery — get from resend.com |
| `ANTHROPIC_API_KEY` | AI features — get from console.anthropic.com |
| `GOOGLE_CLIENT_ID` | Google OAuth — get from console.cloud.google.com |
| `GOOGLE_CLIENT_SECRET` | Google OAuth — same as above |

---

## Quick Verification

After adding secrets, push any commit to `main` or `develop` and check:

**GitHub repo → Actions tab**

You should see:
- `CI` workflow running on the push
- `Deploy to Production (Tier 3 — Vercel)` running if you pushed to `main`

If the CI workflow fails, the most common causes are:
1. `DATABASE_URL` is the pooled URL but missing `?pgbouncer=true&connection_limit=1`
2. `DIRECT_URL` is pointing to the wrong port (must be 5432, not 6543)
3. `VERCEL_TOKEN` is expired — regenerate at vercel.com

---

## Environment Separation (optional but recommended)

GitHub supports different secrets per environment. To use this:

1. GitHub repo → Settings → Environments → New environment
2. Create `production` and `staging` environments
3. Add environment-specific secrets to each
4. The `deploy-production.yml` workflow is already configured with `environment: production`

This lets you have a different `DATABASE_URL` for staging vs production.
