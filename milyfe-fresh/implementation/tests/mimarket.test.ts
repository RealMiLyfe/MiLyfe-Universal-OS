import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import {
  approveMerchant, assertMarketRegister, createCustomer, createMerchant, createRideProfile, escalateDispute,
  exportMarketHistory, fileComplaint, leaveReview, moveBooking, moveOrder, offerFromVenture,
  openSupportCase, placeOrder, publishListing, quoteFee, requestBooking, retireListing, setFee,
  settledGmv, settleOrder, takedownListing,
} from '@/finance/mimarket';
import type { Caller } from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'verified docs' };

function merchant() {
  return approveMerchant(createMerchant('m1', HUMAN, 'Corner Bakery', 'fresh daily, refunds within a day'), HUMAN, APPROVAL);
}

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('mimarket registers (business ≠ customer ≠ campaign-family)', () => {
  it('campaign/donor/constituent/public-office records are refused here', () => {
    for (const bad of ['campaign', 'donor', 'constituent', 'public-office']) {
      expect(() => assertMarketRegister(bad)).toThrow('_USE_GOVERNANCE');
    }
    expect(assertMarketRegister('business')).toBe('business');
    expect(assertMarketRegister('customer')).toBe('customer');
  });
  it('merchants verify by human; customers and ride profiles separate', () => {
    const m = createMerchant('m1', HUMAN, 'Bakery', 'terms');
    expect(m.register).toBe('business');
    expect(m.verified).toBe(false);
    expect(() => approveMerchant(m, AGENT, APPROVAL)).toThrow('AGENT_BLOCKED_MARKET_MERCHANT_APPROVE');
    const c = createCustomer('c1', { did: tdid('buyer'), kind: 'human' }, 'buyer-jo');
    expect(c.register).toBe('customer');
    expect(createRideProfile('r1', HUMAN, 'riverside', 3).register).toBe('business');
  });
});

describe('mimarket listings + orders + settlement', () => {
  it('unverified sellers cannot list; dollar wording rejected', () => {
    const raw = createMerchant('m1', HUMAN, 'Bakery', 'terms');
    expect(() => publishListing('l1', HUMAN, raw, 'goods', 'Loaf', '5', 'fresh', NOW)).toThrow('MERCHANT_UNVERIFIED');
    const m = approveMerchant(raw, HUMAN, APPROVAL);
    expect(() => publishListing('l1', HUMAN, m, 'goods', 'Loaf', '5', 'worth 5 USD', NOW)).toThrow('MLY_MISREPRESENTATION_USD');
    const l = offerFromVenture('l1', HUMAN, m, 'venture-9', 'Bread subscription', '40', NOW);
    expect(l.terms).toContain('venture-9');
    expect(retireListing(l, HUMAN, m).state).toBe('retired');
  });
  it('orders run placed → complete; settlement rides the bus to MiMoney', async () => {
    const m = merchant();
    const l = publishListing('l1', HUMAN, m, 'goods', 'Loaf', '5', 'fresh', NOW);
    const buyer: Caller = { did: tdid('buyer'), kind: 'human' };
    const c = createCustomer('c1', buyer, 'buyer-jo');
    let o = placeOrder('o1', buyer, c, l, NOW);
    expect(() => moveOrder(o, 'delivered', 'skip', NOW)).toThrow('BAD_ORDER_MOVE_PLACED_TO_DELIVERED');
    o = moveOrder(o, 'accepted', 'baking', NOW);
    o = moveOrder(o, 'in-progress', 'in oven', NOW);
    o = moveOrder(o, 'delivered', 'picked up', NOW);
    const { order, receipt, bus } = await settleOrder(o, buyer, 'cell-a', true);
    expect(order.state).toBe('complete');
    expect(receipt.os).toBe('MiMarket');
    expect(bus.mode).toBe('published');
    expect((await db.events.toArray())[0].family).toBe('money');
  });
  it('offline orders queue; bookings move honestly', async () => {
    const m = merchant();
    const l = publishListing('l1', HUMAN, m, 'service', 'Haircut', '30', 'tuesdays', NOW);
    const buyer: Caller = { did: tdid('buyer'), kind: 'human' };
    const c = createCustomer('c1', buyer, 'buyer-jo');
    let b = requestBooking('b1', buyer, c, l, 'tue 10am');
    b = moveBooking(b, 'confirmed');
    expect(moveBooking(b, 'done').state).toBe('done');
    let o = placeOrder('o1', buyer, c, l, NOW);
    o = moveOrder(o, 'accepted', 'ok', NOW);
    o = moveOrder(o, 'in-progress', 'ok', NOW);
    o = moveOrder(o, 'delivered', 'ok', NOW);
    const offline = await settleOrder(o, buyer, 'cell-a', false);
    expect(offline.bus.mode).toBe('queued-offline');
  });
});

