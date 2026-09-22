import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { MiEvent, MiReceiptSchema, MiScopeGrant } from '@/contracts';
import { __resetBusForTests, db, generateKeyPair, pendingOutbox, subscribe } from '@/kernel';
import { issueReceipt } from '@/kernel/receipt';
import type { Grant } from '@/kernel/scope';
import {
  AGENT_FORBIDDEN_ACTIONS, assertGrant, assertHumanFor, assertOwnerConsent, emitOrQueue,
  grantConsent, notice, OFFLINE_NOTE, openConsentBook, readConsented, receiptFor, revokeConsent,
  type Caller,
} from '@/lifestyle/shared';

export const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const LATER = '2027-01-01T00:00:00Z';

function grant(partial: Partial<Grant> = {}): Grant {
  return {
    id: crypto.randomUUID(), issuer: ALICE, subject: ALICE, target: 'care:plan',
    purpose: 'care', scope: ['plan-draft'], expires: LATER, approval: 'test', ...partial,
  };
}

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('lifestyle contracts (frozen Phase 3)', () => {
  it('published lifestyle events validate against MiEvent', async () => {
    const seen: string[] = [];
    subscribe('care.*', (e) => { seen.push(e.id); });
    const res = await emitOrQueue({
      family: 'care', name: 'check-in', actor: HUMAN, cell: 'cell-a', entity: 'plan-1',
      privacy: 'private', payload: { ref: 'plan-1', kind: 'check-in', at: NOW }, receipt: 'r1', online: true,
    });
    expect(res.mode).toBe('published');
    const stored = await db.events.toArray();
    expect(stored).toHaveLength(1);
    expect(MiEvent.safeParse(stored[0]).success).toBe(true);
    expect(seen).toEqual([stored[0].id]);
  });
  it('lifestyle receipts validate against MiReceiptSchema', async () => {
    const kp = await generateKeyPair();
    const input = receiptFor('MiCare', {
      actor: kp.did, purpose: 'test', capability: 'care.plan-approve',
      approval: { by: kp.did, role: 'human', scope: 'care', reason: 'ok' },
      impact: {}, status: 'executed',
      correction: { path: 'MiResolve', route: 'resolve.appeal-requested' },
      explains: 'A care plan was approved by a human reviewer.',
    });
    expect(MiReceiptSchema.safeParse(await issueReceipt(input, kp.privateKey)).success).toBe(true);
  });
  it('lifestyle grants validate against MiScopeGrant', () => {
    const g = grant({ target: 'health:record', scope: ['slice-read'] });
    expect(MiScopeGrant.safeParse(g).success).toBe(true);
  });
});

describe('lifestyle permissions (kernel scope)', () => {
  it('grants pass; expired and wrong-action grants fail', () => {
    const g = grant();
    expect(assertGrant([g], { subject: ALICE, target: 'care:plan', action: 'plan-draft', purpose: 'care', now: NOW })).toBe(g.id);
    expect(() => assertGrant([g], { subject: ALICE, target: 'care:plan', action: 'plan-delete', purpose: 'care', now: NOW })).toThrow('DENIED_NO_MATCHING_GRANT');
    expect(() => assertGrant([{ ...g, expires: '2020-01-01T00:00:00Z' }], { subject: ALICE, target: 'care:plan', action: 'plan-draft', purpose: 'care', now: NOW })).toThrow('DENIED_NO_MATCHING_GRANT');
  });
  it('owner consent needs a live grant issued by the owner', () => {
    const g = grant({ issuer: tdid('receiver'), subject: ALICE, scope: ['plan-draft'] });
    expect(assertOwnerConsent([g], tdid('receiver'), ALICE, 'care:plan', 'plan-draft', NOW)).toBe(g.id);
    expect(() => assertOwnerConsent([g], tdid('someone-else'), ALICE, 'care:plan', 'plan-draft', NOW)).toThrow('DENIED_NO_OWNER_CONSENT');
  });
});

