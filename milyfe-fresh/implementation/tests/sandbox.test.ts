import { describe, expect, it } from 'vitest';
import {
  createListing, createOffer, fulfillOrderSandbox, placeOrderSandbox, publishOfferSandbox,
  refuseSyntheticInRealPath, simulateWelcome, SYNTHETIC_BANNER, SyntheticLedger,
} from '@/finance/sandbox';

describe('sandbox: synthetic MiMoney states', () => {
  it('labels everything synthetic', () => {
    expect(new SyntheticLedger().banner).toContain('SYNTHETIC');
    expect(SYNTHETIC_BANNER).toContain('not real money');
  });
  it('enforces no-negative even with fake money', () => {
    const ledger = new SyntheticLedger();
    ledger.faucet('alice', '100');
    expect(ledger.balance('alice')).toBe('100');
    expect(() => ledger.transfer('alice', 'bob', '101')).toThrow();
    ledger.transfer('alice', 'bob', '40');
    expect(ledger.balance('alice')).toBe('60');
    expect(ledger.balance('bob')).toBe('40');
  });
  it('projections never count as balance', () => {
    const ledger = new SyntheticLedger();
    const p = ledger.project('alice', '500');
    expect(p.state).toBe('projected');
    expect(ledger.balance('alice')).toBe('0');
  });
  it('lifecycle transitions enforced, illegal jumps rejected', () => {
    const ledger = new SyntheticLedger();
    expect(ledger.move('pending', 'verified', 'ok').state).toBe('verified');
    expect(() => ledger.move('projected', 'settled', 'skip')).toThrow('ILLEGAL_TRANSITION_PROJECTED_TO_SETTLED');
    expect(() => ledger.move('reversed', 'settled', 'resurrect')).toThrow();
  });
  it('real paths refuse synthetic artifacts', () => {
    const ledger = new SyntheticLedger();
    const r = ledger.faucet('alice', '10');
    expect(() => refuseSyntheticInRealPath(r, 'money.transfer')).toThrow('SYNTHETIC_REFUSED_IN_MONEY_TRANSFER');
    expect(() => refuseSyntheticInRealPath({ synthetic: false }, 'money.transfer')).not.toThrow();
  });
});

describe('sandbox: MiForge', () => {
  it('offers stay drafts until sandbox-published (never real)', () => {
    const o = createOffer('alice', 'Sourdough loaves');
    expect(o.status).toBe('draft');
    expect(publishOfferSandbox(o).status).toBe('sandbox-published');
  });
  it('welcome simulation plans without posting + respects budgets', () => {
    const ok = simulateWelcome(1200, '100', '120000');
    expect(ok).toMatchObject({ total: '120000', withinBudget: true });
    expect(simulateWelcome(1200, '101', '120000').withinBudget).toBe(false);
  });
});

describe('sandbox: MiMarket', () => {
  it('orders run pending → settled (synthetic), never real settlement', () => {
    const listing = createListing('bob', 'Bike repair', '50');
    const order = placeOrderSandbox(listing, 'alice');
    expect(order.state).toBe('pending');
    const done = fulfillOrderSandbox(order);
    expect(done.order.state).toBe('settled');
    expect(done.receipt.synthetic).toBe(true);
    expect(() => refuseSyntheticInRealPath(done.receipt, 'money.settle')).toThrow();
  });
});
