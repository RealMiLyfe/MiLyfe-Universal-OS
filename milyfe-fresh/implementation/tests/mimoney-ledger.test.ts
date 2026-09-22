import { describe, expect, it } from 'vitest';
import {
  fundTreasuryBook, Ledger, openTreasuryBook, spendTreasuryBook,
} from '@/finance/mimoney';
import { MLY_DISCLOSURE, type Caller } from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'member signed' };

// Synthetic values only — no public financial claims come from these tests.
async function funded(mintTo = ALICE, amount = '1000'): Promise<Ledger> {
  const ledger = new Ledger();
  await ledger.mint(mintTo, amount, HUMAN, APPROVAL, 'budget-test', NOW);
  return ledger;
}

describe('mimoney ledger invariants (one ledger, no negatives)', () => {
  it('mints credit; agents cannot mint; balances never negative', async () => {
    const ledger = new Ledger();
    await expect(ledger.mint(ALICE, '100', AGENT, APPROVAL, 'b', NOW)).rejects.toThrow('AGENT_BLOCKED_MONEY_MINT');
    await ledger.mint(ALICE, '100', HUMAN, APPROVAL, 'budget-1', NOW);
    expect(ledger.balance(ALICE)).toBe('100');
    ledger.post(HUMAN, { key: 'p1', from: ALICE, to: tdid('bob'), amountMinor: '1000' }, NOW);
    await expect(ledger.settle('p1', HUMAN, APPROVAL, NOW)).rejects.toThrow('INSUFFICIENT_OR_INVALID');
    expect(ledger.balance(ALICE)).toBe('100');
    expect(ledger.reconcile().ok).toBe(true);
  });
  it('rejects self-send, zero, and dollar wording', async () => {
    const ledger = await funded();
    expect(() => ledger.post(HUMAN, { key: 's', from: ALICE, to: ALICE, amountMinor: '1' }, NOW)).toThrow('NO_SELF_SEND');
    expect(() => ledger.post(HUMAN, { key: 'z', from: ALICE, to: tdid('bob'), amountMinor: '0' }, NOW)).toThrow('AMOUNT_MUST_BE_POSITIVE');
    expect(() => ledger.post(HUMAN, { key: 'u', from: ALICE, to: tdid('bob'), amountMinor: '1', note: 'worth 1 USD' }, NOW)).toThrow('MLY_MISREPRESENTATION_USD');
  });
});

describe('mimoney idempotency + duplicates + concurrency', () => {
  it('same key twice returns the same posting; key reuse with new facts fails', async () => {
    const ledger = await funded();
    const a = ledger.post(HUMAN, { key: 'k1', from: ALICE, to: tdid('bob'), amountMinor: '10' }, NOW);
    const b = ledger.post(HUMAN, { key: 'k1', from: ALICE, to: tdid('bob'), amountMinor: '10' }, NOW);
    expect(a).toBe(b);
    expect(() => ledger.post(HUMAN, { key: 'k1', from: ALICE, to: tdid('bob'), amountMinor: '999' }, NOW)).toThrow('KEY_REUSE_MISMATCH');
    await ledger.settle('k1', HUMAN, APPROVAL, NOW);
    await ledger.settle('k1', HUMAN, APPROVAL, NOW);
    expect(ledger.balance(tdid('bob'))).toBe('10');
  });
  it('concurrent settles serialize: no double-spend, conservation holds', async () => {
    const ledger = await funded(ALICE, '100');
    for (let i = 0; i < 10; i++) {
      ledger.post(HUMAN, { key: `c${i}`, from: ALICE, to: tdid(`r${i}`), amountMinor: '10' }, NOW);
    }
    const results = await Promise.allSettled([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ledger.settle(`c${i}`, HUMAN, APPROVAL, NOW)));
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(10);
    expect(ledger.balance(ALICE)).toBe('0');
    expect(ledger.reconcile()).toEqual({ ok: true, breaks: [], total: '100', issued: '100' });
    // One more would overdraw — rejected, conservation still holds.
    ledger.post(HUMAN, { key: 'cX', from: ALICE, to: tdid('rx'), amountMinor: '10' }, NOW);
    await expect(ledger.settle('cX', HUMAN, APPROVAL, NOW)).rejects.toThrow('INSUFFICIENT_OR_INVALID');
    expect(ledger.reconcile().ok).toBe(true);
  });
});

