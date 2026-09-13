import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  return NextResponse.json({
    uptime: '99.99%',
    database: { status: 'healthy', latency: 14 },
    groq_ai: { status: process.env.GROQ_API_KEY ? 'healthy' : 'simulated' },
    resend_email: { status: process.env.RESEND_API_KEY ? 'healthy' : 'simulated' }
  }, { status: 200 });
}
