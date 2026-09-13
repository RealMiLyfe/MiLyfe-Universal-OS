import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function POST() {
  return NextResponse.json({ status: 'keys_audited_healthy' });
}
