import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, generateKeyPair } from '@/kernel';
import { issueReceipt } from '@/kernel/receipt';
import { BusinessOnboardParams, GrantCreateParams, GrantRevokeParams } from '@/contracts';
import { getReceipt, saveReceipt, verifySavedReceipt } from '@/trunk/receipts';

beforeEach(async () => {
  await db.docs.clear();
});

describe('business onboarding params', () => {
  it('accepts a valid shop, rejects thin names', async () => {
    const kp = await generateKeyPair();
    const good = BusinessOnboardParams.safeParse({
      entity: kp.did, shopName: 'Corner Bakery', place: 'first-street', owner: kp.did,
    });
    expect(good.success).toBe(true);
    expect(BusinessOnboardParams.safeParse({
      entity: kp.did, shopName: 'x', place: 'p', owner: kp.did,
    }).success).toBe(false);
  });
});

describe('grant create/revoke params', () => {
  it('validates grant shapes', async () => {
    const kp = await generateKeyPair();
    const good = GrantCreateParams.safeParse({
      issuer: kp.did, subject: kp.did, target: 'space:household', purpose: 'care-plan',
      scope: ['read'], expires: new Date(Date.now() + 3600_000).toISOString(),
    });
    expect(good.success).toBe(true);
    expect(GrantCreateParams.safeParse({ issuer: kp.did }).success).toBe(false);
    expect(GrantRevokeParams.safeParse({ id: '123e4567-e89b-12d3-a456-426614174000', reason: 'no longer needed' }).success).toBe(true);
  });
});

describe('receipt keeper', () => {
  it('saves and verifies receipts on-device', async () => {
    const kp = await generateKeyPair();
    const r = await issueReceipt({
      actor: kp.did, branch: 'trunk', os: 'MiOnboard', purpose: 'joined',
      capability: 'mionboard.complete',
      approval: { by: kp.did, role: 'member', scope: 'person', reason: 'joined' },
      impact: { data: kp.did }, status: 'executed',
      correction: { path: 'leave anytime', route: '/you' },
      explains: 'You joined.',
    }, kp.privateKey);
    await saveReceipt(r);
    expect(await getReceipt(r.id)).toMatchObject({ purpose: 'joined' });
    expect(await verifySavedReceipt(r.id)).toBe(true);
    expect(await verifySavedReceipt('missing')).toBe(false);
  });
});
