import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { captureError } from '@/lib/observability/logger';

/**
 * Health check endpoint for load balancers, uptime monitors, and probes.
 *
 * GET /api/health
 *   200 { status: 'ok',       checks: { database: 'ok' } }
 *   503 { status: 'degraded', checks: { database: 'down' } }
 *
 * Intentionally unauthenticated (probes have no session) and leaks no
 * internals — only up/down per dependency.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, 'ok' | 'down'> = {};

  // Database connectivity: cheap, RLS-safe probe.
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from('profiles').select('id', { head: true, count: 'exact' }).limit(1);
    checks.database = error ? 'down' : 'ok';
    if (error) {
      captureError(error, { route: '/api/health', check: 'database' });
    }
  } catch (err) {
    checks.database = 'down';
    captureError(err, { route: '/api/health', check: 'database' });
  }

  const healthy = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
