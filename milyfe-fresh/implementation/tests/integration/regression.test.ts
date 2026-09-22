import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import { endAllSessions, getPresence, registerDevice, setPresence } from '@/trunk/mipresence';
import { assertMlyWording, recordExternalExchange, type Caller } from '@/finance/shared';
import { Ledger, openTreasuryBook } from '@/finance/mimoney';

// Permanent regression pins for bugs fixed through tests. If any of these
// fail, a fixed bug has come back — stop and fix before anything else.
const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const HUMAN: Caller = { did: tdid('member'), kind: 'human' };
const NOW = '2026-06-01T00:00:00Z';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('regression pins (fixed bugs stay fixed)', () => {
  it('R1: MLY wording is negation-aware', () => {
    // Honest disclosures pass …
    for (const ok of [
      'MLY is MLY: not USD, not pegged to anything, no promised cash-out or promised value.',
      'never represented as USD or guaranteed redemption',
      'MiLyfe promises no automatic redemption and no fixed rate',
    ]) {
      expect(() => assertMlyWording(ok)).not.toThrow();
    }
    // … misleading claims fail.
    for (const bad of ['1 MLY equals 1 USD', 'MLY is backed by USD', 'guaranteed cash-out', 'MLY is USD']) {
      expect(() => assertMlyWording(bad)).toThrow(/^MLY_MISREPRESENTATION_/);
    }
    // … and labeled external swaps record with all seven labels.
    const { record } = recordExternalExchange('x1', HUMAN, '250', '20', 'USD', 'neighbor', NOW);
    expect(record.notLedgerAuthoritative).toBe(true);
  });
  it('R2: ended sessions tombstone to offline (never vanish, never stay live)', async () => {
    await setPresence('did:milyfe:a', 'phone-1', 'cell-a', 'available');
    await registerDevice('did:milyfe:a', 'phone-1');
    await endAllSessions('did:milyfe:a');
    const s = await getPresence('did:milyfe:a', 'phone-1');
    expect(s).toBeDefined();
    expect(s?.state).toBe('offline');
  });
  it('R3: refunds work on disputed originals (the normal dispute case)', async () => {
    const ledger = new Ledger();
    const bob = tdid('bob');
    await ledger.mint(HUMAN.did, '100', HUMAN, { by: HUMAN.did, at: NOW, reason: 'r' }, 'b', NOW);
    ledger.post(HUMAN, { key: 'p1', from: HUMAN.did, to: bob, amountMinor: '40' }, NOW);
    await ledger.settle('p1', HUMAN, { by: HUMAN.did, at: NOW, reason: 'r' }, NOW);
    ledger.dispute('p1', HUMAN, 'broken item', NOW);
    const refund = await ledger.refund('r1', 'p1', HUMAN, { by: HUMAN.did, at: NOW, reason: 'case-1' }, NOW);
    expect(refund.state).toBe('settled');
    expect(ledger.reconcile().ok).toBe(true);
  });
  it('R4: treasury books default to NO provisional breaker', () => {
    expect(openTreasuryBook('1000').breakerPct).toBeNull();
  });
});
