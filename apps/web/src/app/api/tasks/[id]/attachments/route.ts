import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { storage } from '@/lib/storage';
import { requireTaskAccess } from '@/lib/security/authorization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// SECURITY: Allowed MIME types for file uploads — blocks executables, scripts, and HTML
const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Archives
  'application/zip',
  'application/gzip',
  'application/x-tar',
  // Other
  'application/json',
]);

/**
 * GET /api/tasks/[id]/attachments
 * List all attachments for a task
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Organization membership alone was the whole check here, which let any
    // member of the tenant read attachments on a PRIVATE or CONFIDENTIAL
    // project they were never added to. requireTaskAccess applies the same
    // project-visibility rules as the list endpoints, plus the M2 care-item
    // rule — an attachment on a care item is very often a scan or a report.
    const access = await requireTaskAccess(params.id, session.user.id);
    if (!access.authorized) return access.error!;

    const attachments = await prisma.attachment.findMany({
      where: { taskId: params.id },
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ attachments });
  } catch (error) {
    logger.error('Error fetching attachments', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}

/**
 * POST /api/tasks/[id]/attachments
 * Upload a file attachment to a task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Same gap as GET: org membership was the only check, so any member could
    // upload into a project they had no access to. MEMBER-level project
    // access, plus the M2 care-item rule, before anything is written.
    const access = await requireTaskAccess(params.id, session.user.id, 'MEMBER');
    if (!access.authorized) return access.error!;

    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      );
    }

    // SECURITY: Validate MIME type — block executables, scripts, HTML
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported: PDF, Word, Excel, PowerPoint, images, CSV, ZIP, and plain text.' },
        { status: 400 }
      );
    }

    // Upload via the configured storage driver. The driver is selected by the
    // STORAGE_DRIVER env var: vercel-blob (Tier 3 default), local-fs (Tier 2
    // on-prem), or s3 (Tier 1, future). Each driver throws with a descriptive
    // error message if its required config is missing.
    let fileUrl: string;
    try {
      const result = await storage.put(
        `tasks/${params.id}/${Date.now()}-${file.name}`,
        file,
        { contentType: file.type || undefined },
      );
      fileUrl = result.url;
    } catch (err) {
      logger.error('Storage driver refused upload', {
        error: err instanceof Error ? err.message : err,
      });
      return NextResponse.json(
        {
          error:
            'File storage is not configured. Check STORAGE_DRIVER and its required env vars.',
        },
        { status: 503 },
      );
    }

    // Save metadata to DB
    const attachment = await prisma.attachment.create({
      data: {
        taskId: params.id,
        filename: file.name,
        url: fileUrl,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    logger.error('Error uploading attachment', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]/attachments?attachmentId=xxx
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attachmentId = request.nextUrl.searchParams.get('attachmentId');
    if (!attachmentId) {
      return NextResponse.json({ error: 'attachmentId required' }, { status: 400 });
    }

    // Access is checked against the task in the URL before the attachment is
    // even looked up, so a caller cannot probe attachment ids against a task
    // they may not touch.
    const access = await requireTaskAccess(params.id, session.user.id, 'MEMBER');
    if (!access.authorized) return access.error!;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      select: { id: true, url: true, taskId: true },
    });
    if (!attachment || attachment.taskId !== params.id) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Delete from underlying storage via the active driver. Drivers are
    // responsible for handling URLs created by any driver (a VercelBlob URL
    // may still exist in the DB if the deployment switched drivers), and for
    // treating missing files as a no-op.
    try {
      await storage.delete(attachment.url);
    } catch (err) {
      // Log but do not fail the request — the DB row is about to be deleted,
      // and a stale blob is preferable to a stuck delete from the user's view.
      logger.warn('Storage delete failed, continuing with DB delete', {
        error: err instanceof Error ? err.message : err,
      });
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting attachment', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
