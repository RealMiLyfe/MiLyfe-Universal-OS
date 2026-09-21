import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { ApiEnvelope, GrantCreateParams, GrantRevokeParams } from '@/contracts';
import { serviceClient, userIdFromAuthHeader } from '@/lib/supabase';
import { signServerReceipt } from '@/lib/server-receipt';

// POST /api/grants — create a purpose-bound data grant. Issuer must own the
// calling account (verified via entities table). Server signs the approval receipt.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const env = ApiEnvelope.safeParse(body);
  if (!env.success) return NextResponse.json({ ok: false, error: 'BAD_ENVELOPE' }, { status: 400 });
  const params = GrantCreateParams.safeParse(env.data.params);
  if (!params.success) return NextResponse.json({ ok: false, error: 'BAD_PARAMS' }, { status: 400 });
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });

  const svc = serviceClient();
  const { data: issuerEntity } = await svc.from('entities').select('owner').eq('did', params.data.issuer).maybeSingle();
  if (!issuerEntity || issuerEntity.owner !== authed) {
    return NextResponse.json({ ok: false, error: 'ISSUER_NOT_YOURS' }, { status: 403 });
  }
  if (new Date(params.data.expires).getTime() <= Date.now()) {
    return NextResponse.json({ ok: false, error: 'GRANT_MUST_EXPIRE_IN_FUTURE' }, { status: 400 });
  }
  const receipt = await signServerReceipt({
    branch: 'trunk', os: 'MiData', purpose: `grant ${params.data.scope.join(',')} on ${params.data.target} for ${params.data.purpose}`,
    capability: 'midata.grant', approval: { by: authed, role: 'owner', scope: params.data.target, reason: params.data.purpose },
    impact: { data: params.data.target }, status: 'approved',
    correction: { path: 'revoke anytime', route: '/api/grants' },
    explains: `You shared ${params.data.target} for "${params.data.purpose}". It expires ${params.data.expires}. You can revoke it anytime.`,
  });
  const grant = { ...params.data, id: randomUUID(), approval: receipt.id };
  const { error } = await svc.from('grants').insert({ id: grant.id, grant, subject: null });
  if (error) return NextResponse.json({ ok: false, error: 'GRANT_REJECTED' }, { status: 400 });
  await svc.from('receipts').insert({ id: receipt.id, owner: authed, receipt });
  return NextResponse.json({ ok: true, grant, receipt });
}

// PATCH /api/grants — revoke a grant you issued. Instant, receipted.
export async function PATCH(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const env = ApiEnvelope.safeParse(body);
  if (!env.success) return NextResponse.json({ ok: false, error: 'BAD_ENVELOPE' }, { status: 400 });
  const params = GrantRevokeParams.safeParse(env.data.params);
  if (!params.success) return NextResponse.json({ ok: false, error: 'BAD_PARAMS' }, { status: 400 });
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });

  const svc = serviceClient();
  const { data: row } = await svc.from('grants').select('grant').eq('id', params.data.id).maybeSingle();
  if (!row) return NextResponse.json({ ok: false, error: 'GRANT_NOT_FOUND' }, { status: 404 });
  const grant = row.grant as { issuer: string };
  const { data: issuerEntity } = await svc.from('entities').select('owner').eq('did', grant.issuer).maybeSingle();
  if (!issuerEntity || issuerEntity.owner !== authed) {
    return NextResponse.json({ ok: false, error: 'NOT_YOUR_GRANT' }, { status: 403 });
  }
  const revoked = { ...(row.grant as object), expires: new Date(0).toISOString() };
  await svc.from('grants').update({ grant: revoked }).eq('id', params.data.id);
  const receipt = await signServerReceipt({
    branch: 'trunk', os: 'MiData', purpose: `grant revoked: ${params.data.id}`,
    capability: 'midata.revoke', approval: { by: authed, role: 'owner', scope: params.data.id, reason: params.data.reason },
    impact: { data: params.data.id }, status: 'executed',
    correction: { path: 'issue a new grant if needed', route: '/api/grants' },
    explains: 'You revoked this sharing grant. It stops working immediately.',
  });
  await svc.from('receipts').insert({ id: receipt.id, owner: authed, receipt });
  return NextResponse.json({ ok: true, receipt });
}
