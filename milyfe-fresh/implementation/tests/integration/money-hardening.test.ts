import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import { assertGovAuthorization } from '@/finance/bridges';
import { Ledger } from '@/finance/mimoney';
import { approveMerchant, createCustomer, createMerchant, moveOrder, placeOrder, publishListing, settledGmv } from '@/finance/mimarket';
import type { Caller } from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const NOW = '2026-06-01T00:00:00Z';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

function human(n: string): Caller { return { did: tdid(n), kind: 'human' }; }
const APPROVAL = (by: string) => ({ by, at: NOW, reason: 'hardening drill' });

// Synthetic values only. No public financial claims come from these drills.
describe('money hardening (storms, reconciliation, expiry)', () => {
  it('mixed storm (settle/dispute/refund/move) keeps conservation + no-negatives', async () => {
    const ledger = new Ledger();
    const crew = ['m0', 'm1', 'm2', 'm3'].map(human);
    await ledger.mint(crew[0].did, '20000', crew[0], APPROVAL(crew[0].did), 'budget-storm', NOW);
    const jobs: Promise<unknown>[] = [];
    for (let i = 0; i < 40; i++) {
      const from = crew[i % 4];
      const to = crew[(i + 1) % 4];
      ledger.post(from, { key: `storm-${i}`, from: from.did, to: to.did, amountMinor: '11' }, NOW);
      jobs.push(
        (async () => {
          await ledger.settle(`storm-${i}`, from, APPROVAL(from.did), NOW).catch(() => 'short');
          if (i % 7 === 0) {
            ledger.dispute(`storm-${i}`, to, 'drill dispute', NOW);
            await ledger.movePosting(`storm-${i}`, 'settled', from, 'drill uphold', NOW).catch(() => 'stuck');
          }
          if (i % 11 === 0) {
            await ledger.refund(`storm-ref-${i}`, `storm-${i}`, to, APPROVAL(to.did), NOW).catch(() => 'no-refund');
          }
        })(),
      );
    }
    await Promise.all(jobs);
    const rec = ledger.reconcile();
    expect(rec.ok).toBe(true);
    expect(rec.issued).toBe('20000');
    for (const c of crew) expect(BigInt(ledger.balance(c.did)) >= 0n).toBe(true);
  });

  it('marketplace-to-settlement reconciles: GMV equals settled postings', async () => {
    const seller = human('seller');
    const buyer = human('buyer');
    const merchant = approveMerchant(createMerchant('m1', seller, 'Shop', 'terms'), seller, APPROVAL(seller.did));
    const listing = publishListing('l1', seller, merchant, 'goods', 'Widget', '25', 'new', NOW);
    const customer = createCustomer('c1', buyer, 'buyer');
    const orders = [];
    for (let i = 0; i < 5; i++) {
      let o = placeOrder(`o${i}`, buyer, customer, listing, NOW);
      for (const s of ['accepted', 'in-progress', 'delivered', 'complete'] as const) o = moveOrder(o, s === 'complete' ? 'complete' : s, 'ok', NOW);
      orders.push(o);
    }
    // One order canceled before completion — must not count.
    const canceled = moveOrder(moveOrder(placeOrder('oX', buyer, customer, listing, NOW), 'accepted', 'ok', NOW), 'canceled', 'changed mind', NOW);
    expect(settledGmv([...orders, canceled])).toBe('125');

    const ledger = new Ledger();
    await ledger.mint(buyer.did, '1000', buyer, APPROVAL(buyer.did), 'budget-m', NOW);
    for (const o of orders) {
      ledger.post(buyer, { key: `pay-${o.id}`, from: buyer.did, to: seller.did, amountMinor: o.amountMinor, orderRef: o.id }, NOW);
      await ledger.settle(`pay-${o.id}`, buyer, APPROVAL(buyer.did), NOW);
    }
    expect(ledger.balance(seller.did)).toBe(settledGmv(orders));
    expect(ledger.reconcile().ok).toBe(true);
  });

  it('governance authorizations expire on time; scope is exact', () => {
    const auth = { receiptId: 'gov-1', scope: ['treasury.spend'], expires: '2026-07-01T00:00:00Z' };
    expect(assertGovAuthorization('treasury.spend', auth, NOW)).toBe('gov-1');
    expect(() => assertGovAuthorization('treasury.spend', auth, '2026-07-01T00:00:00Z')).toThrow('GOV_AUTH_EXPIRED');
    expect(() => assertGovAuthorization('money.mint', auth, NOW)).toThrow('GOV_SCOPE_DENIED');
  });

  it('offline settle queue reconciles once on reconnect (duplicates collapse)', async () => {
    const ledger = new Ledger();
    const alice = human('alice');
    const bob = human('bob');
    await ledger.mint(alice.did, '500', alice, APPROVAL(alice.did), 'budget-q', NOW);
    // Offline: same op captured twice (retry), plus a second op.
    const queued = [
      { key: 'q1', from: alice.did, to: bob.did, amountMinor: '100' },
      { key: 'q1', from: alice.did, to: bob.did, amountMinor: '100' },
      { key: 'q2', from: alice.did, to: bob.did, amountMinor: '50' },
    ];
    for (const op of queued) ledger.post(alice, op, NOW); // idempotent by key
    await ledger.settle('q1', alice, APPROVAL(alice.did), NOW);
    await ledger.settle('q2', alice, APPROVAL(alice.did), NOW);
    expect(ledger.balance(bob.did)).toBe('150');
    expect(ledger.reconcile().ok).toBe(true);
  });
});
