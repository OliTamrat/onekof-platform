import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@onekof/database';
import { put, del } from '@vercel/blob';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

    // Verify task access via project org
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { project: { select: { organizationId: true } } },
    });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: task.project.organizationId,
          userId: session.user.id,
        },
      },
    });
    if (!membership) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

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

    // Verify task access via project org
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { id: true, project: { select: { organizationId: true } } },
    });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: task.project.organizationId,
          userId: session.user.id,
        },
      },
    });
    if (!membership) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

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

    // Upload to Vercel Blob (if configured) or store metadata only
    let fileUrl: string;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(
        `tasks/${params.id}/${Date.now()}-${file.name}`,
        file,
        { access: 'public', addRandomSuffix: false }
      );
      fileUrl = blob.url;
    } else {
      // Fallback: return error if storage not configured
      return NextResponse.json(
        { error: 'File storage not configured. Set BLOB_READ_WRITE_TOKEN in Vercel env vars.' },
        { status: 503 }
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

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { task: { select: { id: true, project: { select: { organizationId: true } } } } },
    });
    if (!attachment || attachment.taskId !== params.id) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Check org membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: attachment.task.project.organizationId,
          userId: session.user.id,
        },
      },
    });
    if (!membership) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    // Delete from blob storage
    if (process.env.BLOB_READ_WRITE_TOKEN && attachment.url.includes('blob.vercel-storage.com')) {
      try {
        await del(attachment.url);
      } catch {
        // Continue even if blob delete fails
      }
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting attachment', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
