import * as SecureStore from 'expo-secure-store';
import { cacheResponse, getCachedResponse, queueOfflineMutation } from './offline';

// Always use production API — mobile connects over the network
const API_BASE = 'https://onekof.com';

const TOKEN_KEY = 'onekof_session_token';
const ORG_SLUG_KEY = 'onekof_org_slug';

/* ─── Online-state observer ───
 * Determined solely by apiFetch results:
 *   - Any HTTP response (even 4xx/5xx) → online (server was reachable)
 *   - Network error ("Network request failed") → offline
 * NetInfo was removed because it incorrectly reports isConnected=false
 * on iOS even when the device has full WiFi connectivity.
 */
let currentIsOnline = true;
const onlineListeners: Array<(isOnline: boolean) => void> = [];

export function getIsOnline(): boolean {
  return currentIsOnline;
}

export function subscribeOnlineState(cb: (isOnline: boolean) => void): () => void {
  onlineListeners.push(cb);
  cb(currentIsOnline);
  return () => {
    const idx = onlineListeners.indexOf(cb);
    if (idx >= 0) onlineListeners.splice(idx, 1);
  };
}

function setOnlineState(isOnline: boolean) {
  if (currentIsOnline === isOnline) return;
  currentIsOnline = isOnline;
  onlineListeners.forEach((cb) => cb(isOnline));
}

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
 * API client with auth headers and offline support
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

  const method = options.method || 'GET';
  const isRead = method === 'GET';

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    // A successful response (even a 4xx/5xx) means we reached the server
    // → we're online. Auth errors don't imply offline.
    setOnlineState(true);

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(`API ${res.status}: ${errorBody}`);
    }

    const data = await res.json();

    // Cache successful GET responses for offline use
    if (isRead) {
      cacheResponse(path, data).catch(() => {});
    }

    return data;
  } catch (error) {
    const msg = (error as Error)?.message || '';
    const isNetworkError = msg.includes('Network request failed') || msg.includes('Failed to fetch');

    // Only flip to offline on real network errors, not API error responses
    if (isNetworkError) setOnlineState(false);

    // If GET request fails, try to return cached data
    if (isRead) {
      const cached = await getCachedResponse<T>(path);
      if (cached) return cached;
    }

    // If mutation fails (likely offline), queue it
    if (!isRead && isNetworkError) {
      await queueOfflineMutation(path, method, options.body as string);
      throw new Error('Saved offline — will sync when reconnected');
    }

    throw error;
  }
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
 * Upload a file via FormData (no JSON Content-Type header).
 * Used for document uploads where the API expects multipart/form-data.
 */
export async function apiUpload<T = any>(
  path: string,
  formData: FormData,
): Promise<T> {
  const token = await getToken();
  const orgSlug = await getOrgSlug();

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (orgSlug) headers['x-organization-slug'] = orgSlug;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Upload ${res.status}: ${errorBody}`);
  }

  return res.json();
}

/**
 * Sign out — clear all stored credentials
 */
export async function signOut() {
  await clearToken();
  await clearOrgSlug();
}
