import { describe, expect, it } from 'vitest';
import { CIRCLE_CAP, createCircle, joinCircle, leaveCircle, rotateSteward } from '@/governance/circles';

describe('circles (500 cap, rotating steward)', () => {
  it('caps membership at 500', () => {
    let c = createCircle('c1', 'Riverside', 'founder', '2026-01-01T00:00:00Z');
    for (let i = 0; i < CIRCLE_CAP - 1; i++) c = joinCircle(c, `m${i}`);
    expect(c.members).toHaveLength(500);
    expect(() => joinCircle(c, 'one-too-many')).toThrow('CIRCLE_FULL');
    expect(() => joinCircle(c, 'm0')).toThrow('ALREADY_MEMBER');
  });
  it('steward rotates to a member, never stuck', () => {
    let c = joinCircle(createCircle('c1', 'Riverside', 'a', '2026-01-01T00:00:00Z'), 'b');
    expect(() => leaveCircle(c, 'a')).toThrow('STEWARD_MUST_ROTATE_FIRST');
    c = rotateSteward(c, 'b', '2026-04-01T00:00:00Z');
    expect(c.steward).toBe('b');
    c = leaveCircle(c, 'a');
    expect(c.members).not.toContain('a');
    expect(() => rotateSteward(c, 'ghost', '2026-05-01T00:00:00Z')).toThrow('NOT_A_MEMBER');
  });
});
