import { describe, expect, it } from 'vitest';
import {
  disburseWelcome, draftContract, draftOffering, earnedIncome, exportVenture, markDelivered, moveRevenue,
  moveVenture, onboardNode, publishOffering, pauseOffering, recognizeRevenue, retireOffering,
  signContract, startVenture, trackRevenue, verifyNode,
} from '@/finance/miforge';
import type { Caller } from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'reviewed' };

describe('miforge ventures (idea → income, pausable, retirable)', () => {
  it('runs the lifecycle; skips rejected; owners only', () => {
    let v = startVenture('v1', HUMAN, 'Bread cart', NOW);
    expect(() => moveVenture(v, HUMAN, 'income', 'skip', NOW)).toThrow('BAD_VENTURE_MOVE');
    expect(() => moveVenture(v, { did: tdid('mallory'), kind: 'human' }, 'offer', 'x', NOW)).toThrow('NOT_OWNER');
    v = moveVenture(v, HUMAN, 'offer', 'menu ready', NOW);
    v = moveVenture(v, HUMAN, 'customers', 'first buyers', NOW);
    v = moveVenture(v, HUMAN, 'paused', 'oven broke', NOW);
    v = moveVenture(v, HUMAN, 'income', 'reopened', NOW);
    expect(v.stage).toBe('income');
  });
  it('nodes list only after human verification', () => {
    let v = startVenture('v1', HUMAN, 'Bread cart', NOW);
    v = onboardNode(v, HUMAN, { id: 'n1', kind: 'shop', owner: ALICE });
    expect(() => verifyNode(v, AGENT, 'n1', APPROVAL)).toThrow('AGENT_BLOCKED_MARKET_MERCHANT_APPROVE');
    v = verifyNode(v, HUMAN, 'n1', APPROVAL);
    expect(v.nodes[0].verified).toBe(true);
    expect(() => onboardNode(v, HUMAN, { id: 'n1', kind: 'shop', owner: ALICE })).toThrow('NODE_EXISTS');
  });
  it('offerings publish/pause/retire; unverified nodes blocked', () => {
    let v = startVenture('v1', HUMAN, 'Bread cart', NOW);
    v = onboardNode(v, HUMAN, { id: 'n1', kind: 'shop', owner: ALICE });
    expect(() => draftOffering('o1', HUMAN, v, 'n1', 'product', 'Loaf', '5', 'fresh daily')).toThrow('NODE_UNVERIFIED');
    v = verifyNode(v, HUMAN, 'n1', APPROVAL);
    let o = draftOffering('o1', HUMAN, v, 'n1', 'product', 'Loaf', '5', 'fresh daily');
    o = publishOffering(o, HUMAN, v);
    o = pauseOffering(o, HUMAN, v);
    expect(pauseOffering).toBeDefined();
    expect(retireOffering(o, HUMAN, v).state).toBe('retired');
  });
});

describe('miforge value contracts (signed before work)', () => {
  it('splits total 100; every party signs self', () => {
    const v = startVenture('v1', HUMAN, 'Bread cart', NOW);
    expect(() => draftContract('c1', HUMAN, v, [{ did: ALICE, role: 'founder', splitPct: 60 }], ['bake'])).toThrow('SPLITS_MUST_TOTAL_100');
    const bob = tdid('bob');
    let c = draftContract('c1', HUMAN, v, [
      { did: ALICE, role: 'founder', splitPct: 60 },
      { did: bob, role: 'maker', splitPct: 40 },
    ], ['bake', 'sell']);
    expect(() => signContract(c, HUMAN, bob)).toThrow('MUST_SIGN_SELF');
    c = signContract(c, HUMAN, ALICE);
    expect(c.state).toBe('draft');
    c = signContract(c, { did: bob, kind: 'human' }, bob);
    expect(c.state).toBe('signed');
  });
});

describe('miforge revenue (settled counts; projected is zero)', () => {
  it('recognition needs settled + accepted delivery + human', () => {
    let r = trackRevenue('r1', HUMAN, 'v1', '500', NOW);
    expect(() => recognizeRevenue(r, HUMAN, APPROVAL)).toThrow('PROJECTED_NOT_EARNED');
    r = moveRevenue(r, 'pending');
    r = moveRevenue(r, 'verified');
    r = moveRevenue(r, 'settled');
    expect(() => recognizeRevenue(r, HUMAN, APPROVAL)).toThrow('DELIVERY_NOT_ACCEPTED');
    r = markDelivered(r, true);
    expect(() => recognizeRevenue(r, AGENT, APPROVAL)).toThrow('AGENT_BLOCKED_FORGE_REVENUE_RECOGNIZE');
    expect(recognizeRevenue(r, HUMAN, APPROVAL).state).toBe('settled');
    expect(() => moveRevenue(r, 'pending')).toThrow('ILLEGAL_REVENUE_MOVE');
  });
  it('earned income ignores signups, recruits, projections', () => {
    const settled = moveRevenue(moveRevenue(moveRevenue(trackRevenue('a', HUMAN, 'v1', '100', NOW), 'pending'), 'verified'), 'settled');
    const projected = trackRevenue('b', HUMAN, 'v1', '999999', NOW);
    expect(earnedIncome([settled, projected])).toBe('100');
  });
  it('welcome credits: budgeted, human, online — never offline-minted', () => {
    expect(disburseWelcome('0', '50', '1000', HUMAN, APPROVAL, true)).toEqual({ ok: true });
    expect(() => disburseWelcome('0', '50', '1000', HUMAN, APPROVAL, false)).toThrow('NO_OFFLINE_MINT');
    expect(() => disburseWelcome('0', '50', '1000', AGENT, APPROVAL, true)).toThrow('AGENT_BLOCKED_FORGE_WELCOME_DISBURSE');
    expect(() => disburseWelcome('990', '50', '1000', HUMAN, APPROVAL, true)).toThrow('WELCOME_OVER_BUDGET');
  });
  it('ventures export whole', () => {
    const v = startVenture('v1', HUMAN, 'Bread cart', NOW);
    expect(exportVenture(v, [], [], []).venture.id).toBe('v1');
  });
});
