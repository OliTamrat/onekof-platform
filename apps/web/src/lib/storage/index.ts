/**
 * Storage driver factory.
 *
 * Reads the STORAGE_DRIVER env var and returns a singleton driver for the
 * current process. The default is `vercel-blob`, which preserves the behavior
 * that existed before Wave 1 on Tier 3 deployments.
 *
 * Usage:
 *   import { storage } from '@/lib/storage';
 *
 *   const result = await storage.put('tasks/abc/file.png', file, { access: 'public' });
 *   await storage.delete(result.url);
 */

import type { StorageDriver, StorageDriverId } from './types';
import { VercelBlobDriver } from './drivers/vercel-blob';
import { LocalFsDriver } from './drivers/local-fs';

let cached: StorageDriver | null = null;

function createDriver(): StorageDriver {
  const raw = (process.env.STORAGE_DRIVER || 'vercel-blob').trim().toLowerCase();

  switch (raw as StorageDriverId) {
    case 'vercel-blob':
      return new VercelBlobDriver();
    case 'local-fs':
      return new LocalFsDriver();
    case 's3':
      throw new Error(
        'StorageDriver: S3 driver is not yet implemented. ' +
          'Set STORAGE_DRIVER=vercel-blob (Tier 3) or STORAGE_DRIVER=local-fs (Tier 2).',
      );
    default:
      throw new Error(
        `StorageDriver: unknown STORAGE_DRIVER "${raw}". ` +
          'Expected one of: vercel-blob, local-fs, s3.',
      );
  }
}

/**
 * Lazy singleton driver for the current process.
 *
 * We use a getter so that module-level imports don't force driver instantiation
 * at build time — which matters for Next.js, since missing env vars at build
 * time would crash the build even when the driver isn't actually used on that
 * code path.
 */
export function getStorage(): StorageDriver {
  if (!cached) {
    cached = createDriver();
  }
  return cached;
}

/**
 * Convenience accessor matching the style used in the rest of the codebase.
 * `storage.put(...)` reads cleanly in API routes.
 */
export const storage: StorageDriver = new Proxy({} as StorageDriver, {
  get(_target, prop: keyof StorageDriver) {
    const driver = getStorage();
    const value = driver[prop];
    return typeof value === 'function' ? value.bind(driver) : value;
  },
});
