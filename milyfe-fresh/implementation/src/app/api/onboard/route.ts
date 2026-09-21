import { NextResponse } from 'next/server';
import { ApiEnvelope, BusinessOnboardParams } from '@/contracts';
import { serviceClient, userIdFromAuthHeader } from '@/lib/supabase';
import { signServerReceipt } from '@/lib/server-receipt';
import { z } from 'zod';

const CompleteParams = z.object({
  flowId: z.string().min(1),
  entity: z.string().regex(/^did:milyfe:/),
  kind: z.enum(['person', 'youth', 'shop']),
  shop: BusinessOnboardParams.optional(),
});

// POST /api/onboard — server record of a completed device-first onboarding.
// kind=shop additionally creates the business row (validated, owner-scoped).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const env = ApiEnvelope.safeParse(body);
  if (!env.success) return NextResponse.json({ ok: false, error: 'BAD_ENVELOPE' }, { status: 400 });
  const params = CompleteParams.safeParse(env.data.params);
  if (!params.success) return NextResponse.json({ ok: false, error: 'BAD_PARAMS' }, { status: 400 });
  if (params.data.kind === 'shop' && !params.data.shop) {
    return NextResponse.json({ ok: false, error: 'SHOP_DETAILS_REQUIRED' }, { status: 400 });
  }
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });

  const receipt = await signServerReceipt({
    branch: 'trunk', os: 'MiOnboard', purpose: `onboarding completed (${params.data.kind})`,
    capability: 'mionboard.complete', approval: { by: authed, role: 'member', scope: params.data.kind, reason: 'joined' },
    impact: { data: params.data.entity }, status: 'executed',
    correction: { path: 'export + leave anytime', route: '/you' },
    explains: params.data.kind === 'shop'
      ? 'Your shop profile is recorded. Your books, listings, and hire board unlock in later slices.'
      : 'Your MiLyfe profile is recorded. You can export everything and leave anytime — no retaliation, ever.',
  });
  const svc = serviceClient();
  await svc.from('entities').upsert({ did: params.data.entity, owner: authed, type: params.data.kind, status: 'active' }, { onConflict: 'did' });
  if (params.data.kind === 'shop' && params.data.shop) {
    const s = params.data.shop;
    await svc.from('shops').insert({
      owner: authed, entity: params.data.entity, name: s.shopName,
      place: s.place, accepts_mly: s.acceptsMly, accepts_cash: s.acceptsCash,
    });
  }
  await svc.from('receipts').insert({ id: receipt.id, owner: authed, receipt });
  return NextResponse.json({ ok: true, receipt });
}
