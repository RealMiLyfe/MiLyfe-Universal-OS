import { NextResponse } from 'next/server';
import { ApiEnvelope, SwapListing } from '@/contracts';
import { serviceClient, userIdFromAuthHeader } from '@/lib/supabase';
import { signServerReceipt } from '@/lib/server-receipt';

// POST /api/swaps — create a P2P swap listing (community nodes, meet in public).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  const env = ApiEnvelope.safeParse(body);
  if (!env.success) return NextResponse.json({ ok: false, error: 'BAD_ENVELOPE' }, { status: 400 });
  const listing = SwapListing.safeParse({ ...(env.data.params as object), receipt: 'pending', status: 'listed' });
  if (!listing.success) return NextResponse.json({ ok: false, error: 'BAD_PARAMS' }, { status: 400 });
  const authed = await userIdFromAuthHeader(req);
  if (!authed) return NextResponse.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });

  const receipt = await signServerReceipt({
    branch: 'finance', os: 'MiMoney', purpose: `swap listed: ${listing.data.offer}`,
    capability: 'money.list-swap', approval: { by: authed, role: 'member', scope: 'swap', reason: 'swap-listed' },
    impact: { other: listing.data.offer }, status: 'proposed',
    correction: { path: 'cancel or MiResolve dispute', route: '/api/sync' },
    explains: 'Your swap offer is listed. Meet in a public place (like the library). Nothing moves until both sides confirm.',
  });
  const svc = serviceClient();
  const { error } = await svc.from('swap_listings').insert({
    id: listing.data.id, maker: listing.data.maker, offer: listing.data.offer,
    terms: listing.data.terms, meeting_policy: listing.data.meetingPolicy, status: 'listed', receipt_id: receipt.id,
  });
  if (error) return NextResponse.json({ ok: false, error: 'SWAP_REJECTED' }, { status: 400 });
  await svc.from('receipts').insert({ id: receipt.id, receipt });
  return NextResponse.json({ ok: true, receipt });
}
