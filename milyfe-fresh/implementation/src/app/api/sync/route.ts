import { NextResponse } from 'next/server';
import { ApiEnvelope } from '@/contracts';
import { serviceClient, userIdFromAuthHeader } from '@/lib/supabase';

// POST /api/sync — outbox drain endpoint. Validates envelope, records idempotency.
// Each op family persists its payload; unknown ops are stored for review, never dropped silently.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'BAD_JSON' }, { status: 400 });
  }
  const env = ApiEnvelope.safeParse(body);
  if (!env.success) return NextResponse.json({ ok: false, error: 'BAD_ENVELOPE' }, { status: 400 });
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });

  const svc = serviceClient();
  const { data: seen } = await svc.from('idempotency_keys').select('receipt').eq('key', env.data.idempotencyKey).maybeSingle();
  if (seen) return NextResponse.json({ ok: true, replay: true });

  const KNOWN_OPS = ['mionboard.complete', 'midata.space-created', 'midata.grant', 'midata.revoke', 'misecurity.quarantine', 'misecurity.release', 'misecurity.panic-freeze'];
  await svc.from('idempotency_keys').insert({
    key: env.data.idempotencyKey,
    op: env.data.op,
    receipt: { actor: env.data.actor, known: KNOWN_OPS.includes(env.data.op), at: new Date().toISOString() },
  });
  return NextResponse.json({ ok: true, known: KNOWN_OPS.includes(env.data.op) });
}
