import { describe, expect, it } from 'vitest';
import { activeHolds, aiSummaryLabel, checkEnable, placeHold, releaseHold, routeToCounsel } from '@/governance/milegal';

const NOW = '2026-06-01T00:00:00Z';
const FRESH = '2026-05-01T00:00:00Z';

describe('milegal (fail-closed checks, holds, routing)', () => {
  it('enables only on profile-yes + consent + ceiling + freshness', () => {
    const ok = [{ jurisdiction: 'US-FL', capability: 'mimarket-sell', allowed: true, ceiling: 2, freshAsOf: FRESH }];
    expect(checkEnable(ok, 'mimarket-sell', 1, true, NOW)).toEqual({ allowed: true, reason: 'ALL_PROFILES_ALLOW' });
    expect(checkEnable(ok, 'mimarket-sell', 1, false, NOW).allowed).toBe(false);
    expect(checkEnable(ok, 'mimarket-sell', 3, true, NOW)).toEqual({ allowed: false, reason: 'CEILING_US-FL' });
    expect(checkEnable(ok, 'unknown-thing', 1, true, NOW)).toEqual({ allowed: false, reason: 'NO_PROFILE' });
  });
  it('strictest profile wins; stale fails closed', () => {
    const profiles = [
      { jurisdiction: 'US-FL', capability: 'lend', allowed: true, ceiling: 3, freshAsOf: FRESH },
      { jurisdiction: 'US-NY', capability: 'lend', allowed: false, ceiling: 3, freshAsOf: FRESH },
    ];
    expect(checkEnable(profiles, 'lend', 1, true, NOW)).toEqual({ allowed: false, reason: 'DENIED_BY_US-NY' });
    const stale = [{ jurisdiction: 'US-FL', capability: 'lend', allowed: true, ceiling: 3, freshAsOf: '2020-01-01T00:00:00Z' }];
    expect(checkEnable(stale, 'lend', 1, true, NOW).reason).toBe('STALE_PROFILE_US-FL');
  });
  it('holds need an end; active list hides released/expired', () => {
    expect(() => placeHold([], { id: 'h', scope: 'x', reason: 'y', placedBy: 's', placedAt: NOW, expiresAt: NOW })).toThrow('HOLD_NEEDS_END');
    let holds = placeHold([], { id: 'h1', scope: 'doc-1', reason: 'review', placedBy: 's', placedAt: NOW, expiresAt: '2027-01-01T00:00:00Z' });
    expect(activeHolds(holds, NOW)).toHaveLength(1);
    holds = releaseHold(holds, 'h1', NOW);
    expect(activeHolds(holds, NOW)).toHaveLength(0);
  });
  it('routes to counsel privilege-flagged; AI labeled not-a-lawyer', () => {
    const r = routeToCounsel('r1', 'alice', 'eviction notice', 'US-FL', NOW);
    expect(r.privileged).toBe(true);
    expect(aiSummaryLabel('text')).toMatch(/^NOT A LAWYER/);
  });
});
