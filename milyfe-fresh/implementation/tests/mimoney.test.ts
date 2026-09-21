import { describe, expect, it } from 'vitest';
import { applyCredit, applyDebit, breakerTrips, canDebit, runwayMonths, splitIssuance, supermajorityNeeded, totalBalance, zeroBalances } from '@/finance/mimoney';

describe('MiMoney ledger math', () => {
  it('no-negative: cannot debit below zero, zero/negative amounts rejected', () => {
    expect(canDebit('10', '10')).toBe(true);
    expect(canDebit('10', '11')).toBe(false);
    expect(canDebit('0', '1')).toBe(false);
    expect(canDebit('10', '0')).toBe(false);
    expect(() => applyDebit('5', '6')).toThrow();
    expect(applyDebit('5', '5')).toBe('0');
  });
  it('credits must be positive', () => {
    expect(applyCredit('5', '5')).toBe('10');
    expect(() => applyCredit('5', '0')).toThrow();
  });
  it('issuance splits 70/30 place/commons by default', () => {
    expect(splitIssuance('1000')).toEqual({ place: '700', commons: '300' });
    expect(splitIssuance('100')).toEqual({ place: '70', commons: '30' });
  });
  it('circuit breaker trips above 34% of treasury', () => {
    expect(breakerTrips('34', '100')).toBe(false);
    expect(breakerTrips('35', '100')).toBe(true);
    expect(breakerTrips('1', '0')).toBe(true);
  });
  it('supermajority = 80%', () => {
    expect(supermajorityNeeded(80, 100)).toBe(true);
    expect(supermajorityNeeded(79, 100)).toBe(false);
  });
  it('runway gauge speaks plainly', () => {
    expect(runwayMonths('1200', '100')).toContain('12 months');
    expect(runwayMonths('0', '100')).toContain('0 months');
    expect(runwayMonths('500', '0')).toContain('holds');
  });
  it('balances total honestly', () => {
    expect(totalBalance({ ...zeroBalances(), spending: '3', community: '7' })).toBe('10');
  });
});
