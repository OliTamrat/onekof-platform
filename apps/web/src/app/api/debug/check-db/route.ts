import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || 'NOT_SET';

    // Mask password for security
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');

    return NextResponse.json({
      databaseConfigured: dbUrl !== 'NOT_SET',
      databaseHost: maskedUrl.includes('supabase') ? 'Supabase' :
                     maskedUrl.includes('render') ? 'Render' :
                     maskedUrl.includes('localhost') ? 'Localhost' : 'Unknown',
      maskedUrl: maskedUrl,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
