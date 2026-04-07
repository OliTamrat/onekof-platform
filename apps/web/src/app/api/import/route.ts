import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { parseCSV } from '@/lib/import/csv-parser';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const type = formData.get('type') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!['issues', 'tasks', 'budgets', 'members'].includes(type)) {
    return NextResponse.json({ error: 'Invalid import type' }, { status: 400 });
  }

  const content = await file.text();
  const result = parseCSV(content);

  if (result.errors.length > 0 && result.rows.length === 0) {
    return NextResponse.json(
      { error: 'Failed to parse CSV. Check the file format and try again.' },
      { status: 400 }
    );
  }

  // Return parsed data for preview before committing
  return NextResponse.json({
    success: true,
    preview: true,
    headers: result.headers,
    sampleRows: result.rows.slice(0, 5),
    totalRows: result.totalRows,
    validRows: result.rows.length,
    errors: result.errors,
  });
}
