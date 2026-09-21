import { describe, expect, it } from 'vitest';
import { createMind, grantScope, readWithConsent, setFields } from '@/trunk/mimind';

describe('mimind (one profile, consent reads)', () => {
  it('writes are owner-only', () => {
    const m = createMind('alice');
    expect(() => setFields(m, 'mallory', { city: 'X' })).toThrow('NOT_OWNER');
    expect(setFields(m, 'alice', { city: 'X' }).fields.city).toBe('X');
  });
  it('readers see only granted, unexpired fields', () => {
    let m = setFields(createMind('alice'), 'alice', { city: 'X', health: 'Y' });
    m = grantScope(m, { reader: 'mihealth', fields: ['health'], expiresAt: '2030-01-01T00:00:00Z' });
    m = grantScope(m, { reader: 'mimarket', fields: ['city'], expiresAt: '2020-01-01T00:00:00Z' });
    expect(readWithConsent(m, 'mihealth', '2026-01-01T00:00:00Z')).toEqual({ health: 'Y' });
    expect(readWithConsent(m, 'mimarket', '2026-01-01T00:00:00Z')).toEqual({});
  });
});
