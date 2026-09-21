import { describe, expect, it } from 'vitest';
import { LOCKED_FLAGS, SERVICE_STATUS, lockStatus } from '@/trunk/miscale';

describe('miscale (public lock board)', () => {
  it('all ten locks start locked with named unlock homework', () => {
    expect(LOCKED_FLAGS).toHaveLength(10);
    for (const f of LOCKED_FLAGS) {
      expect(f.locked).toBe(true);
      expect(f.unlockNeeds.length).toBeGreaterThan(0);
    }
  });
  it('lock lookup rejects unknown ids', () => {
    expect(lockStatus('L1').name).toBe('XLM deposits');
    expect(() => lockStatus('L99' as never)).toThrow('UNKNOWN_LOCK');
  });
  it('trunk services report status', () => {
    expect(SERVICE_STATUS).toEqual({ identity: 'on', ledger: 'on', receipts: 'on', messaging: 'on' });
  });
});
