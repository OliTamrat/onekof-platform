import { usePushNotifications } from '../lib/push-notifications';

/**
 * Invisible component that registers for push notifications on mount
 * and sets up deep-link handling for notification taps.
 * Placed in the root layout so it runs once after auth.
 */
export function PushNotificationRegistrar() {
  usePushNotifications();
  return null;
}
