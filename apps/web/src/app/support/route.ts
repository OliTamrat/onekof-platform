import { readFileSync } from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'support.html');
  const html = readFileSync(filePath, 'utf-8');
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
