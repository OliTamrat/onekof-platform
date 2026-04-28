import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/contexts/auth-context';
import { LanguageProvider } from '../src/contexts/language-context';
import { BiometricLock } from '../src/components/BiometricLock';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { GlobalFAB } from '../src/components/GlobalFAB';
import { PushNotificationRegistrar } from '../src/components/PushNotificationRegistrar';
import { Colors } from '../src/constants/theme';
import * as SplashScreen from 'expo-splash-screen';
import { initSentry, Sentry } from '../src/lib/sentry';
import 'react-native-reanimated';

// Init crash reporting before anything renders
initSentry();

export { ErrorBoundary } from 'expo-router';

// Sentry error boundary wraps the entire navigation tree
export const unstable_settings = { initialRouteName: '(tabs)' };

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <LanguageProvider>
          <StatusBar style="light" backgroundColor={Colors.bg} />
          <OfflineBanner />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
            <Stack.Screen name="select-org/index" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="issue/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="project/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="create-issue/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="create-project/index" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="teams/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="goals/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="budget/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="documents/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="calendar/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="profile/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="settings/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="members/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="team/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="search/index" options={{ animation: 'fade' }} />
          </Stack>
          <GlobalFAB />
          <PushNotificationRegistrar />
          <BiometricLock />
        </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
