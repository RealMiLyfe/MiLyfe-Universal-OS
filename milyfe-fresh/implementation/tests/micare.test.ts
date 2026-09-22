import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import type { Grant } from '@/kernel/scope';
import {
  addHelper, appealToResolve, approvePlan, bookRespite, checkIn, closeEscalation, draftPlan,
  exportCareHistory, markBooking, openSupportTicket, raiseEscalation, recordSupportedDecision,
  requestDeletion, suspendHelper,
} from '@/lifestyle/micare';
import type { Caller } from '@/lifestyle/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const RECEIVER = tdid('receiver');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const LATER = '2027-01-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'reviewed with family' };

function grants(): Grant[] {
  return [
    { id: crypto.randomUUID(), issuer: RECEIVER, subject: ALICE, target: 'care:plan', purpose: 'care', scope: ['plan-draft', 'helper-add'], expires: LATER, approval: 'receiver-consent' },
  ];
}

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('micare plans (consent + human approval)', () => {
  it('drafts need receiver consent; activation needs human approval', () => {
    expect(() => draftPlan([], HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW)).toThrow('DENIED_NO_OWNER_CONSENT');
    const plan = draftPlan(grants(), HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW);
    expect(plan.state).toBe('draft');
    expect(() => approvePlan(plan, AGENT, APPROVAL)).toThrow('AGENT_BLOCKED_CARE_PLAN_APPROVE');
    expect(() => approvePlan(plan, HUMAN, { by: '', at: NOW, reason: '' })).toThrow('APPROVAL_INCOMPLETE');
    expect(approvePlan(plan, HUMAN, APPROVAL).state).toBe('active');
  });
  it('helpers join by receiver consent, once each', () => {
    let plan = approvePlan(draftPlan(grants(), HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW), HUMAN, APPROVAL);
    plan = addHelper(plan, grants(), HUMAN, tdid('helper1'), 'aide', NOW);
    expect(plan.helpers).toHaveLength(1);
    expect(() => addHelper(plan, grants(), HUMAN, tdid('helper1'), 'aide', NOW)).toThrow('HELPER_ALREADY_ON_PLAN');
  });
  it('abuse suspends the helper with a sealed reference-only record', async () => {
    let plan = approvePlan(draftPlan(grants(), HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW), HUMAN, APPROVAL);
    plan = addHelper(plan, grants(), HUMAN, tdid('helper1'), 'aide', NOW);
    await expect(suspendHelper(plan, AGENT, APPROVAL, tdid('helper1'), 'report', 'cell-a', true)).rejects.toThrow('AGENT_BLOCKED_CARE_HELPER_SUSPEND');
    const { plan: next, receipt, bus } = await suspendHelper(plan, HUMAN, APPROVAL, tdid('helper1'), 'missed visits + rude', 'cell-a', true);
    expect(next.helpers[0].suspended).toBe(true);
    expect(receipt.branch).toBe('lifestyle');
    expect(receipt.os).toBe('MiCare');
    expect(bus.mode).toBe('published');
    const stored = await db.events.toArray();
    expect(Object.keys(stored[0].payload as object).sort()).toEqual(['kind', 'reason', 'ref']);
  });
});

describe('micare decisions + respite + check-ins', () => {
  it('supported decisions need a human countersign', () => {
    expect(() => recordSupportedDecision('d1', AGENT, RECEIVER, ALICE, 'meals', APPROVAL, NOW)).toThrow('AGENT_BLOCKED_CARE_DECIDE_ALONE');
    const d = recordSupportedDecision('d1', HUMAN, RECEIVER, ALICE, 'meals', APPROVAL, NOW);
    expect(d.assent).toBe('yes');
  });
  it('respite books hours (never money) on active plans', () => {
    const draft = draftPlan(grants(), HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW);
    expect(() => bookRespite('b1', HUMAN, draft, tdid('h1'), 'sat', 3)).toThrow('PLAN_NOT_ACTIVE');
    let plan = approvePlan(draft, HUMAN, APPROVAL);
    plan = addHelper(plan, grants(), HUMAN, tdid('h1'), 'aide', NOW);
    expect(() => bookRespite('b1', HUMAN, plan, tdid('h1'), 'sat', 0)).toThrow('BAD_HOURS');
    const b = bookRespite('b1', HUMAN, plan, tdid('h1'), 'sat', 3);
    expect(b).not.toHaveProperty('amount');
    expect(markBooking(markBooking(b, 'no-show'), 'rebooked').state).toBe('rebooked');
    expect(() => markBooking(b, 'done')).not.toThrow();
  });
  it('check-ins publish online, queue honestly offline', async () => {
    const plan = approvePlan(draftPlan(grants(), HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW), HUMAN, APPROVAL);
    expect((await checkIn('c1', HUMAN, plan, 'cell-a', NOW, true)).queued).toBe(false);
    expect((await checkIn('c2', HUMAN, plan, 'cell-a', NOW, false)).queued).toBe(true);
  });
});

describe('micare escalation + support + appeal', () => {
  it('anyone can raise; only humans close', () => {
    const plan = approvePlan(draftPlan(grants(), HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW), HUMAN, APPROVAL);
    const e = raiseEscalation('e1', AGENT, plan, 'missed meds window', 'urgent');
    expect(e.notice.audioOffered).toBe(true);
    expect(() => closeEscalation(e, AGENT, APPROVAL)).toThrow('AGENT_BLOCKED_SAFETY_ESCALATE_CLOSE');
    expect(closeEscalation(e, HUMAN, APPROVAL).state).toBe('resolved');
    const em = raiseEscalation('e2', HUMAN, plan, 'fall, no answer', 'emergency');
    expect(em.state).toBe('human-review');
  });
  it('support tickets open; appeals ride the bus to MiResolve', async () => {
    const plan = approvePlan(draftPlan(grants(), HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW), HUMAN, APPROVAL);
    expect(openSupportTicket('s1', HUMAN, plan, 'need night cover').state).toBe('open');
    const bus = await appealToResolve(HUMAN, plan, 'cell-a', true);
    expect(bus.mode).toBe('published');
    expect((await db.events.toArray())[0].family).toBe('resolve');
  });
});

describe('micare export + deletion', () => {
  it('full history exports; youth deletion needs a guardian', () => {
    const plan = approvePlan(draftPlan(grants(), HUMAN, 'p1', RECEIVER, ['meals'], 'mornings', NOW), HUMAN, APPROVAL);
    const out = exportCareHistory(plan, [], []);
    expect(out.id).toBe('p1');
    expect(() => requestDeletion(HUMAN, plan, true)).toThrow('YOUTH_NEEDS_GUARDIAN');
    expect(requestDeletion(HUMAN, plan, true, APPROVAL).status).toBe('approved');
    expect(requestDeletion(HUMAN, plan, false).status).toBe('approved');
  });
});