describe('mimarket reviews + complaints + disputes', () => {
  it('reviews need completed orders', async () => {
    const m = merchant();
    const l = publishListing('l1', HUMAN, m, 'goods', 'Loaf', '5', 'fresh', NOW);
    const buyer: Caller = { did: tdid('buyer'), kind: 'human' };
    const c = createCustomer('c1', buyer, 'buyer-jo');
    let o = placeOrder('o1', buyer, c, l, NOW);
    expect(() => leaveReview('r1', buyer, o, 5, 'great')).toThrow('REVIEW_NEEDS_COMPLETED_ORDER');
    for (const s of ['accepted', 'in-progress', 'delivered'] as const) o = moveOrder(o, s, 'ok', NOW);
    o = (await settleOrder(o, buyer, 'cell-a', true)).order;
    expect(leaveReview('r1', buyer, o, 5, 'great bread').stars).toBe(5);
  });
  it('complaints escalate to MiResolve with the order marked disputed', async () => {
    const m = merchant();
    const l = publishListing('l1', HUMAN, m, 'goods', 'Loaf', '5', 'fresh', NOW);
    const buyer: Caller = { did: tdid('buyer'), kind: 'human' };
    const c = createCustomer('c1', buyer, 'buyer-jo');
    let o = placeOrder('o1', buyer, c, l, NOW);
    const complaint = fileComplaint('k1', buyer, o, 'stale loaf', NOW);
    const out = await escalateDispute(complaint, buyer, o, 'cell-a', true);
    expect(out.complaint.state).toBe('escalated');
    expect(out.order.state).toBe('disputed');
    expect((await db.events.toArray())[0].family).toBe('resolve');
  });
});

describe('mimarket fees + volume + support + takedown', () => {
  it('fees quote openly; volume counts settled only', () => {
    expect(() => setFee('f1', AGENT, 2, '0', false)).toThrow('AGENT_BLOCKED_MARKET_FEE_CHANGE');
    const rule = setFee('f1', HUMAN, 2, '1', false);
    expect(quoteFee(rule, '100')).toBe('3');
    expect(settledGmv([
      { state: 'complete', amountMinor: '10' },
      { state: 'placed', amountMinor: '999' },
    ] as never)).toBe('10');
  });
  it('merchant support answers in plain words; takedowns need humans + appeal path', () => {
    const m = merchant();
    const s = openSupportCase('s1', HUMAN, m, 'till stuck');
    expect(s.notice.audioOffered).toBe(true);
    const l = publishListing('l1', HUMAN, m, 'goods', 'Loaf', '5', 'fresh', NOW);
    expect(() => takedownListing(l, AGENT, APPROVAL, 'spam')).toThrow('AGENT_BLOCKED_MARKET_TAKEDOWN');
    const { listing, receipt } = takedownListing(l, HUMAN, APPROVAL, 'counterfeit claims');
    expect(listing.state).toBe('retired');
    expect(receipt.correction.route).toBe('resolve.appeal-requested');
  });
  it('market history exports', () => {
    expect(exportMarketHistory([], [], []).orders).toEqual([]);
  });
});
