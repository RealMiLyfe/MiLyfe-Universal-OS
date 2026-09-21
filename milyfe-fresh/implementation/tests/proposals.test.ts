import { describe, expect, it } from 'vitest';
import { castVote, openProposal, tally } from '@/governance/proposals';

const OPEN = '2026-01-01T00:00:00Z';
const CLOSE = '2026-02-01T00:00:00Z';

describe('proposals (one member, one vote)', () => {
  it('counts votes once each with receipts', () => {
    let p = openProposal('p1', 'Fund fix-it rooms', 'standard', CLOSE);
    const r1 = castVote(p, 'alice', 'yes', OPEN);
    p = r1.proposal;
    expect(r1.receipt).toEqual({ proposal: 'p1', voter: 'alice', counted: true, at: OPEN });
    expect(() => castVote(p, 'alice', 'yes', OPEN)).toThrow('ALREADY_VOTED');
    expect(() => castVote(p, 'bob', 'yes', '2026-03-01T00:00:00Z')).toThrow('POLL_CLOSED');
  });
  it('quorum rejects tiny polls; money needs 2/3', () => {
    let small = openProposal('p2', 'x', 'standard', CLOSE);
    small = castVote(small, 'a', 'yes', OPEN).proposal;
    expect(tally(small).state).toBe('rejected-quorum');

    let money = openProposal('p3', 'Treasury spend', 'money', CLOSE);
    const voters = Array.from({ length: 12 }, (_, i) => `v${i}`);
    voters.forEach((v, i) => {
      money = castVote(money, v, i < 7 ? 'yes' : 'no', OPEN).proposal;
    });
    expect(tally(money).state).toBe('failed'); // 7/12 < 2/3
    let money2 = openProposal('p4', 'Treasury spend 2', 'money', CLOSE);
    voters.forEach((v, i) => {
      money2 = castVote(money2, v, i < 9 ? 'yes' : 'no', OPEN).proposal;
    });
    expect(tally(money2).state).toBe('passed'); // 9/12 > 2/3
  });
});
