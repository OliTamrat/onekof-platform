import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (!SENTRY_DSN) {
  // Sentry DSN not configured — skip initialization silently
} else {

Sentry.init({
  dsn: SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.APP_VERSION || 'development',

  // Server-specific configuration
  integrations: [
    // Add server integrations here if needed
  ],

  // Ignore specific errors
  ignoreErrors: [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
  ],

  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error:', hint.originalException || hint.syntheticException);
      return null; // Don't send to Sentry in development
    }

    // Don't send database connection errors in development
    const error = hint.originalException;
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code;
      if (['ECONNREFUSED', 'ENOTFOUND'].includes(errorCode)) {
        return null;
      }
    }

    return event;
  },
});

} // end if (SENTRY_DSN)
