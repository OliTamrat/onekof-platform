/**
 * Storage driver interface for Onekof file attachments.
 *
 * Onekof supports multiple storage backends to enable multi-tier hosting:
 * - VercelBlob: managed cloud storage (Tier 3, current default)
 * - LocalFs: filesystem-backed storage for self-hosted deployments (Tier 2 on-prem)
 * - S3 (future): S3-compatible object storage (Tier 1 EthioTelecom / MinIO)
 *
 * All drivers implement the same interface so api/tasks/[id]/attachments/route.ts
 * and any other attachment code stays portable. The active driver is selected by
 * the STORAGE_DRIVER environment variable at process startup.
 *
 * The stored URL contains a driver-id prefix tag so future delete operations
 * can dispatch to the correct driver without re-reading env state.
 */

export type StorageDriverId = 'vercel-blob' | 'local-fs' | 's3';

/**
 * Access mode for an uploaded file.
 * - 'public': URL is directly fetchable without authentication
 * - 'private': URL requires a signed session or server-side proxy
 *
 * The current Onekof attachment flow uploads everything as 'public' because
 * task attachments are already gated behind organization membership checks.
 * The 'private' mode is reserved for future use.
 */
export type StorageAccess = 'public' | 'private';

export interface StoragePutOptions {
  /** 'public' or 'private'. Default 'public' matches the current Vercel Blob behavior. */
  access?: StorageAccess;
  /** Optional MIME type hint (drivers may ignore or override). */
  contentType?: string;
}

export interface StoragePutResult {
  /**
   * The URL saved in the database and returned to the client. Format depends
   * on the driver — for example:
   *   vercel-blob://acmecorp/tasks/abc/file.png
   *   local-fs:///var/onekof/blobs/tasks/abc/file.png
   *   s3://bucket/tasks/abc/file.png
   *
   * The scheme prefix is the StorageDriverId and allows future code to dispatch
   * delete/read operations to the correct backend regardless of which driver is
   * currently active in the process.
   */
  url: string;
  /** The underlying driver that handled the upload. */
  driverId: StorageDriverId;
  /** File size in bytes, as confirmed after the write completed. */
  size: number;
}

export interface StorageDriver {
  /** Stable identifier used to tag stored URLs. */
  readonly id: StorageDriverId;

  /**
   * Write a file under the given storage key.
   *
   * `key` is a driver-agnostic logical path such as `tasks/abc/file.png`.
   * The driver may transform it into a physical path or object key.
   */
  put(
    key: string,
    body: File | Blob,
    options?: StoragePutOptions,
  ): Promise<StoragePutResult>;

  /**
   * Delete a previously-stored file. `urlOrKey` may be either:
   * - The full URL returned by `put()` (preferred)
   * - A logical key (for tooling/scripts)
   *
   * This method must be idempotent: deleting a missing file should not throw.
   */
  delete(urlOrKey: string): Promise<void>;

  /**
   * Check whether the driver is reachable. Used by health checks.
   * Returns { ok: true } if writes/deletes would currently succeed.
   */
  ping(): Promise<{ ok: boolean; detail?: string }>;
}
