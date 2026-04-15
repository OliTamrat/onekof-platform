import * as SecureStore from 'expo-secure-store';

// Always use production API — mobile connects over the network
const API_BASE = 'https://onekof.com';

const TOKEN_KEY = 'onekof_session_token';
const ORG_SLUG_KEY = 'onekof_org_slug';

/**
 * Store the session token securely
 */
export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Store the selected organization slug
 */
export async function setOrgSlug(slug: string) {
  await SecureStore.setItemAsync(ORG_SLUG_KEY, slug);
}

export async function getOrgSlug(): Promise<string | null> {
  return SecureStore.getItemAsync(ORG_SLUG_KEY);
}

export async function clearOrgSlug() {
  await SecureStore.deleteItemAsync(ORG_SLUG_KEY);
}

/**
 * API client with auth headers
 */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const orgSlug = await getOrgSlug();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (orgSlug) {
    headers['x-organization-slug'] = orgSlug;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${errorBody}`);
  }

  return res.json();
}

/**
 * Sign in with email/password
 */
export async function signIn(email: string, password: string): Promise<{
  user: { id: string; name: string; email: string };
  token: string;
}> {
  const res = await fetch(`${API_BASE}/api/auth/mobile/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Sign in failed' }));
    throw new Error(body.error || 'Sign in failed');
  }

  const data = await res.json();
  await setToken(data.token);
  return data;
}

/**
 * Sign out — clear all stored credentials
 */
export async function signOut() {
  await clearToken();
  await clearOrgSlug();
}
