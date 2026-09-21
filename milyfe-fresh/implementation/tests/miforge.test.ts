import { describe, expect, it } from 'vitest';
import { cohortCounts, detectStuck, FOUNDING_TARGETS, welcomeWithinBudget, type CohortMember } from '@/finance/miforge';

const mem = (over: Partial<CohortMember>): CohortMember => ({
  id: 'm1', cohort: 'c1', kind: 'daily', entity: 'did:milyfe:x',
  status: 'onboarding', step: 'proof', lastActiveAt: new Date().toISOString(), nudges: 0, ...over,
});

describe('MiForge cohort engine', () => {
  it('founding targets: 200 Pro + 1000 Daily', () => {
    expect(FOUNDING_TARGETS).toEqual({ pro: 200, daily: 1000 });
  });
  it('detects stuck members (idle > 48h or max nudges)', () => {
    const old = new Date(Date.now() - 50 * 3600_000).toISOString();
    expect(detectStuck(mem({ lastActiveAt: old }))).toBe(true);
    expect(detectStuck(mem({ nudges: 3 }))).toBe(true);
    expect(detectStuck(mem({}))).toBe(false);
    expect(detectStuck(mem({ status: 'active', lastActiveAt: old }))).toBe(false);
  });
  it('counts cohort statuses', () => {
    const cs = cohortCounts([mem({ status: 'invited' }), mem({ status: 'stuck' }), mem({ status: 'stuck' })]);
    expect(cs).toMatchObject({ invited: 1, stuck: 2, active: 0 });
  });
  it('welcome budget guard never exceeds human-approved budget', () => {
    expect(welcomeWithinBudget('800', '200', '1000')).toBe(true);
    expect(welcomeWithinBudget('800', '201', '1000')).toBe(false);
    expect(welcomeWithinBudget('0', '0', '1000')).toBe(false);
  });
});
