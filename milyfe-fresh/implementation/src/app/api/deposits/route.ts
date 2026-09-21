import { NextResponse } from 'next/server';
import { ApiEnvelope, CryptoDeposit } from '@/contracts';
import { serviceClient, userIdFromAuthHeader } from '@/lib/supabase';
import { signServerReceipt } from '@/lib/server-receipt';

// POST /api/deposits — announce a crypto deposit (USDC/USDT/SOL/BTC/ETH/XRP).
// Announced/observed only; credit happens after confirmation policy (MiMoney job).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const env = ApiEnvelope.safeParse(body);
  if (!env.success) return NextResponse.json({ ok: false, error: 'BAD_ENVELOPE' }, { status: 400 });
  const dep = CryptoDeposit.safeParse({ ...(env.data.params as object), receipt: 'pending' });
  if (!dep.success) return NextResponse.json({ ok: false, error: 'BAD_PARAMS' }, { status: 400 });
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });

  const receipt = await signServerReceipt({
    branch: 'finance', os: 'MiMoney', purpose: `crypto deposit announced ${dep.data.asset} ${dep.data.amount}`,
    capability: 'money.deposit-crypto', approval: { by: authed, role: 'member', scope: dep.data.asset, reason: 'deposit-announced' },
    impact: { value: 'projected until confirmations pass' }, status: 'proposed',
    correction: { path: 'MiResolve dispute', route: '/api/sync' },
    explains: `Your ${dep.data.asset} deposit was seen. It is projected — not spendable — until network confirmations pass.`,
  });
  const svc = serviceClient();
  const { error } = await svc.from('crypto_deposits').insert({
    id: dep.data.id, entity: dep.data.entity, asset: dep.data.asset, amount: dep.data.amount,
    tx: dep.data.tx, confirmations: 0, status: 'announced', credited_mly: '0', receipt_id: receipt.id,
  });
  if (error) return NextResponse.json({ ok: false, error: 'DEPOSIT_REJECTED' }, { status: 400 });
  await svc.from('receipts').insert({ id: receipt.id, receipt });
  return NextResponse.json({ ok: true, receipt });
}
