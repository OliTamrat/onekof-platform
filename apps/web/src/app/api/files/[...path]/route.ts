/**
 * Local-fs file serving route.
 *
 * Only active when STORAGE_DRIVER=local-fs (Tier 2 on-premise, future Tier 1).
 * On Tier 3 (STORAGE_DRIVER=vercel-blob), this route returns 404 because file
 * URLs point directly at blob.vercel-storage.com and never reach this handler.
 *
 * Security: this route enforces the same org-membership check that the
 * upload handler enforces. A signed-in user can only download an attachment
 * if (a) the file exists in the DB and (b) the user belongs to the organization
 * that owns the task the attachment is bound to. Path traversal is rejected by
 * re-running the same `sanitizeKey` discipline the LocalFsDriver uses for writes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { promises as fs } from 'fs';
import path from 'path';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Route is only active on local-fs deployments
  if (process.env.STORAGE_DRIVER !== 'local-fs') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const rootDir = process.env.STORAGE_LOCAL_ROOT;
  const baseUrl = process.env.STORAGE_LOCAL_BASE_URL;
  if (!rootDir || !baseUrl) {
    logger.error('Files route called but local-fs storage is misconfigured', {
      rootDir: Boolean(rootDir),
      baseUrl: Boolean(baseUrl),
    });
    return NextResponse.json(
      { error: 'File storage misconfigured' },
      { status: 500 },
    );
  }

  // Require authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Reconstruct the key from the dynamic route segments. Enforce the same
  // safety rules the driver uses on writes.
  const rawKey = (params.path || []).join('/');
  if (!rawKey) {
    return NextResponse.json({ error: 'Missing file path' }, { status: 400 });
  }
  if (rawKey.includes('..') || /^[a-zA-Z]:/.test(rawKey)) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9 _./-]+$/.test(rawKey)) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  // Compose the expected URL for this file and look up the attachment row
  // that produced it. This is how we enforce org-membership without trusting
  // the URL the browser sent — we only serve files that are actually
  // registered as attachments on a task the user can access.
  const expectedUrl = `${baseUrl.replace(/\/+$/, '')}/${rawKey}`;
  const attachment = await prisma.attachment.findFirst({
    where: { url: expectedUrl },
    include: {
      task: { select: { project: { select: { organizationId: true } } } },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: attachment.task.project.organizationId,
        userId: session.user.id,
      },
    },
  });
  if (!membership) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Resolve the physical path and defend against traversal after join
  const resolvedRoot = path.resolve(rootDir);
  const fullPath = path.join(resolvedRoot, rawKey);
  if (!fullPath.startsWith(resolvedRoot + path.sep) && fullPath !== resolvedRoot) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  try {
    const data = await fs.readFile(fullPath);
    // Cast to BlobPart to satisfy Response constructor on Node 20+ typings
    return new NextResponse(data as unknown as BlobPart, {
      status: 200,
      headers: {
        'Content-Type': attachment.mimeType || 'application/octet-stream',
        'Content-Length': String(attachment.size),
        'Content-Disposition': `inline; filename="${attachment.filename.replace(/"/g, '')}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }
    logger.error('Failed to read local-fs attachment', {
      error: err instanceof Error ? err.message : err,
    });
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
