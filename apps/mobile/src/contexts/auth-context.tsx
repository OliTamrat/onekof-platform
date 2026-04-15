import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as api from '../lib/api';

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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  selectOrganization: (org: Organization) => Promise<void>;
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
  const router = useRouter();
  const segments = useSegments();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
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

    // Fetch organizations
    const orgData = await api.apiFetch('/api/auth/mobile/me');
    setOrganizations(orgData.organizations || []);

    if (orgData.organizations?.length === 1) {
      // Auto-select single org
      const org = orgData.organizations[0];
      await api.setOrgSlug(org.slug);
      setCurrentOrg(org);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await api.signOut();
    setUser(null);
    setOrganizations([]);
    setCurrentOrg(null);
  }, []);

  const selectOrganization = useCallback(async (org: Organization) => {
    await api.setOrgSlug(org.slug);
    setCurrentOrg(org);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrg,
        isLoading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        selectOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
