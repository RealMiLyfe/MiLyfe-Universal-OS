import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db, syncOutbox } from '@/kernel';
import type { Grant } from '@/kernel/scope';
import { checkIn, draftPlan } from '@/lifestyle/micare';
import { approvePlan } from '@/lifestyle/micare';
import { emergencyAccess, readYouthSlices, setEmergencyCard } from '@/lifestyle/mihealth';
import {
  AGENT_FORBIDDEN_ACTIONS, emitOrQueue, grantConsent, OFFLINE_NOTE, openConsentBook, readConsented,
  revokeConsent, type Caller,
} from '@/lifestyle/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const NOW = '2026-06-01T00:00:00Z';
const LATER = '2027-01-01T00:00:00Z';

// Executable security review for the Lifestyle branch. Each test pins a
// security property so a future change cannot silently weaken it. This is an
// agent self-check: independent human review is still pending (see
// branches/lifestyle/LIFESTYLE-SECURITY-REVIEW.md).

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('lifestyle security review (agent self-check)', () => {
  it('SR-1: agent-forbidden list covers care, clinical, child, safety, credential acts', () => {
    const joined = AGENT_FORBIDDEN_ACTIONS.join(' ');
    for (const area of ['care.', 'health.diagnose', 'health.treat', 'health.prescribe', 'child.', 'safety.', 'edu.credential']) {
      expect(joined).toContain(area);
    }
  });
  it('SR-2: sealed bus traffic carries references, never record bodies', async () => {
    const res = await emitOrQueue({
      family: 'care', name: 'helper-suspended', actor: HUMAN, cell: 'c', entity: 'plan-1',
      privacy: 'sealed', payload: { ref: 'plan-1', kind: 'helper-suspended', reason: 'report filed' },
      receipt: 'r', online: true,
    });
    expect(res.mode).toBe('published');
    const stored = (await db.events.toArray())[0].payload as Record<string, unknown>;
    expect(Object.keys(stored).sort()).toEqual(['kind', 'reason', 'ref']);
    await expect(emitOrQueue({
      family: 'care', name: 'x', actor: HUMAN, cell: 'c', entity: 'e', privacy: 'sealed',
      payload: { ref: 'e', carePlan: 'full body here' }, receipt: 'r', online: true,
    })).rejects.toThrow('BUS_BODY_LEAK_CAREPLAN');
  });
  it('SR-3: no cross-branch source imports in lifestyle code', async () => {
    // Branch boundary: lifestyle may use trunk + contracts + bus only.
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dir = path.resolve(__dirname, '../src/lifestyle');
    for (const file of fs.readdirSync(dir)) {
      const src = fs.readFileSync(path.join(dir, file), 'utf8');
      expect(src).not.toMatch(/from '@\/(governance|finance)\//);
    }
  });
  it('SR-4: youth health reads fail closed without guardian permission', () => {
    const youth = tdid('youth9');
    const base: Grant = {
      id: crypto.randomUUID(), issuer: tdid('guardian'), subject: ALICE, target: `health:record:${youth}`,
      purpose: 'care', scope: ['slice-read'], expires: LATER, roles: ['child'], approval: 'x',
    };
    expect(() => readYouthSlices([base], HUMAN, youth, NOW)).toThrow('DENIED');
    expect(() => readYouthSlices([{ ...base, youthAssent: true }], HUMAN, youth, NOW)).toThrow('DENIED');
  });
  it('SR-5: consent revocation takes effect immediately', () => {
    let book = grantConsent(openConsentBook(ALICE), ALICE, 'reader-x', ['allergies'], LATER);
    book = revokeConsent(book, ALICE, 'reader-x');
    expect(readConsented(book, 'reader-x', { allergies: 'peanuts' }, NOW)).toEqual({});
  });
  it('SR-6: emergency access is always flagged for human review', () => {
    const card = setEmergencyCard(HUMAN, { allergies: 'peanuts' });
    const acc = emergencyAccess(card, { did: tdid('responder'), kind: 'human' }, 'found collapsed', NOW);
    expect(acc.needsReview).toBe(true);
  });
  it('SR-7: offline work queues visibly and syncs honestly on reconnect', async () => {
    const receiver = tdid('recv1');
    const g: Grant[] = [{
      id: crypto.randomUUID(), issuer: receiver, subject: ALICE, target: 'care:plan',
      purpose: 'care', scope: ['plan-draft'], expires: LATER, approval: 'receiver-consent',
    }];
    const plan = approvePlan(
      draftPlan(g, HUMAN, 'p1', receiver, ['meals'], 'mornings', NOW),
      HUMAN, { by: ALICE, at: NOW, reason: 'reviewed' },
    );
    const queued = await checkIn('c1', HUMAN, plan, 'cell-a', NOW, false);
    expect(queued.queued).toBe(true);
    const sent: string[] = [];
    const res = await syncOutbox(async (item) => { sent.push(item.key); });
    expect(res).toEqual({ acked: 1, failed: 0 });
    expect(sent).toHaveLength(1);
    expect(OFFLINE_NOTE.length).toBeGreaterThan(0);
  });
});
