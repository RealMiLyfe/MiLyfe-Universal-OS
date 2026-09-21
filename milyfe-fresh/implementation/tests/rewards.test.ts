import { describe, expect, it } from 'vitest';
import { fundTreasury, openTreasury, payReward } from '@/governance/rewards';

describe('rewards (treasury vault)', () => {
  it('funds and pays with Rewarded label', () => {
    let t = fundTreasury(openTreasury(), '1000');
    const { treasury, reward } = payReward(t, 'alice', '250', 'fix-it room shift', '2026-01-01T00:00:00Z');
    t = treasury;
    expect(reward.state).toBe('rewarded');
    expect(t.balanceMinor).toBe('750');
    expect(t.paidMinor).toBe('250');
  });
  it('refuses to pay what it lacks; refuses invalid amounts', () => {
    const t = fundTreasury(openTreasury(), '100');
    expect(() => payReward(t, 'alice', '101', 'x', '2026-01-01T00:00:00Z')).toThrow('TREASURY_SHORT');
    expect(() => payReward(t, 'alice', '0', 'x', '2026-01-01T00:00:00Z')).toThrow('INVALID_AMOUNT');
    expect(() => fundTreasury(t, '-5')).toThrow('INVALID_AMOUNT');
  });
});
