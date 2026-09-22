import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  __resetBusForTests, db, getDoc, pendingOutbox, publish, replay, subscribe, syncOutbox,
} from '@/kernel';
import type { Grant } from '@/kernel/scope';
import { checkAccess, createSpace, revokeGrant, saveGrant } from '@/trunk/midata';
import { exportCareHistory } from '@/lifestyle/micare';
import { exportHealthRecord } from '@/lifestyle/mihealth';
import { exportPlaceHistory } from '@/lifestyle/miplace';
import { exportLearningRecord } from '@/lifestyle/mieducation';
import { exportMarketHistory } from '@/finance/mimarket';
import { exportWorkHistory } from '@/finance/miwork';
import { Ledger } from '@/finance/mimoney';
import { correctTreasurySpend, fundTreasuryBook, openTreasuryBook, spendTreasuryBook } from '@/finance/mimoney';
import type { Caller as FCaller } from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const NOW = '2026-06-01T00:00:00Z';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('data-space isolation (no cross-owner leaks)', () => {
  it('a grant for one space opens nothing elsewhere', async () => {
    const alice = await createSpace(tdid('alice'), 'health');
    const bob = await createSpace(tdid('bob'), 'health');
    const grant: Grant = {
      id: crypto.randomUUID(), issuer: tdid('alice'), subject: tdid('clinic'), target: alice.id,
      purpose: 'care', scope: ['slice-read'], expires: '2027-01-01T00:00:00Z', approval: 'alice-ok',
    };
    await saveGrant(grant);
    const check = { subject: grant.subject, action: 'slice-read', purpose: 'care', now: '2026-01-01T00:00:00Z' };
    expect((await checkAccess([grant], { ...check, target: alice.id })).ok).toBe(true);
    expect((await checkAccess([grant], { ...check, target: bob.id })).ok).toBe(false);
    await revokeGrant(grant.id);
    const dead = await getDoc<Grant>('grants', grant.id);
    expect((await checkAccess([dead!], { ...check, target: alice.id })).ok).toBe(false);
  });
});

describe('export across all record-holding OSes', () => {
  it('every OS exports whole histories, even shape-empty', async () => {
    const human: FCaller = { did: tdid('member'), kind: 'human' };
    const ledger = new Ledger();
    await ledger.mint(human.did, '10', human, { by: human.did, at: NOW, reason: 'drill' }, 'budget-x', NOW);
    expect(ledger.exportLedger().issued).toBe('10');
    expect(exportCareHistory({ id: 'p1' } as never, [], []).id).toBe('p1');
    expect(exportHealthRecord({ a: '1' }, []).records).toEqual({ a: '1' });
    expect(exportPlaceHistory({ id: 'pl' } as never, [], [], []).place.id).toBe('pl');
    expect(exportLearningRecord([], [], []).credentials).toEqual([]);
    expect(exportMarketHistory([], [], []).reviews).toEqual([]);
    expect(exportWorkHistory([], [], []).claims).toEqual([]);
  });
});

describe('recovery (outbox honesty + replay rebuild)', () => {
  it('failed sync stays pending; success acks; replay rebuilds consumers', async () => {
    const { enqueue } = await import('@/kernel');
    await enqueue('money.settle', { ref: 'o1' }, 'q1');
    const failed = await syncOutbox(async () => { throw new Error('NET_DOWN'); });
    expect(failed).toEqual({ acked: 0, failed: 1 });
    expect(await pendingOutbox()).toHaveLength(1);
    const ok = await syncOutbox(async () => {});
    expect(ok).toEqual({ acked: 1, failed: 0 });

    let balance = 0;
    const seen = new Set<string>();
    const off = subscribe('ledger.*', (e) => {
      if (seen.has(e.id)) return;
      seen.add(e.id);
      balance += (e.payload as { delta: number }).delta;
    });
    await publish({
      family: 'ledger', name: 'credit', actor: tdid('bank'), cell: 'c', entity: 'acct-1',
      privacy: 'private', payload: { delta: 5 }, receipt: 'r1',
    });
    expect(balance).toBe(5);
    balance = 0; // simulate restart: rebuild from replay
    await replay('acct-1', 0);
    // Consumer dedupes by id, so replay re-delivery is safe (no double count).
    expect(balance).toBe(0);
    seen.clear();
    await replay('acct-1', 0);
    expect(balance).toBe(5);
    off();
  });
  it('treasury corrections roll spends back with a reason', () => {
    const human: FCaller = { did: tdid('treasurer'), kind: 'human' };
    const approval = { by: human.did, at: NOW, reason: 'park fix' };
    const book = fundTreasuryBook(openTreasuryBook('500'), '500');
    const spent = spendTreasuryBook(book, '200', human, approval, NOW).book;
    expect(spent.paidMinor).toBe('200');
    const fixed = correctTreasurySpend(spent, '200', human, 'duplicate entry');
    expect(fixed.paidMinor).toBe('0');
    expect(fixed.balanceMinor).toBe('500');
  });
});
