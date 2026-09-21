import { NextResponse } from 'next/server';
import { LOCKED_FLAGS } from '@/trunk/miscale';

// GET /api/rails-status — public, honest lock board. No auth needed: locks are
// public promises. Locks cover outside touchpoints only — never MiLyfe's
// existence or internal voluntary MLY activity.
export async function GET() {
  return NextResponse.json({ ok: true, locked: LOCKED_FLAGS, note: 'Locks cover outside touchpoints only.' });
}
