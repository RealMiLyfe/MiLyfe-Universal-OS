import { describe, expect, it } from 'vitest';
import { can, canDelegate, type Grant } from '@/kernel/scope';

const base: Grant = {
  id: 'g1', issuer: 'did:milyfe:issuer', subject: 'did:milyfe:alice', target: 'space:household',
  purpose: 'care-plan', scope: ['read', 'write'], expires: new Date(Date.now() + 3600_000).toISOString(), approval: 'r1',
};

describe('kernel scope (MiScope)', () => {
  it('grants matching requests', () => {
    const v = can([base], { subject: 'did:milyfe:alice', target: 'space:household', action: 'read', purpose: 'care-plan' });
    expect(v.ok).toBe(true);
  });
  it('denies wrong action, purpose, subject, target', () => {
    expect(can([base], { subject: 'did:milyfe:alice', target: 'space:household', action: 'delete', purpose: 'care-plan' }).ok).toBe(false);
    expect(can([base], { subject: 'did:milyfe:alice', target: 'space:household', action: 'read', purpose: 'marketing' }).ok).toBe(false);
    expect(can([base], { subject: 'did:milyfe:bob', target: 'space:household', action: 'read', purpose: 'care-plan' }).ok).toBe(false);
    expect(can([base], { subject: 'did:milyfe:alice', target: 'space:other', action: 'read', purpose: 'care-plan' }).ok).toBe(false);
  });
  it('denies expired grants (fail-closed)', () => {
    const expired = { ...base, expires: new Date(0).toISOString() };
    expect(can([expired], { subject: 'did:milyfe:alice', target: 'space:household', action: 'read', purpose: 'care-plan' }).ok).toBe(false);
  });
  it('requires youth assent + guardian permission for child roles', () => {
    const child = { ...base, roles: ['child'] };
    expect(can([child], { subject: 'did:milyfe:alice', target: 'space:household', action: 'read', purpose: 'care-plan' }).ok).toBe(false);
    const okChild = { ...child, youthAssent: true, guardianPermission: 'r-guardian' };
    expect(can([okChild], { subject: 'did:milyfe:alice', target: 'space:household', action: 'read', purpose: 'care-plan' }).ok).toBe(true);
  });
  it('emergency grants need emergency context', () => {
    const em = { ...base, emergency: true };
    expect(can([em], { subject: 'did:milyfe:alice', target: 'space:household', action: 'read', purpose: 'care-plan' }).ok).toBe(false);
    expect(can([em], { subject: 'did:milyfe:alice', target: 'space:household', action: 'read', purpose: 'care-plan', emergency: true }).ok).toBe(true);
  });
  it('delegation capped at 3 hops', () => {
    expect(canDelegate({ ...base, hopsLeft: 0 }, 1).ok).toBe(false);
    expect(canDelegate({ ...base, hopsLeft: 3 }, 4).ok).toBe(false);
    expect(canDelegate({ ...base, hopsLeft: 2 }, 1).ok).toBe(true);
  });
});
