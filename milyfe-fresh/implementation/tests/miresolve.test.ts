import { describe, expect, it } from 'vitest';
import { exportCaseFile, moveCase, openCase, orderRemedy } from '@/governance/miresolve';

const NOW = '2026-01-01T00:00:00Z';

describe('miresolve (fix-it rooms with guard rails)', () => {
  it('cases run notice → hearing → decision → remedy → close', () => {
    let c = openCase('case-1', 'marketplace', 'buyer', 'shop', 'never arrived', NOW);
    expect(c.retaliationGuard).toBe(true);
    c = moveCase(c, 'notice-sent', 'seller notified', NOW);
    c = moveCase(c, 'hearing', 'panel seated', NOW);
    c = moveCase(c, 'decided', 'refund owed', NOW);
    c = orderRemedy(c, 'refund', '250 MLY to buyer', NOW);
    expect(c.state).toBe('remedy');
    expect(c.remedy).toEqual({ kind: 'refund', detail: '250 MLY to buyer' });
    c = moveCase(c, 'closed', 'refund posted', NOW);
    expect(c.state).toBe('closed');
  });
  it('skips rejected; appeal reopens hearing; export works mid-case', () => {
    let c = openCase('case-2', 'ban-appeal', 'member', 'mods', 'wrong ban', NOW);
    expect(() => moveCase(c, 'decided', 'skip', NOW)).toThrow();
    expect(() => orderRemedy(c, 'amends', 'sorry', NOW)).toThrow('REMEDY_NEEDS_DECISION');
    c = moveCase(c, 'notice-sent', 'n', NOW);
    const mid = exportCaseFile(c);
    expect(mid.id).toBe('case-2');
    expect(mid.history.length).toBeGreaterThan(0);
    c = moveCase(c, 'hearing', 'h', NOW);
    c = moveCase(c, 'decided', 'd', NOW);
    c = moveCase(c, 'appealed', 'new evidence', NOW);
    c = moveCase(c, 'hearing', 'rehearing', NOW);
    expect(c.state).toBe('hearing');
  });
});
