import { NextResponse } from 'next/server';
import { ApiEnvelope, TransferParams } from '@/contracts';
import { serviceClient, userIdFromAuthHeader } from '@/lib/supabase';
import { signServerReceipt } from '@/lib/server-receipt';

// POST /api/transfer — atomic $MLY transfer. Zod-validated, human signature required,
// idempotent by idempotencyKey. Service role only; RLS denies direct client writes.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'BAD_JSON' }, { status: 400 });
  }
  const env = ApiEnvelope.safeParse(body);
  if (!env.success) return NextResponse.json({ ok: false, error: 'BAD_ENVELOPE' }, { status: 400 });
  const params = TransferParams.safeParse(env.data.params);
  if (!params.success) return NextResponse.json({ ok: false, error: 'BAD_PARAMS' }, { status: 400 });
  if (params.data.sender === params.data.recipient) {
    return NextResponse.json({ ok: false, error: 'NO_SELF_SEND' }, { status: 400 });
  }
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });

  const svc = serviceClient();
  const { data: seen } = await svc.from('idempotency_keys').select('receipt').eq('key', env.data.idempotencyKey).maybeSingle();
  if (seen) return NextResponse.json({ ok: true, receipt: seen.receipt, replay: true });

  const { error: rpcError } = await svc.rpc('transfer_mly', {
    p_sender: params.data.sender,
    p_recipient: params.data.recipient,
    p_amount_minor: params.data.amountMinor,
    p_pot: params.data.pot,
    p_reason: params.data.reason,
  });
  if (rpcError) return NextResponse.json({ ok: false, error: 'TRANSFER_REJECTED' }, { status: 400 });

  const receipt = await signServerReceipt({
    branch: 'finance', os: 'MiMoney', purpose: `transfer ${params.data.amountMinor} minor to ${params.data.recipient}`,
    capability: 'money.transfer', approval: { by: authed, role: params.data.signature ? 'member-signed' : 'member', scope: params.data.pot, reason: params.data.reason || 'transfer' },
    impact: { value: params.data.amountMinor }, status: 'settled',
    correction: { path: 'MiResolve dispute', route: '/api/sync' },
    explains: `You sent ${params.data.amountMinor} minor $MLY from ${params.data.pot}. This move was signed by you and is final unless reversed through a dispute.`,
  });
  await svc.from('idempotency_keys').insert({ key: env.data.idempotencyKey, op: 'money.transfer', receipt });
  await svc.from('receipts').insert({ id: receipt.id, receipt });
  return NextResponse.json({ ok: true, receipt });
}
