/**
 * Local filesystem storage driver.
 *
 * Writes attachments to a directory on the local filesystem. Used by
 * self-hosted Onekof deployments (Tier 2 on-premise Ethiopian servers) where
 * there is no managed object store.
 *
 * Served back to users via the `/api/files/[...path]` route handler, which
 * this driver's URLs point to. The route handler is responsible for
 * authenticating the request before serving the file.
 *
 * Configuration (required when STORAGE_DRIVER=local-fs):
 *   STORAGE_LOCAL_ROOT   — filesystem directory where files are written
 *                           (e.g., /var/onekof/blobs). Created on first use.
 *   STORAGE_LOCAL_BASE_URL — public base URL for file access
 *                           (e.g., https://onekof.et/api/files)
 */

import { promises as fs } from 'fs';
import path from 'path';
import type {
  StorageDriver,
  StoragePutOptions,
  StoragePutResult,
} from '../types';

export class LocalFsDriver implements StorageDriver {
  readonly id = 'local-fs' as const;

  private readonly rootDir: string;
  private readonly baseUrl: string;

  constructor() {
    const rootDir = process.env.STORAGE_LOCAL_ROOT;
    const baseUrl = process.env.STORAGE_LOCAL_BASE_URL;

    if (!rootDir) {
      throw new Error(
        'LocalFsDriver: STORAGE_LOCAL_ROOT is not set. ' +
          'Set it to the filesystem directory where attachments should be written ' +
          '(e.g., /var/onekof/blobs).',
      );
    }
    if (!baseUrl) {
      throw new Error(
        'LocalFsDriver: STORAGE_LOCAL_BASE_URL is not set. ' +
          'Set it to the public base URL that serves files back to users ' +
          '(e.g., https://onekof.et/api/files).',
      );
    }

    this.rootDir = path.resolve(rootDir);
    this.baseUrl = baseUrl.replace(/\/+$/, ''); // trim trailing slash
  }

  /**
   * Reject any key that contains path traversal or absolute components.
   * The key MUST be a relative, forward-slash-delimited path consisting of
   * safe characters only. This is the same contract Vercel Blob and S3 use.
   */
  private sanitizeKey(key: string): string {
    if (!key || typeof key !== 'string') {
      throw new Error('LocalFsDriver: key must be a non-empty string');
    }
    // Normalize separators and strip leading slashes
    const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '');
    // Reject traversal
    if (normalized.includes('..')) {
      throw new Error('LocalFsDriver: key must not contain ".." segments');
    }
    // Reject absolute Windows paths like C:/...
    if (/^[a-zA-Z]:/.test(normalized)) {
      throw new Error('LocalFsDriver: key must not be an absolute path');
    }
    // Whitelist allowed characters: letters, digits, dash, underscore, dot, slash, space
    if (!/^[a-zA-Z0-9 _./-]+$/.test(normalized)) {
      throw new Error(
        'LocalFsDriver: key contains unsupported characters; allowed: letters, digits, space, - _ . /',
      );
    }
    return normalized;
  }

  async put(
    key: string,
    body: File | Blob,
    _options: StoragePutOptions = {},
  ): Promise<StoragePutResult> {
    const safeKey = this.sanitizeKey(key);
    const fullPath = path.join(this.rootDir, safeKey);
    const dir = path.dirname(fullPath);

    // Defense in depth: re-verify after path.join that we're still inside rootDir
    if (!fullPath.startsWith(this.rootDir + path.sep) && fullPath !== this.rootDir) {
      throw new Error('LocalFsDriver: resolved path escapes storage root');
    }

    await fs.mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await body.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    // URL uses forward slashes regardless of OS
    const urlPath = safeKey.split(path.sep).join('/');
    return {
      url: `${this.baseUrl}/${urlPath}`,
      driverId: this.id,
      size: body.size,
    };
  }

  async delete(urlOrKey: string): Promise<void> {
    let key: string;
    if (urlOrKey.startsWith(this.baseUrl + '/')) {
      key = urlOrKey.slice(this.baseUrl.length + 1);
    } else if (!urlOrKey.startsWith('http://') && !urlOrKey.startsWith('https://')) {
      // Treat as a raw key
      key = urlOrKey;
    } else {
      // URL from a different driver — ignore
      return;
    }

    let safeKey: string;
    try {
      safeKey = this.sanitizeKey(key);
    } catch {
      // Malformed key — nothing to delete
      return;
    }

    const fullPath = path.join(this.rootDir, safeKey);
    if (!fullPath.startsWith(this.rootDir + path.sep) && fullPath !== this.rootDir) {
      return;
    }

    try {
      await fs.unlink(fullPath);
    } catch (err: unknown) {
      // ENOENT is fine — idempotent delete
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') {
        throw err;
      }
    }
  }

  async ping(): Promise<{ ok: boolean; detail?: string }> {
    try {
      await fs.mkdir(this.rootDir, { recursive: true });
      // Write-read-delete a probe file to confirm the directory is usable
      const probe = path.join(this.rootDir, '.ping-probe');
      await fs.writeFile(probe, 'ok');
      await fs.unlink(probe);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        detail: err instanceof Error ? err.message : 'unknown error',
      };
    }
  }
}
