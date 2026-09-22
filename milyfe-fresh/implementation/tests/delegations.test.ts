import { describe, expect, it } from 'vitest';
import { grantDelegation, resolveDelegate, revokeDelegation } from '@/governance/delegations';

const NOW = '2026-01-01T00:00:00Z';
const LATER = '2027-01-01T00:00:00Z';

describe('delegations (vote-for-me with limits)', () => {
  it('follows chains up to 3 hops, then stops', () => {
    let book = grantDelegation([], 'a', 'b', 'treasury', LATER);
    book = grantDelegation(book, 'b', 'c', 'treasury', LATER);
    book = grantDelegation(book, 'c', 'd', 'treasury', LATER);
    book = grantDelegation(book, 'd', 'e', 'treasury', LATER);
    expect(resolveDelegate(book, 'a', 'treasury', NOW)).toBe('d');
  });
  it('refuses cycles and self-delegation', () => {
    let book = grantDelegation([], 'a', 'b', 'treasury', LATER);
    book = grantDelegation(book, 'b', 'a', 'treasury', LATER);
    expect(() => resolveDelegate(book, 'a', 'treasury', NOW)).toThrow('DELEGATION_CYCLE');
    expect(() => grantDelegation([], 'a', 'a', 'treasury', LATER)).toThrow('SELF_DELEGATION');
  });
  it('revoked and expired delegations do not count', () => {
    let book = grantDelegation([], 'a', 'b', 'treasury', LATER);
    book = revokeDelegation(book, 'a', 'b', 'treasury', NOW);
    expect(resolveDelegate(book, 'a', 'treasury', NOW)).toBe('a');
    const stale = grantDelegation([], 'x', 'y', 'treasury', '2020-01-01T00:00:00Z');
    expect(resolveDelegate(stale, 'x', 'treasury', NOW)).toBe('x');
  });
});
