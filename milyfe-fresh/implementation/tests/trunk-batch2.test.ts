import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/kernel';
import {
  chorusCapOk, getSkill, issueLease, leaseValid, registerSkill, revokeLease,
} from '@/trunk/miagent';
import { classify } from '@/trunk/miwalk';
import {
  correctMemory, getContinuity, recordChange, recordMemory, setContinuity,
} from '@/trunk/mipsyche';

beforeEach(async () => {
  await db.docs.clear();
});

describe('MiPsyche continuity', () => {
  it('records changes with summary+risk+continuity, rejects thin ones', async () => {
    const c = await recordChange({ id: 'ch1', instance: 'mi-1', kind: 'memory', summary: 's', risk: 'r', continuity: 'c', decision: 'accept', approval: 'h1' });
    expect(c.id).toBe('ch1');
    await expect(recordChange({ id: 'ch2', instance: 'mi-1', kind: 'model', summary: '', risk: 'r', continuity: 'c', decision: 'branch', approval: 'h' }))
      .rejects.toThrow('CHANGE_NEEDS_SUMMARY_RISK_CONTINUITY');
  });
  it('memory corrections append, never rewrite', async () => {
    await recordMemory({ id: 'm1', instance: 'mi-1', provenance: 'inference', content: 'guess' });
    await recordMemory({ id: 'm2', instance: 'mi-1', provenance: 'direct', content: 'fact' });
    const fixed = await correctMemory('m1', 'm2');
    expect(fixed.correctedBy).toBe('m2');
    expect(fixed.content).toBe('guess'); // original preserved
  });
  it('pause/restore tracks lineage', async () => {
    await setContinuity('mi-1', 'paused', 'maintenance');
    const s = await setContinuity('mi-1', 'active', 'restored');
    expect(s.status).toBe('active');
    expect(s.lineage).toHaveLength(2);
    expect(await getContinuity('mi-1')).toMatchObject({ status: 'active' });
  });
});

describe('MiAgent permissions', () => {
  it('registers ordinary skills, rejects forbidden scopes', async () => {
    await registerSkill({ id: 'summarize', version: '1', owner: 't', risk: 'ordinary', capabilities: ['text.summarize'], tools: ['mcp-text'] });
    expect(await getSkill('summarize', '1')).toMatchObject({ risk: 'ordinary' });
    await expect(registerSkill({ id: 'evil', version: '1', owner: 't', risk: 'ordinary', capabilities: ['money.move-alone'], tools: [] }))
      .rejects.toThrow('SKILL_FORBIDDEN_SCOPE');
  });
  it('leases need goal + future expiry + allowed scope; revoke ends them', async () => {
    const future = new Date(Date.now() + 3600_000).toISOString();
    await issueLease({ id: 'l1', agent: 'a1', skill: 'summarize@1', goal: 'summarize thread', scope: ['text.summarize'], expires: future, receipt: 'r' });
    expect(await leaseValid('l1')).toBe(true);
    await expect(issueLease({ id: 'l2', agent: 'a1', skill: 's', goal: '', scope: ['text.summarize'], expires: future, receipt: 'r' }))
      .rejects.toThrow('LEASE_NEEDS_GOAL');
    await expect(issueLease({ id: 'l3', agent: 'a1', skill: 's', goal: 'g', scope: ['compact.change'], expires: future, receipt: 'r' }))
      .rejects.toThrow('LEASE_FORBIDDEN_SCOPE');
    await revokeLease('l1');
    expect(await leaseValid('l1')).toBe(false);
  });
  it('chorus cap holds helpers at or under 5%', () => {
    expect(chorusCapOk(5, 100)).toBe(true);
    expect(chorusCapOk(6, 100)).toBe(false);
    expect(chorusCapOk(0, 0)).toBe(true);
  });
});

describe('MiWalk offline classifier', () => {
  it('money, guardianship, and binding ballots ALWAYS go to human review', () => {
    expect(classify({ op: 'x', family: 'money' })).toBe('human-review');
    expect(classify({ op: 'x', family: 'money', sub: 'tiny-tip' })).toBe('human-review');
    expect(classify({ op: 'x', family: 'identity', sub: 'guardianship' })).toBe('human-review');
    expect(classify({ op: 'x', family: 'governance', sub: 'binding-ballot' })).toBe('human-review');
  });
  it('classifies everyday actions sanely', () => {
    expect(classify({ op: 'x', family: 'message' })).toBe('mergeable');
    expect(classify({ op: 'x', family: 'presence' })).toBe('mergeable');
    expect(classify({ op: 'x', family: 'data' })).toBe('mergeable');
    expect(classify({ op: 'x', family: 'data', sub: 'delete' })).toBe('human-review');
    expect(classify({ op: 'x', family: 'market', sub: 'order' })).toBe('reservable');
    expect(classify({ op: 'x', family: 'work', sub: 'hours' })).toBe('mergeable');
    expect(classify({ op: 'x', family: 'identity', sub: 'proof' })).toBe('expiring');
    expect(classify({ op: 'x', family: 'system' })).toBe('rejectable');
  });
});
