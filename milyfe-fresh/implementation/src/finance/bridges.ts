// Finance cross-branch bridges. Every example below crosses branches by
// registered bus event + receipt, carrying references only. Finance never
// imports governance or lifestyle source — pinned by test.
import { Ledger } from './mimoney';
import { assertCaller, emitOrQueue, receiptFor, type Caller, type HumanApproval } from './shared';

// 1. MiEducation skill/credential → MiWork opportunity (reference match request)
export async function eduCredentialToWork(caller: Caller, credentialRef: string, issuerRef: string, opportunityRef: string, cell: string, online: boolean) {
  assertCaller(caller);
  if (!credentialRef || !issuerRef || !opportunityRef) throw new Error('REF_REQUIRED');
  const receipt = receiptFor('MiWork', {
    actor: caller.did, purpose: `Match credential ${credentialRef} to opportunity ${opportunityRef}`, capability: 'work.pathway-match',
    approval: { by: caller.did, role: 'member', scope: 'pathway', reason: 'learner asked' },
    impact: { other: 'match requested, no decision made' }, status: 'approved',
    correction: { path: 'Matches can be re-run or ignored', route: 'work.pathway-match' },
    explains: 'Your credential was matched against a work opening. The poster still decides.',
  });
  const bus = await emitOrQueue({
    family: 'work', name: 'credential-matched', actor: caller, cell, entity: opportunityRef,
    privacy: 'private', payload: { ref: opportunityRef, kind: 'credential-match', label: credentialRef.slice(0, 140) },
    receipt: 'see-receipt', online,
  });
  return { receipt, bus };
}

// 2. MiCare support/contribution → MiMoney reward state (approved only)
export async function careSupportToMoney(caller: Caller, careRef: string, worker: string, approval: HumanApproval, cell: string, online: boolean) {
  assertCaller(caller);
  if (!careRef) throw new Error('REF_REQUIRED');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  const receipt = receiptFor('MiMoney', {
    actor: caller.did, purpose: `Reward care contribution ${careRef}`, capability: 'money.reward',
    approval: { by: approval.by, role: 'human-reviewer', scope: 'reward', reason: approval.reason },
    impact: { other: 'reward requested from care record' }, status: 'approved',
    correction: { path: 'Rewards can be disputed via MiResolve', route: 'resolve.dispute-open' },
    explains: 'Care work was approved for a reward. The reward still settles through the ledger.',
  });
  const bus = await emitOrQueue({
    family: 'money', name: 'reward-requested', actor: caller, cell, entity: worker,
    privacy: 'private', payload: { ref: careRef, kind: 'care-reward' }, receipt: 'see-receipt', online,
  });
  return { receipt, bus };
}

// 3. MiPlace merchant/service → MiMarket listing (reference request)
export async function placeMerchantToMarket(caller: Caller, merchantRef: string, placeRef: string, cell: string, online: boolean) {
  assertCaller(caller);
  if (!merchantRef || !placeRef) throw new Error('REF_REQUIRED');
  const bus = await emitOrQueue({
    family: 'market', name: 'listing-requested', actor: caller, cell, entity: merchantRef,
    privacy: 'place', payload: { ref: merchantRef, kind: 'place-listing', label: placeRef.slice(0, 140) },
    receipt: 'see-receipt', online,
  });
  return { bus };
}

// 4. MiForge venture → MiMarket offer (reference request)
export async function forgeVentureToOffer(caller: Caller, ventureRef: string, offeringRef: string, cell: string, online: boolean) {
  assertCaller(caller);
  if (!ventureRef || !offeringRef) throw new Error('REF_REQUIRED');
  const bus = await emitOrQueue({
    family: 'market', name: 'offer-requested', actor: caller, cell, entity: ventureRef,
    privacy: 'place', payload: { ref: ventureRef, kind: 'forge-offer', label: offeringRef.slice(0, 140) },
    receipt: 'see-receipt', online,
  });
  return { bus };
}

// 5. MiMarket order → MiMoney settlement (reference request)
export async function marketOrderToSettlement(caller: Caller, orderRef: string, cell: string, online: boolean) {
  assertCaller(caller);
  if (!orderRef) throw new Error('REF_REQUIRED');
  const receipt = receiptFor('MiMarket', {
    actor: caller.did, purpose: `Settle order ${orderRef}`, capability: 'market.order-settle',
    approval: { by: caller.did, role: 'party', scope: 'order', reason: 'delivery confirmed' },
    impact: { other: 'settlement requested on the ledger' }, status: 'approved',
    correction: { path: 'Dispute within the window via MiResolve', route: 'resolve.dispute-open' },
    explains: `Order ${orderRef} is ready to settle on the ledger.`,
  });
  const bus = await emitOrQueue({
    family: 'money', name: 'settle-requested', actor: caller, cell, entity: orderRef,
    privacy: 'private', payload: { ref: orderRef, kind: 'order-settlement' }, receipt: 'see-receipt', online,
  });
  return { receipt, bus };
}

// 6. MiResolve dispute → Finance correction / reversal (applies the verdict)
export type DisputeVerdict = 'refund-buyer' | 'uphold' | 'reverse';

export async function resolveDisputeToCorrection(
  ledger: Ledger, caller: Caller, postingRef: string, verdict: DisputeVerdict, resolveRef: string, approval: HumanApproval, nowIso: string,
) {
  assertCaller(caller);
  if (!postingRef || !resolveRef) throw new Error('REF_REQUIRED');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  if (verdict === 'refund-buyer') {
    const posting = await ledger.refund(`refund-${postingRef}`, postingRef, caller, approval, nowIso);
    return { posting, applied: 'refund-buyer' as const };
  }
  if (verdict === 'reverse') {
    const { posting, reversed } = await ledger.reverse(postingRef, caller, approval, `per ${resolveRef}`, nowIso);
    if (!reversed) throw new Error('REVERSAL_SHORTFALL_STAYS_DISPUTED');
    return { posting, applied: 'reverse' as const };
  }
  const posting = await ledger.movePosting(postingRef, 'settled', caller, `upheld per ${resolveRef}`, nowIso);
  return { posting, applied: 'uphold' as const };
}

// 7. Governance authorization → scoped Finance action (scope + expiry checked)
export interface GovAuthorization {
  receiptId: string;
  scope: string[];
  expires: string;
}

export function assertGovAuthorization(action: string, auth: GovAuthorization, nowIso: string): string {
  if (!auth.receiptId) throw new Error('GOV_RECEIPT_REQUIRED');
  if (auth.expires <= nowIso) throw new Error('GOV_AUTH_EXPIRED');
  if (!auth.scope.includes(action)) throw new Error('GOV_SCOPE_DENIED');
  return auth.receiptId;
}
