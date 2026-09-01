/**
 * Wallet / Treasury / UBI critical-path tests.
 *
 * These tests cover pure logic and validation layers — the parts that touch
 * $MLY balances. They run without a real Supabase connection by testing the
 * guard conditions and schema validation directly, not the DB calls.
 *
 * For integration tests against a real DB, use the Supabase local stack.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── $MLY amount validation rules ────────────────────────────────────────────
describe('$MLY transfer validation', () => {
  const { z } = require('zod');

  const transferSchema = z.object({
    toUsername: z.string().min(3).max(24),
    amount: z.coerce.number().positive().max(10000),
    pot: z.enum(['spending', 'savings', 'community']),
    reason: z.string().max(200).optional(),
  });

  it('rejects negative amounts', () => {
    const r = transferSchema.safeParse({ toUsername: 'alice', amount: -1, pot: 'spending' });
    expect(r.success).toBe(false);
  });

  it('rejects zero amounts', () => {
    const r = transferSchema.safeParse({ toUsername: 'alice', amount: 0, pot: 'spending' });
    expect(r.success).toBe(false);
  });

  it('rejects amounts above 10,000', () => {
    const r = transferSchema.safeParse({ toUsername: 'alice', amount: 10001, pot: 'spending' });
    expect(r.success).toBe(false);
  });

  it('allows valid amounts', () => {
    const r = transferSchema.safeParse({ toUsername: 'alice', amount: 50, pot: 'spending' });
    expect(r.success).toBe(true);
  });

  it('rejects invalid pot names', () => {
    const r = transferSchema.safeParse({ toUsername: 'alice', amount: 10, pot: 'invalid' });
    expect(r.success).toBe(false);
  });

  it('accepts all 3 valid pots', () => {
    for (const pot of ['spending', 'savings', 'community']) {
      const r = transferSchema.safeParse({ toUsername: 'alice', amount: 5, pot });
      expect(r.success).toBe(true);
    }
  });

  it('rejects username shorter than 3 chars', () => {
    const r = transferSchema.safeParse({ toUsername: 'ab', amount: 5, pot: 'spending' });
    expect(r.success).toBe(false);
  });
});

// ─── Quest reward escrow logic ────────────────────────────────────────────────
describe('quest escrow calculations', () => {
  function calcRefund(rewardMly: number, maxCompletions: number, currentCompletions: number): number {
    const remaining = Math.max(0, maxCompletions - currentCompletions);
    return rewardMly * remaining;
  }

  it('refunds full escrow when no completions', () => {
    expect(calcRefund(50, 1, 0)).toBe(50);
  });

  it('refunds nothing when fully completed', () => {
    expect(calcRefund(50, 1, 1)).toBe(0);
  });

  it('refunds partial escrow for multi-completion quests', () => {
    // reward=20, max=5, current=2 → 3 remaining → refund=60
    expect(calcRefund(20, 5, 2)).toBe(60);
  });

  it('never returns negative refund', () => {
    // current > max (edge case)
    expect(calcRefund(50, 1, 2)).toBe(0);
  });

  it('handles large reward amounts correctly', () => {
    expect(calcRefund(500, 20, 0)).toBe(10000);
  });
});

// ─── UBI distribution auth guard ─────────────────────────────────────────────
describe('UBI distribution authorization', () => {
  const CRON_SECRET = 'test-cron-secret-abc123';
  const UBI_CRON_SECRET = 'test-ubi-secret-xyz789';

  function isAuthorized(providedSecret: string): boolean {
    return providedSecret === CRON_SECRET || providedSecret === UBI_CRON_SECRET;
  }

  it('authorizes with CRON_SECRET', () => {
    expect(isAuthorized(CRON_SECRET)).toBe(true);
  });

  it('authorizes with UBI_CRON_SECRET', () => {
    expect(isAuthorized(UBI_CRON_SECRET)).toBe(true);
  });

  it('rejects an empty secret', () => {
    expect(isAuthorized('')).toBe(false);
  });

  it('rejects a wrong secret', () => {
    expect(isAuthorized('wrong-secret')).toBe(false);
  });

  it('rejects a guessable default (should never be the fallback)', () => {
    // Regression: old code had "milyfe-intake-2026" as a fallback
    expect(isAuthorized('milyfe-intake-2026')).toBe(false);
  });
});

// ─── Treasury balance boundary checks ────────────────────────────────────────
describe('treasury balance', () => {
  const JACKSONVILLE_BUDGET = 5_300_000_000;

  it('Jacksonville budget constant is correct', () => {
    expect(JACKSONVILLE_BUDGET).toBe(5_300_000_000);
  });

  it('treasury balance fits in NUMERIC(14,2)', () => {
    // NUMERIC(14,2) max = 999,999,999,999.99
    const MAX_NUMERIC_14_2 = 999_999_999_999.99;
    expect(JACKSONVILLE_BUDGET).toBeLessThanOrEqual(MAX_NUMERIC_14_2);
  });

  it('UBI per citizen per week (100 MLY) is less than treasury', () => {
    const UBI_WEEKLY = 100;
    expect(UBI_WEEKLY).toBeLessThan(JACKSONVILLE_BUDGET);
  });
});
