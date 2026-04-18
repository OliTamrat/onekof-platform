import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import * as api from '../lib/api';
import { isBiometricEnabled, authenticateWithBiometric } from '../lib/biometric';
import { getOfflineQueue, removeFromQueue } from '../lib/offline';
import { revokePushToken } from '../lib/push-notifications';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  isLoading: boolean;
  isLocked: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  offlineQueueCount: number;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  selectOrganization: (org: Organization) => Promise<void>;
  unlockWithBiometric: () => Promise<boolean>;
  syncOfflineQueue: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const router = useRouter();
  const segments = useSegments();
  const appState = useRef(AppState.currentState);

  // Subscribe to online-state observer (updated by apiFetch on every success/network error)
  useEffect(() => {
    return api.subscribeOnlineState(setIsOnline);
  }, []);

  // Auto-sync when transitioning from offline → online (if queue has items)
  const prevOnline = useRef(true);
  useEffect(() => {
    if (!prevOnline.current && isOnline && offlineQueueCount > 0) {
      syncOfflineQueue();
    }
    prevOnline.current = isOnline;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Lock app when backgrounded (if biometric enabled)
  useEffect(() => {
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [user]);

  // Periodically check offline queue
  useEffect(() => {
    checkOfflineQueue();
    const interval = setInterval(checkOfflineQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAppStateChange = useCallback(async (nextState: AppStateStatus) => {
    if (appState.current === 'active' && nextState.match(/inactive|background/)) {
      // App going to background — check if biometric lock should engage
      if (user) {
        const bioEnabled = await isBiometricEnabled();
        if (bioEnabled) setIsLocked(true);
      }
    }
    if (appState.current.match(/inactive|background/) && nextState === 'active') {
      // App returning to foreground — sync any queued mutations
      syncOfflineQueue();
    }
    appState.current = nextState;
  }, [user]);

  const checkOfflineQueue = useCallback(async () => {
    const queue = await getOfflineQueue();
    setOfflineQueueCount(queue.length);
  }, []);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOrgSelect = segments[0] === 'select-org';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/signin');
    } else if (user && !currentOrg && !inOrgSelect && !inAuthGroup) {
      router.replace('/select-org');
    } else if (user && currentOrg && (inAuthGroup || inOrgSelect)) {
      router.replace('/(tabs)');
    }
  }, [user, currentOrg, segments, isLoading]);

  const checkSession = useCallback(async () => {
    try {
      const token = await api.getToken();
      const orgSlug = await api.getOrgSlug();

      if (token) {
        // Validate token and get user data
        const data = await api.apiFetch('/api/auth/mobile/me');
        setUser(data.user);
        setOrganizations(data.organizations || []);

        if (orgSlug) {
          const org = (data.organizations || []).find(
            (o: Organization) => o.slug === orgSlug
          );
          if (org) setCurrentOrg(org);
        }

        // Check if biometric lock should be active
        const bioEnabled = await isBiometricEnabled();
        if (bioEnabled) setIsLocked(true);
      }
    } catch {
      // Token invalid or expired
      await api.clearToken();
      await api.clearOrgSlug();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const data = await api.signIn(email, password);
    setUser(data.user);
    setIsLocked(false);

    // Fetch organizations
    const orgData = await api.apiFetch('/api/auth/mobile/me');
    setOrganizations(orgData.organizations || []);

    if (orgData.organizations?.length === 1) {
      const org = orgData.organizations[0];
      await api.setOrgSlug(org.slug);
      setCurrentOrg(org);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await revokePushToken().catch(() => {});
    await api.signOut();
    setUser(null);
    setOrganizations([]);
    setCurrentOrg(null);
    setIsLocked(false);
  }, []);

  const selectOrganization = useCallback(async (org: Organization) => {
    await api.setOrgSlug(org.slug);
    setCurrentOrg(org);
  }, []);

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    const success = await authenticateWithBiometric();
    if (success) setIsLocked(false);
    return success;
  }, []);

  const syncOfflineQueue = useCallback(async () => {
    const queue = await getOfflineQueue();
    if (queue.length === 0) return;
    setIsSyncing(true);
    try {
      for (const item of queue) {
        try {
          await api.apiFetch(item.path, {
            method: item.method,
            body: item.body,
          });
          await removeFromQueue(item.id);
          // Refresh count after each successful drain so banner updates live
          checkOfflineQueue();
        } catch {
          // Still offline or request failed — stop trying
          break;
        }
      }
    } finally {
      setIsSyncing(false);
      checkOfflineQueue();
    }
  }, [checkOfflineQueue]);

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrg,
        isLoading,
        isLocked,
        isOnline,
        isSyncing,
        offlineQueueCount,
        signIn: handleSignIn,
        signOut: handleSignOut,
        selectOrganization,
        unlockWithBiometric,
        syncOfflineQueue,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
