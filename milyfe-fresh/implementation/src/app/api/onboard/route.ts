import { NextResponse } from 'next/server';
import { ApiEnvelope } from '@/contracts';
import { serviceClient, userIdFromAuthHeader } from '@/lib/supabase';
import { signServerReceipt } from '@/lib/server-receipt';
import { z } from 'zod';

const CompleteParams = z.object({ flowId: z.string().min(1), entity: z.string().regex(/^did:milyfe:/), kind: z.string().min(1) });

// POST /api/onboard — server record of a completed device-first onboarding.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const env = ApiEnvelope.safeParse(body);
  if (!env.success) return NextResponse.json({ ok: false, error: 'BAD_ENVELOPE' }, { status: 400 });
  const params = CompleteParams.safeParse(env.data.params);
  if (!params.success) return NextResponse.json({ ok: false, error: 'BAD_PARAMS' }, { status: 400 });
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });

  const receipt = await signServerReceipt({
    branch: 'trunk', os: 'MiOnboard', purpose: `onboarding completed (${params.data.kind})`,
    capability: 'mionboard.complete', approval: { by: authed, role: 'member', scope: params.data.kind, reason: 'joined' },
    impact: { data: params.data.entity }, status: 'executed',
    correction: { path: 'export + leave anytime', route: '/you' },
    explains: 'Your MiLyfe profile is recorded. You can export everything and leave anytime — no retaliation, ever.',
  });
  const svc = serviceClient();
  await svc.from('entities').upsert({ did: params.data.entity, owner: authed, type: params.data.kind, status: 'active' }, { onConflict: 'did' });
  await svc.from('receipts').insert({ id: receipt.id, receipt });
  return NextResponse.json({ ok: true, receipt });
}
