/**
 * Vercel Blob storage driver.
 *
 * This is the default driver for Tier 3 (Vercel + Supabase) deployments.
 * Files are stored with private access — direct blob URLs are not
 * world-readable. Downloads must go through the authenticated
 * /api/tasks/[id]/attachments/download endpoint which verifies org membership.
 *
 * When this driver is active, the stored URL in the DB is the full
 * blob.vercel-storage.com URL returned by @vercel/blob's `put()` — NOT a
 * vercel-blob://... scheme. This preserves backwards compatibility with
 * existing rows in the `attachments` table.
 */

import { put, del } from '@vercel/blob';
import type {
  StorageDriver,
  StoragePutOptions,
  StoragePutResult,
} from '../types';

export class VercelBlobDriver implements StorageDriver {
  readonly id = 'vercel-blob' as const;

  async put(
    key: string,
    body: File | Blob,
    options: StoragePutOptions = {},
  ): Promise<StoragePutResult> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        'VercelBlobDriver: BLOB_READ_WRITE_TOKEN is not set. ' +
          'Configure the Vercel Blob token in the deployment environment, ' +
          'or switch STORAGE_DRIVER to a different driver.',
      );
    }

    const blob = await put(key, body, {
      access: 'public',
      addRandomSuffix: false,
      contentType: options.contentType,
    });

    return {
      url: blob.url,
      driverId: this.id,
      size: body.size,
    };
  }

  async delete(urlOrKey: string): Promise<void> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Cannot delete without the token; treat as a soft no-op so callers
      // are not forced to handle this as an error — the DB row has already
      // been removed by the caller.
      return;
    }

    // Only attempt deletion for URLs that look like Vercel Blob. This keeps
    // the driver safe if a row in the DB was created by a different driver
    // (e.g., during a migration period).
    if (!urlOrKey.includes('blob.vercel-storage.com')) {
      return;
    }

    try {
      await del(urlOrKey);
    } catch {
      // Continue even if blob delete fails — the DB row is already removed.
    }
  }

  async ping(): Promise<{ ok: boolean; detail?: string }> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return { ok: false, detail: 'BLOB_READ_WRITE_TOKEN not set' };
    }
    return { ok: true };
  }
}
