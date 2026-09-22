import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import {
  assertGovAuthorization, careSupportToMoney, eduCredentialToWork, forgeVentureToOffer,
  marketOrderToSettlement, placeMerchantToMarket, resolveDisputeToCorrection,
} from '@/finance/bridges';
import { Ledger } from '@/finance/mimoney';
import type { Caller } from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const NOW = '2026-06-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'reviewed' };

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

async function families(): Promise<string[]> {
  return (await db.events.toArray()).map((e) => `${e.family}.${e.name}`);
}

describe('finance bridges (bus + receipts, references only)', () => {
  it('1. education credential → work opportunity', async () => {
    const { receipt, bus } = await eduCredentialToWork(HUMAN, 'cred-1', 'street-school', 'op-1', 'cell-a', true);
    expect(receipt.os).toBe('MiWork');
    expect(bus.mode).toBe('published');
    expect(await families()).toEqual(['work.credential-matched']);
  });
  it('2. care support → money reward (approved only)', async () => {
    await expect(careSupportToMoney(HUMAN, 'care-1', ALICE, { by: '', at: NOW, reason: '' }, 'cell-a', true)).rejects.toThrow();
    const out = await careSupportToMoney(HUMAN, 'care-1', ALICE, APPROVAL, 'cell-a', true);
    expect(out.receipt.os).toBe('MiMoney');
    expect(await families()).toEqual(['money.reward-requested']);
  });
  it('3. place merchant → market listing', async () => {
    await placeMerchantToMarket(HUMAN, 'merchant-7', 'place-riverside', 'cell-a', true);
    expect(await families()).toEqual(['market.listing-requested']);
  });
  it('4. forge venture → market offer', async () => {
    await forgeVentureToOffer(HUMAN, 'venture-3', 'offering-3', 'cell-a', true);
    expect(await families()).toEqual(['market.offer-requested']);
  });
  it('5. market order → money settlement', async () => {
    const { receipt } = await marketOrderToSettlement(HUMAN, 'order-5', 'cell-a', true);
    expect(receipt.os).toBe('MiMarket');
    expect(await families()).toEqual(['money.settle-requested']);
  });
  it('6. resolve dispute → correction, reversal, or uphold on the ledger', async () => {
    const ledger = new Ledger();
    await ledger.mint(ALICE, '500', HUMAN, APPROVAL, 'budget-t', NOW);
    const bob = tdid('bob');
    ledger.post(HUMAN, { key: 'p1', from: ALICE, to: bob, amountMinor: '100' }, NOW);
    await ledger.settle('p1', HUMAN, APPROVAL, NOW);
    ledger.dispute('p1', HUMAN, 'goods never arrived', NOW);
    const refunded = await resolveDisputeToCorrection(ledger, HUMAN, 'p1', 'refund-buyer', 'resolve-case-1', APPROVAL, NOW);
    expect(refunded.applied).toBe('refund-buyer');
    expect(refunded.posting.refundOf).toBe('p1');
    expect(ledger.balance(ALICE)).toBe('500');
    // Uphold path returns a disputed posting to settled.
    ledger.post(HUMAN, { key: 'p2', from: ALICE, to: bob, amountMinor: '50' }, NOW);
    await ledger.settle('p2', HUMAN, APPROVAL, NOW);
    ledger.dispute('p2', HUMAN, 'changed mind', NOW);
    const upheld = await resolveDisputeToCorrection(ledger, HUMAN, 'p2', 'uphold', 'resolve-case-2', APPROVAL, NOW);
    expect(upheld.posting.state).toBe('settled');
    expect(ledger.reconcile().ok).toBe(true);
  });
  it('7. governance authorization gates scoped finance actions', () => {
    const auth = { receiptId: 'gov-vote-1', scope: ['treasury.spend'], expires: '2027-01-01T00:00:00Z' };
    expect(assertGovAuthorization('treasury.spend', auth, NOW)).toBe('gov-vote-1');
    expect(() => assertGovAuthorization('treasury.spend', { ...auth, scope: ['other'] }, NOW)).toThrow('GOV_SCOPE_DENIED');
    expect(() => assertGovAuthorization('treasury.spend', { ...auth, expires: NOW }, NOW)).toThrow('GOV_AUTH_EXPIRED');
    expect(() => assertGovAuthorization('treasury.spend', { ...auth, receiptId: '' }, NOW)).toThrow('GOV_RECEIPT_REQUIRED');
  });
});
