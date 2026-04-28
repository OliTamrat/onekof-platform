/**
 * Push notification registration and handling for Expo.
 * - Requests permission on first launch
 * - Registers Expo push token with the server
 * - Handles notification tap → deep link to the relevant screen
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { apiFetch } from './api';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications. Returns the Expo push token or null.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push only works on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  // Get Expo push token
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      'de51f86c-459c-4330-83df-7b481b9e9740'; // @olink/onekof
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // Register with server
    await apiFetch('/api/push/register', {
      method: 'POST',
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        deviceName: Device.deviceName || undefined,
      }),
    });

    return token;
  } catch (err) {
    console.error('Failed to get push token:', err);
    return null;
  }
}

/**
 * Revoke push token on sign-out.
 */
export async function revokePushToken(): Promise<void> {
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      'de51f86c-459c-4330-83df-7b481b9e9740';
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    await apiFetch('/api/push/register', {
      method: 'DELETE',
      body: JSON.stringify({ token: tokenData.data }),
    });
  } catch {
    // Best-effort
  }
}

/**
 * Hook: registers for push on mount and handles notification taps.
 * Place this in the root layout or main authenticated screen.
 */
export function usePushNotifications() {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push
    registerForPushNotifications();

    // Handle notification tap → deep link
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.type === 'TASK' && data?.entityId) {
        router.push(`/issue/${data.entityId}`);
      } else if (data?.type === 'PROJECT' && data?.entityId) {
        router.push(`/project/${data.entityId}`);
      } else if (data?.type === 'GOAL') {
        router.push('/goals' as any);
      } else {
        // Default: open notifications tab
        router.push('/notifications' as any);
      }
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);
}