describe('lifestyle agent boundary (humans only for high-impact)', () => {
  it('agents are blocked on every forbidden action; humans pass', () => {
    expect(AGENT_FORBIDDEN_ACTIONS.length).toBeGreaterThan(10);
    for (const action of AGENT_FORBIDDEN_ACTIONS) {
      expect(() => assertHumanFor(AGENT, action)).toThrow(/^AGENT_BLOCKED_/);
      expect(() => assertHumanFor(HUMAN, action)).not.toThrow();
    }
  });
  it('agents may do ordinary acts with a valid caller id', () => {
    expect(() => assertHumanFor(AGENT, 'care.check-in')).not.toThrow();
    expect(() => assertHumanFor({ did: 'not-a-did', kind: 'agent' }, 'care.check-in')).toThrow('BAD_DID');
  });
});

describe('lifestyle consent books', () => {
  it('grant → read → partial revoke → full revoke', () => {
    let book = grantConsent(openConsentBook(ALICE), ALICE, 'clinic-a', ['allergies', 'meds'], LATER);
    expect(readConsented(book, 'clinic-a', { allergies: 'x', meds: 'y', notes: 'z' }, NOW)).toEqual({ allergies: 'x', meds: 'y' });
    book = revokeConsent(book, ALICE, 'clinic-a', ['meds']);
    expect(readConsented(book, 'clinic-a', { allergies: 'x', meds: 'y' }, NOW)).toEqual({ allergies: 'x' });
    book = revokeConsent(book, ALICE, 'clinic-a');
    expect(readConsented(book, 'clinic-a', { allergies: 'x', meds: 'y' }, NOW)).toEqual({});
  });
  it('only the owner grants or revokes; expiry enforced', () => {
    const book = openConsentBook(ALICE);
    expect(() => grantConsent(book, tdid('mallory'), 'x', ['a'], LATER)).toThrow('NOT_OWNER');
    expect(() => revokeConsent(book, tdid('mallory'), 'x')).toThrow('NOT_OWNER');
    const stale = grantConsent(book, ALICE, 'clinic-a', ['a'], '2020-01-01T00:00:00Z');
    expect(readConsented(stale, 'clinic-a', { a: '1' }, NOW)).toEqual({});
  });
});

describe('lifestyle bus + offline honesty', () => {
  it('private/sealed events carry references only — bodies rejected', async () => {
    await expect(emitOrQueue({
      family: 'health', name: 'leak', actor: HUMAN, cell: 'c', entity: 'e', privacy: 'sealed',
      payload: { ref: 'e', diagnosis: 'flu' }, receipt: 'r', online: true,
    })).rejects.toThrow('BUS_BODY_LEAK_DIAGNOSIS');
  });
  it('offline queues with an honest note; nothing sent silently', async () => {
    const res = await emitOrQueue({
      family: 'care', name: 'check-in', actor: HUMAN, cell: 'c', entity: 'plan-1', privacy: 'private',
      payload: { ref: 'plan-1', kind: 'check-in', at: NOW }, receipt: 'r', online: false,
    });
    expect(res.mode).toBe('queued-offline');
    expect(res.note).toBe(OFFLINE_NOTE);
    expect(await pendingOutbox()).toHaveLength(1);
    expect(await db.events.toArray()).toHaveLength(0);
  });
});

describe('lifestyle notices (accessibility)', () => {
  it('notices are short, code-free, with audio + human fallback', () => {
    const n = notice('Plan approved', 'Your care plan is active. Your helpers can see their tasks.', 'Call your care coordinator.');
    expect(n.audioOffered).toBe(true);
    expect(n.humanFallback.length).toBeGreaterThan(0);
    expect(() => notice('t', 'x'.repeat(281), 'help')).toThrow('NOTICE_NOT_PLAIN');
    expect(() => notice('t', 'Failed with ERR_CODE_500X', 'help')).toThrow('NOTICE_HAS_CODES');
  });
});
