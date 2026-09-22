import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import { audit, panicFreeze, quarantine, releaseQuarantine } from '@/trunk/misecurity';
import { openSupportTicket } from '@/lifestyle/micare';
import { matchMentor } from '@/lifestyle/mieducation';
import { openSupportCase } from '@/finance/mimarket';
import { approveMerchant, createMerchant } from '@/finance/mimarket';
import { workerHelp } from '@/finance/miwork';
import { openCase } from '@/governance/miresolve';
import { openRightsCase } from '@/governance/mijustice';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const NOW = '2026-06-01T00:00:00Z';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('support readiness (a human reachable from every branch)', () => {
  it('support doors exist in care, education, market, work, resolve, justice', () => {
    const human = { did: tdid('member'), kind: 'human' } as const;
    const plan = { id: 'p1' } as never;
    expect(openSupportTicket('s1', human, plan, 'need night cover').state).toBe('open');
    expect(matchMentor('m1', human, tdid('mentor'), human.did, 'learn first aid').state).toBe('matched');
    const merchant = approveMerchant(createMerchant('m1', human, 'Shop', 'terms'), human, { by: human.did, at: NOW, reason: 'ok' });
    expect(openSupportCase('s2', human, merchant, 'till stuck').notice.audioOffered).toBe(true);
    expect(workerHelp('h1', human, 'not paid').notice.humanFallback.length).toBeGreaterThan(5);
    expect(openCase('case-1', 'service', human.did, tdid('shop'), 'no show', NOW).retaliationGuard).toBe(true);
    expect(openRightsCase('rc-1', human.did, 'agency', 'benefits cut', false, NOW).state).toBe('open');
  });
});

describe('incident readiness (quarantine, freeze, audit)', () => {
  it('threats quarantine with human release; panic freezes; everything audits', async () => {
    const q = await quarantine('did:milyfe:farmer', 'reward farming pattern', 48);
    expect(q.expires).toBeDefined();
    await expect(releaseQuarantine('missing-id', 'did:milyfe:reviewer')).rejects.toThrow();
    await releaseQuarantine(q.id, 'did:milyfe:reviewer');
    const frozen = await panicFreeze('did:milyfe:victim');
    expect(typeof frozen).toBe('string');
    await audit('incident-drill', { quarantined: q.id, frozen });
  });
  it('escalation ladder runs support → dispute → rights case', () => {
    const human = { did: tdid('member'), kind: 'human' } as const;
    const ticket = openSupportTicket('s1', human, { id: 'p1' } as never, 'aide never came');
    expect(ticket.state).toBe('open');
    const dispute = openCase('case-1', 'service', human.did, tdid('agency'), 'agency ignored ticket s1', NOW);
    expect(dispute.state).toBe('open');
    const rights = openRightsCase('rc-1', human.did, 'agency', 'care denied after dispute case-1', true, NOW);
    expect(rights.sealed).toBe(true);
  });
});
