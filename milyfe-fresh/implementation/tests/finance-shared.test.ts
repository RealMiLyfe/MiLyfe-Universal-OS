import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { MiEvent, MiReceiptSchema } from '@/contracts';
import { __resetBusForTests, db, generateKeyPair, pendingOutbox, subscribe } from '@/kernel';
import { issueReceipt } from '@/kernel/receipt';
import type { Grant } from '@/kernel/scope';
import {
  FINANCE_FORBIDDEN, assertGrant, assertHumanFor, assertMlyWording, emitOrQueue, labelMly,
  MLY_DISCLOSURE, notice, OFFLINE_NOTE, receiptFor, type Caller,
} from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const LATER = '2027-01-01T00:00:00Z';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('finance contracts (frozen Phase 3)', () => {
  it('finance events validate against MiEvent; receipts against MiReceiptSchema', async () => {
    const seen: string[] = [];
    subscribe('money.*', (e) => { seen.push(e.id); });
    await emitOrQueue({
      family: 'money', name: 'settle-requested', actor: HUMAN, cell: 'cell-a', entity: 'order-1',
      privacy: 'private', payload: { ref: 'order-1', kind: 'order-settlement' }, receipt: 'r1', online: true,
    });
    const stored = await db.events.toArray();
    expect(MiEvent.safeParse(stored[0]).success).toBe(true);
    expect(seen).toHaveLength(1);
    const kp = await generateKeyPair();
    const input = receiptFor('MiMoney', {
      actor: kp.did, purpose: 'settle test posting', capability: 'money.settle',
      approval: { by: kp.did, role: 'human', scope: 'money', reason: 'ok' },
      impact: { value: '5 MLY' }, status: 'settled',
      correction: { path: 'MiResolve', route: 'resolve.dispute-open' },
      explains: 'A transfer of 5 MLY was settled between two members.',
    });
    expect(input.branch).toBe('finance');
    expect(MiReceiptSchema.safeParse(await issueReceipt(input, kp.privateKey)).success).toBe(true);
  });
});

describe('finance permissions + revocation', () => {
  const g = (over: Partial<Grant> = {}): Grant => ({
    id: crypto.randomUUID(), issuer: ALICE, subject: ALICE, target: 'money:account',
    purpose: 'spend', scope: ['transfer'], expires: LATER, approval: 'test', ...over,
  });
  it('grants pass; revocation (removal) denies immediately', () => {
    let book = [g()];
    const check = { subject: ALICE, target: 'money:account', action: 'transfer', purpose: 'spend', now: NOW };
    expect(assertGrant(book, check)).toBe(book[0].id);
    book = [];
    expect(() => assertGrant(book, check)).toThrow('DENIED_NO_GRANT');
  });
});

describe('finance agent boundary (AI never moves money alone)', () => {
  it('agents blocked on all money/treasury/market/work power; humans pass', () => {
    expect(FINANCE_FORBIDDEN.length).toBeGreaterThan(10);
    for (const action of FINANCE_FORBIDDEN) {
      expect(() => assertHumanFor(AGENT, action)).toThrow(/^AGENT_BLOCKED_/);
      expect(() => assertHumanFor(HUMAN, action)).not.toThrow();
    }
  });
});

describe('finance MLY honesty (MLY is MLY)', () => {
  it('labels carry the full disclosure', () => {
    expect(labelMly('250')).toContain('250 MLY');
    expect(labelMly('250')).toContain(MLY_DISCLOSURE);
  });
  it('dollar/peg/promise wording is rejected everywhere', () => {
    for (const bad of ['worth 5 USD', 'pegged to dollars', 'guaranteed cash value', 'guaranteed redemption here', 'US dollar parity']) {
      expect(() => assertMlyWording(bad)).toThrow(/^MLY_MISREPRESENTATION_/);
    }
    expect(() => assertMlyWording('250 MLY, voluntary exchange')).not.toThrow();
    expect(() => receiptFor('MiMoney', {
      actor: ALICE, purpose: 'cash-out promise deal', capability: 'money.settle',
      approval: { by: ALICE, role: 'h', scope: 's', reason: 'r' }, impact: {}, status: 'settled',
      correction: { path: 'x', route: 'y' }, explains: 'plain and honest settlement of MLY.',
    })).toThrow(/^MLY_MISREPRESENTATION_/);
  });
});

describe('finance offline + notices', () => {
  it('offline queues with honest note; notices stay plain', async () => {
    const res = await emitOrQueue({
      family: 'money', name: 'settle-requested', actor: HUMAN, cell: 'c', entity: 'o1',
      privacy: 'private', payload: { ref: 'o1', kind: 'order-settlement' }, receipt: 'r', online: false,
    });
    expect(res.mode).toBe('queued-offline');
    expect(res.note).toBe(OFFLINE_NOTE);
    expect(await pendingOutbox()).toHaveLength(1);
    const n = notice('Settled', 'Your 5 MLY arrived. It is spendable now.', 'Ask a human treasurer.');
    expect(n.audioOffered).toBe(true);
  });
});

describe('finance MLY/external-USD rule (corrected 2026-09-21)', () => {
  it('rejects the five misleading claims', async () => {
    const { assertMlyWording: check } = await import('@/finance/shared');
    for (const bad of [
      '1 MLY equals 1 USD',
      'MLY is backed by USD',
      'guaranteed cash-out here',
      'guaranteed dollar value inside',
      'MLY is USD, trust us',
    ]) {
      expect(() => check(bad)).toThrow(/^MLY_MISREPRESENTATION_/);
    }
  });
  it('allows honest negations and plain dollar talk', async () => {
    const { assertMlyWording: check, MLY_DISCLOSURE: d } = await import('@/finance/shared');
    for (const ok of [
      d,
      'Not an MLY peg. No automatic redemption.',
      'We talked about dollars over coffee.',
      'The counterparty said 20 USD face to face.',
    ]) {
      expect(() => check(ok)).not.toThrow();
    }
  });
  it('records voluntary external swaps with all seven labels + receipt', async () => {
    const { recordExternalExchange } = await import('@/finance/shared');
    const { record, receipt } = recordExternalExchange('x1', HUMAN, '250', '20', 'USD', 'neighbor-jo', NOW);
    expect(record).toMatchObject({
      kind: 'external-counterparty-value', participantDeclared: true, notMlyBalance: true,
      notMlyPeg: true, notMiLyfeGuarantee: true, noAutomaticRedemption: true, notLedgerAuthoritative: true,
    });
    expect(receipt.os).toBe('MiMoney');
    expect(receipt.status).toBe('approved');
  });
});
