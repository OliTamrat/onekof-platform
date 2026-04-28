import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!DSN) return; // skip if no DSN configured (dev without .env)

  Sentry.init({
    dsn: DSN,
    environment: __DEV__ ? 'development' : 'production',
    release: Constants.expoConfig?.version,
    dist: String(Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1'),
    // Sample 20% of transactions in production to keep quota low
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Capture all errors
    sampleRate: 1.0,
    // Don't send events in development
    beforeSend(event) {
      if (__DEV__) {
        console.error('[Sentry]', event.exception?.values?.[0]?.value);
        return null;
      }
      return event;
    },
  });
}

export { Sentry };
