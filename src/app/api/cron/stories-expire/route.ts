import { createServiceSupabase } from '@/lib/supabase/server';
import { isAuthorizedCronRequest } from '@/lib/security/cron';
import { NextResponse } from 'next/server';

/**
 * Stories expiry cron — deletes stories past their 24h expires_at.
 * Runs hourly. Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createServiceSupabase();
  const now = new Date().toISOString();
  const { error, count } = await (supabase as unknown as { from: (t: string) => any })
    .from('stories').delete({ count: 'exact' }).lt('expires_at', now);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ expired: count ?? 0, timestamp: now });
}
