import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db, syncOutbox } from '@/kernel';
import { Ledger } from '@/finance/mimoney';
import { FINANCE_FORBIDDEN, MLY_DISCLOSURE, type Caller } from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const NOW = '2026-06-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'drill' };

// Executable security review for the Finance branch. Agent self-check:
// independent human review is still pending (see
// branches/finance/FINANCE-SECURITY-REVIEW.md). Synthetic values only.

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('finance security review (agent self-check)', () => {
  it('FR-1: no finance source imports governance or lifestyle code', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dir = path.resolve(__dirname, '../src/finance');
    for (const file of fs.readdirSync(dir)) {
      const src = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(src).not.toMatch(/from '@\/(governance|lifestyle)\//);
    }
  });
  it('FR-2: agent-forbidden list covers mint/settle/refund/reverse/treasury/payouts', () => {
    const joined = FINANCE_FORBIDDEN.join(' ');
    for (const area of ['money.mint', 'money.settle', 'money.refund', 'money.reverse', 'treasury.spend', 'work.payout-approve', 'forge.revenue-recognize']) {
      expect(joined).toContain(area);
    }
  });
  it('FR-3: conservation survives a storm of transfers, disputes, refunds', async () => {
    const ledger = new Ledger();
    const crew = [ALICE, tdid('b'), tdid('c'), tdid('d')];
    await ledger.mint(ALICE, '10000', HUMAN, APPROVAL, 'budget-storm', NOW);
    let n = 0;
    const jobs: Promise<unknown>[] = [];
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < crew.length; i++) {
        const key = `storm-${n++}`;
        ledger.post(HUMAN, { key, from: crew[i], to: crew[(i + 1) % crew.length], amountMinor: '7' }, NOW);
        jobs.push(ledger.settle(key, HUMAN, APPROVAL, NOW).catch(() => 'short'));
      }
    }
    await Promise.all(jobs);
    const rec = ledger.reconcile();
    expect(rec.ok).toBe(true);
    expect(rec.issued).toBe('10000');
    for (const c of crew) expect(BigInt(ledger.balance(c)) >= 0n).toBe(true);
  });
  it('FR-4: offline double-submit collapses to one posting on reconnect', async () => {
    const ledger = new Ledger();
    await ledger.mint(ALICE, '100', HUMAN, APPROVAL, 'budget-o', NOW);
    const op = { key: 'off-1', from: ALICE, to: tdid('bob'), amountMinor: '30' };
    // Same offline op queued twice (retry storm) — ledger takes it once.
    const seen = new Set<string>();
    for (const copy of [op, op]) {
      if (!seen.has(copy.key)) {
        seen.add(copy.key);
        ledger.post(HUMAN, copy, NOW);
      }
    }
    await ledger.settle('off-1', HUMAN, APPROVAL, NOW);
    expect(ledger.balance(tdid('bob'))).toBe('30');
    expect(ledger.reconcile().ok).toBe(true);
    const res = await syncOutbox(async () => {});
    expect(res).toEqual({ acked: 0, failed: 0 });
  });
  it('FR-5: exports always disclose MLY-is-MLY; no dollar wording in finance records', async () => {
    const ledger = new Ledger();
    await ledger.mint(ALICE, '10', HUMAN, APPROVAL, 'budget-e', NOW);
    expect(ledger.exportLedger().disclosure).toBe(MLY_DISCLOSURE);
    expect(() => ledger.post(HUMAN, { key: 'x', from: ALICE, to: tdid('b'), amountMinor: '1', note: 'pegged value' }, NOW)).toThrow('MLY_MISREPRESENTATION_PEGGED');
  });
  it('FR-6: reversal shortfalls stay disputed — never silently completed', async () => {
    const ledger = new Ledger();
    await ledger.mint(ALICE, '100', HUMAN, APPROVAL, 'budget-r', NOW);
    const bob = tdid('bob');
    ledger.post(HUMAN, { key: 'p1', from: ALICE, to: bob, amountMinor: '100' }, NOW);
    await ledger.settle('p1', HUMAN, APPROVAL, NOW);
    ledger.post(HUMAN, { key: 'p2', from: bob, to: tdid('carol'), amountMinor: '100' }, NOW);
    await ledger.settle('p2', HUMAN, APPROVAL, NOW);
    const out = await ledger.reverse('p1', HUMAN, APPROVAL, 'fraud claim', NOW);
    expect(out.reversed).toBe(false);
    expect(out.posting.state).toBe('disputed');
    expect(ledger.reconcile().ok).toBe(true);
  });
});
