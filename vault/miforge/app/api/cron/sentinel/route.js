import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  return NextResponse.json({ status: 'sentinel_active', uptime: '99.99%' });
}
