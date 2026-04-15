import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'onekof_offline_queue';
const CACHE_PREFIX = 'onekof_cache_';

interface QueuedRequest {
  id: string;
  path: string;
  method: string;
  body?: string;
  createdAt: string;
}

/**
 * Queue a mutation for later sync when offline
 */
export async function queueOfflineMutation(
  path: string,
  method: string,
  body?: string
): Promise<void> {
  const queue = await getOfflineQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    path,
    method,
    body,
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Get pending offline mutations
 */
export async function getOfflineQueue(): Promise<QueuedRequest[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Remove a processed item from queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

/**
 * Clear entire queue
 */
export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/**
 * Cache API response for offline reading
 */
export async function cacheResponse(path: string, data: any): Promise<void> {
  await AsyncStorage.setItem(
    CACHE_PREFIX + path,
    JSON.stringify({ data, cachedAt: Date.now() })
  );
}

/**
 * Get cached response
 */
export async function getCachedResponse<T = any>(path: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(CACHE_PREFIX + path);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  // Cache expires after 1 hour
  if (Date.now() - parsed.cachedAt > 3600000) return null;
  return parsed.data;
}

/**
 * Check if we have a cached response
 */
export async function hasCachedResponse(path: string): Promise<boolean> {
  const data = await getCachedResponse(path);
  return data !== null;
}
