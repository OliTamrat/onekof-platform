# Sentry Error Tracking Setup Guide

## Overview
Sentry has been integrated into the OnekOf Platform to provide real-time error tracking, performance monitoring, and session replay capabilities.

## Features Enabled
- ✅ Client-side error tracking
- ✅ Server-side error tracking
- ✅ Edge runtime error tracking
- ✅ Session Replay (10% sample rate, 100% on errors)
- ✅ Performance monitoring (100% trace sample rate)
- ✅ Source map upload for readable stack traces
- ✅ Automatic release tracking
- ✅ Vercel Cron job monitoring

## Setup Instructions

### 1. Create a Sentry Account
1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project and select "Next.js" as the platform
3. Note down your DSN (Data Source Name)

### 2. Configure Environment Variables
Copy the example file and fill in your Sentry credentials:

```bash
cd apps/web
cp .env.sentry.example .env.local
```

Edit `.env.local` and add:
```env
NEXT_PUBLIC_SENTRY_DSN=https://[your-key]@[your-org].ingest.sentry.io/[your-project-id]
SENTRY_DSN=https://[your-key]@[your-org].ingest.sentry.io/[your-project-id]
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=onekof-platform
SENTRY_AUTH_TOKEN=your-auth-token
```

### 3. Get Your Auth Token
1. Go to [Sentry Settings → Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Create a new token with `project:releases` and `org:read` scopes
3. Copy the token to `SENTRY_AUTH_TOKEN`

### 4. Test the Integration

#### Client-Side Test
Add this to any page to test client-side error tracking:
```typescript
'use client';
import * as Sentry from '@sentry/nextjs';

export default function TestPage() {
  const triggerError = () => {
    Sentry.captureException(new Error('Test client-side error'));
  };

  return <button onClick={triggerError}>Test Sentry</button>;
}
```

#### Server-Side Test
Add this to any API route:
```typescript
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    throw new Error('Test server-side error');
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: 'Test error' }, { status: 500 });
  }
}
```

### 5. Verify in Sentry Dashboard
1. Trigger the test errors
2. Go to your Sentry project dashboard
3. You should see the errors appear within seconds

## Configuration Details

### Error Filtering
The integration automatically filters out:
- ❌ Browser extension errors
- ❌ Third-party script errors
- ❌ Development environment errors (console logged only)
- ❌ Common connection errors (ECONNREFUSED, ENOTFOUND)

### Sampling Rates
- **Performance Traces:** 100% (adjust in production based on traffic)
- **Session Replay:** 10% (100% when error occurs)
- **Error Replay:** 100%

### Privacy
- ✅ All text masked in session replays
- ✅ All media blocked in session replays
- ✅ Source maps hidden from client bundles

## Production Deployment

### Vercel
The integration works automatically with Vercel. Just ensure your environment variables are set in the Vercel dashboard.

### Manual Deployment
For non-Vercel deployments, source maps are uploaded during build:
```bash
pnpm build
```

## Monitoring Best Practices

### 1. Set Up Alerts
Configure alerts in Sentry for:
- New issues
- High-frequency errors
- Performance degradation

### 2. Create Teams
Assign issues to specific teams (Frontend, Backend, DevOps)

### 3. Integrate with Slack/Discord
Get real-time notifications in your team chat

### 4. Review Weekly
Set aside time each week to review and triage errors

## Troubleshooting

### No errors showing up?
1. Check DSN is correct in environment variables
2. Verify `NODE_ENV !== 'development'` (dev errors are console-logged only)
3. Check network tab for requests to `sentry.io`

### Source maps not working?
1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check build logs for upload errors
3. Ensure `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry setup

### High quota usage?
1. Reduce `tracesSampleRate` in `sentry.client.config.ts`
2. Reduce `replaysSessionSampleRate`
3. Add more error filters in `ignoreErrors`

## Files Added

```
apps/web/
├── sentry.client.config.ts       # Client-side Sentry config
├── sentry.server.config.ts       # Server-side Sentry config
├── sentry.edge.config.ts         # Edge runtime Sentry config
├── instrumentation.ts            # Server instrumentation hook
├── src/app/global-error.tsx      # Global error boundary
└── .env.sentry.example           # Environment variable template
```

## Support

- **Sentry Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **GitHub Issues:** https://github.com/getsentry/sentry-javascript/issues

## Cost

Sentry offers:
- **Free Tier:** 5K errors/month, 1K replays/month
- **Team Plan:** $26/month for 50K errors, 500 replays
- **Business Plan:** Custom pricing for high volume

For OnekOf Platform's expected traffic, start with the free tier and upgrade as needed.

---

**Setup Complete!** Your application now has enterprise-grade error tracking. 🎉
