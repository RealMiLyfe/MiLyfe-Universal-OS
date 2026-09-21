import { NextResponse } from 'next/server';
import { serviceClient, userIdFromAuthHeader } from '@/lib/supabase';

// GET /api/export — full server-held export for the caller. ALWAYS available:
// no freeze, dispute, quarantine, or status check gates this path (by design).
export async function GET(req: Request) {
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });
  const svc = serviceClient();
  const [entities, wallets, deposits, swaps, receipts] = await Promise.all([
    svc.from('entities').select('*').eq('owner', authed),
    svc.from('wallets').select('*').eq('owner', authed),
    svc.from('crypto_deposits').select('*').eq('owner', authed),
    svc.from('swap_listings').select('*').eq('owner', authed),
    svc.from('receipts').select('*').eq('owner', authed),
  ]);
  return NextResponse.json({
    ok: true,
    exportedAt: new Date().toISOString(),
    entities: entities.data ?? [], wallets: wallets.data ?? [],
    deposits: deposits.data ?? [], swaps: swaps.data ?? [], receipts: receipts.data ?? [],
  });
}