describe('mimoney states (pending → settled, disputes, reversals, refunds)', () => {
  it('pending → verified → settled; agents cannot settle', async () => {
    const ledger = await funded();
    ledger.post(HUMAN, { key: 'p1', from: ALICE, to: tdid('bob'), amountMinor: '40' }, NOW);
    await expect(ledger.settle('p1', AGENT, APPROVAL, NOW)).rejects.toThrow('AGENT_BLOCKED_MONEY_SETTLE');
    const { posting } = await ledger.settle('p1', HUMAN, APPROVAL, NOW);
    expect(posting.state).toBe('settled');
    expect(posting.history.map((h) => h.event)).toContain('verified for settlement');
    expect(ledger.balance(tdid('bob'))).toBe('40');
  });
  it('disputes flag; reversals restore or stay disputed honestly', async () => {
    const ledger = await funded();
    const bob = tdid('bob');
    ledger.post(HUMAN, { key: 'p1', from: ALICE, to: bob, amountMinor: '60' }, NOW);
    await ledger.settle('p1', HUMAN, APPROVAL, NOW);
    expect(ledger.dispute('p1', HUMAN, 'never got the goods', NOW).state).toBe('disputed');
    // Bob spent half onward — reversal cannot complete, stays disputed.
    ledger.post(HUMAN, { key: 'p2', from: bob, to: tdid('carol'), amountMinor: '50' }, NOW);
    await ledger.settle('p2', HUMAN, APPROVAL, NOW);
    const short = await ledger.reverse('p1', HUMAN, APPROVAL, 'refund attempt', NOW);
    expect(short.reversed).toBe(false);
    expect(short.posting.state).toBe('disputed');
    // Carol returns funds; reversal completes.
    ledger.post(HUMAN, { key: 'p3', from: tdid('carol'), to: bob, amountMinor: '50' }, NOW);
    await ledger.settle('p3', HUMAN, APPROVAL, NOW);
    const full = await ledger.reverse('p1', HUMAN, APPROVAL, 'refund approved', NOW);
    expect(full.reversed).toBe(true);
    expect(full.posting.state).toBe('reversed');
    expect(ledger.reconcile().ok).toBe(true);
  });
  it('refunds create linked settled postings; need settled originals', async () => {
    const ledger = await funded();
    const bob = tdid('bob');
    ledger.post(HUMAN, { key: 'p1', from: ALICE, to: bob, amountMinor: '25', orderRef: 'order-9' }, NOW);
    await expect(ledger.refund('r1', 'p1', HUMAN, APPROVAL, NOW)).rejects.toThrow('REFUND_NEEDS_SETTLED');
    await ledger.settle('p1', HUMAN, APPROVAL, NOW);
    const refund = await ledger.refund('r1', 'p1', HUMAN, APPROVAL, NOW);
    expect(refund.state).toBe('settled');
    expect(refund.refundOf).toBe('p1');
    expect(refund.orderRef).toBe('order-9');
    expect(ledger.balance(ALICE)).toBe('1000');
  });
  it('guided moves follow transition law', async () => {
    const ledger = await funded();
    ledger.post(HUMAN, { key: 'p1', from: ALICE, to: tdid('bob'), amountMinor: '5' }, NOW);
    await expect(ledger.movePosting('p1', 'settled', HUMAN, 'skip', NOW)).rejects.toThrow('ILLEGAL_MONEY_MOVE');
    expect((await ledger.movePosting('p1', 'verified', AGENT, 'agent triage note', NOW)).state).toBe('verified');
  });
});

describe('mimoney treasury (budgeted, breaker-guarded)', () => {
  it('spends within budget; breaker needs 80% override', () => {
    let book = fundTreasuryBook(openTreasuryBook('1000'), '1000');
    expect(() => spendTreasuryBook(book, '100', AGENT, APPROVAL)).toThrow('AGENT_BLOCKED_TREASURY_SPEND');
    expect(() => spendTreasuryBook(book, '500', HUMAN, APPROVAL)).toThrow('BREAKER_TRIPPED_NEEDS_80PCT');
    book = spendTreasuryBook(book, '500', HUMAN, APPROVAL, { votesFor: 8, votesTotal: 10 });
    expect(book.paidMinor).toBe('500');
    expect(() => spendTreasuryBook(book, '600', HUMAN, APPROVAL, { votesFor: 10, votesTotal: 10 })).toThrow('TREASURY_SHORT');
    let big = fundTreasuryBook(openTreasuryBook('1000'), '2000');
    big = spendTreasuryBook(big, '600', HUMAN, APPROVAL);
    expect(() => spendTreasuryBook(big, '500', HUMAN, APPROVAL, { votesFor: 10, votesTotal: 10 })).toThrow('BUDGET_EXCEEDED');
  });
});

describe('mimoney export (disclosure attached)', () => {
  it('exports carry MLY-is-MLY wording', async () => {
    const ledger = await funded();
    const out = ledger.exportLedger();
    expect(out.disclosure).toBe(MLY_DISCLOSURE);
    expect(out.issued).toBe('1000');
  });
});
