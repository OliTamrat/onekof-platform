# 🌐 Vercel Environment Variables Setup Guide

## Required Environment Variables for Production

Add these in **Vercel Dashboard → Your Project → Settings → Environment Variables**

---

## 🔐 Authentication (NextAuth.js)

```env
# NextAuth Secret - MUST be different from development
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_production_secret_key_here_minimum_32_chars

# Production URL
NEXTAUTH_URL=https://onekof.com

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (if using)
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
```

---

## 🗄️ Database (PostgreSQL)

```env
# Production Database URL
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_database

# Render.com example
# DATABASE_URL=postgresql://user:password@dpg-xxxxx.region.render.com/database_name

# Supabase example
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres

# Direct Connection (for Prisma migrations)
DIRECT_URL=${DATABASE_URL}
```

---

## 🤖 AI Services (Optional)

```env
# OpenAI API (for AI Documents feature)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Anthropic (alternative AI provider)
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
```

---

## 📧 Email Service (Optional)

```env
# Resend (for transactional emails)
RESEND_API_KEY=re_your_resend_api_key

# SendGrid (alternative)
SENDGRID_API_KEY=SG.your_sendgrid_key

# Email from address
EMAIL_FROM=noreply@onekof.com
```

---

## 📦 File Storage (Optional)

```env
# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=onekof-uploads

# Cloudflare R2 (S3-compatible alternative)
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=onekof-files
```

---

## 🔔 Notifications (Optional)

```env
# Slack Webhooks (for team notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Discord Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK
```

---

## 📊 Analytics (Optional)

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Posthog (product analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 💳 Payment (Optional - for future)

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## 🚀 How to Add in Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **onekof-platform** project
3. Click **Settings** → **Environment Variables**
4. For each variable:
   - **Key:** Variable name (e.g., `DATABASE_URL`)
   - **Value:** Your secret value
   - **Environments:** Select **Production**, **Preview**, **Development**
5. Click **Save**

### Method 2: Vercel CLI
```bash
# Set single variable
vercel env add DATABASE_URL production

# Pull environment variables from Vercel
vercel env pull .env.local
```

### Method 3: Bulk Import
1. Create `.env.production` file locally:
   ```env
   DATABASE_URL=your_value
   NEXTAUTH_SECRET=your_value
   # ... all other vars
   ```
2. In Vercel Dashboard → Environment Variables
3. Click **Import .env** → Upload file

---

## ⚠️ CRITICAL: Security Checklist

- [ ] **NEVER** use development secrets in production
- [ ] **NEVER** commit `.env` files to Git
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Use production database (not dev database)
- [ ] Enable SSL/TLS for database connections
- [ ] Rotate secrets regularly (every 90 days)
- [ ] Use different API keys for dev/staging/prod
- [ ] Enable Vercel's **Environment Variable Encryption**

---

## 🧪 Testing Environment Variables

After adding to Vercel, test with:
```bash
# Redeploy to pick up new variables
vercel --prod

# Or trigger redeploy in Vercel Dashboard
# Deployments → ... → Redeploy
```

Check logs in Vercel Dashboard → Deployments → View Function Logs

---

## 📝 Minimum Required for Launch

**Absolutely Required:**
1. `DATABASE_URL` - PostgreSQL connection
2. `NEXTAUTH_SECRET` - Authentication security
3. `NEXTAUTH_URL` - Your production domain

**Highly Recommended:**
4. `DIRECT_URL` - For Prisma migrations
5. Google/GitHub OAuth keys (if using social login)

**Optional but Nice:**
- Email service (for user invites, notifications)
- AI API keys (for AI Documents feature)
- File storage (for document uploads)

---

## 🔗 Useful Links

- Vercel Env Docs: https://vercel.com/docs/projects/environment-variables
- NextAuth Docs: https://next-auth.js.org/deployment
- Prisma Production: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

---

**Last Updated:** March 5, 2026
**Generated with:** Onekof Team
