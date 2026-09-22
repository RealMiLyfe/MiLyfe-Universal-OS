import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  __resetBusForTests, db, generateKeyPair, getDoc, publish, replay, subscribe,
} from '@/kernel';
import { issueReceipt } from '@/kernel/receipt';
import { checkAccess, createSpace, revokeGrant, saveGrant } from '@/trunk/midata';
import { registerDevice, revokeDevice } from '@/trunk/midevice';
import { completeOnboarding, flowSteps, loadProgress, saveProgress } from '@/trunk/mionboard';
import { createEntity, getEntity, setEntityStatus } from '@/trunk/miid';
import { endAllSessions, getPresence, registerDevice as registerPresenceDevice, setPresence } from '@/trunk/mipresence';
import { correctMemory, getContinuity, recordChange, recordMemory, setContinuity } from '@/trunk/mipsyche';
import { audit, panicFreeze, quarantine, releaseQuarantine } from '@/trunk/misecurity';
import { getReceipt, saveReceipt, verifySavedReceipt } from '@/trunk/receipts';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('trunk integration (identity → onboard → data → presence → psyche → security → receipts)', () => {
  it('MiID lifecycle runs invited → claimed → active → suspended → retired with lineage', async () => {
    const { entity } = await createEntity('member');
    expect(entity.status).toBe('invited');
    for (const s of ['claimed', 'active', 'suspended', 'retired'] as const) {
      await setEntityStatus(entity.did, s, `drill-${s}`);
    }
    const end = await getEntity(entity.did);
    expect(end?.status).toBe('retired');
    expect(end?.lineage).toHaveLength(4);
    await expect(setEntityStatus('did:milyfe:ghost', 'active', 'x')).rejects.toThrow('ENTITY_NOT_FOUND');
  });
  it('onboarding progress saves, loads, and completes', async () => {
    expect(flowSteps('person').length).toBeGreaterThan(0);
    await saveProgress('flow-1', 'person', 'welcome', { name: 'Jo' });
    expect((await loadProgress('flow-1'))?.state).toEqual({ name: 'Jo' });
    const done = await completeOnboarding('flow-1', 'did:milyfe:member1');
    expect(typeof done).toBe('string');
  });
  it('data spaces isolate owners; grants revoke to epoch', async () => {
    const a = await createSpace('did:milyfe:alice', 'health');
    const b = await createSpace('did:milyfe:bob2', 'health');
    expect(a.policy).toBe('owner-only');
    expect(a.id).not.toBe(b.id);
    const grant = {
      id: crypto.randomUUID(), issuer: 'did:milyfe:alice', subject: 'did:milyfe:clinic',
      target: a.id, purpose: 'care', scope: ['slice-read'], expires: '2027-01-01T00:00:00Z', approval: 'alice-ok',
    };
    await saveGrant(grant);
    expect((await checkAccess([grant], { subject: grant.subject, target: a.id, action: 'slice-read', purpose: 'care', now: '2026-01-01T00:00:00Z' })).ok).toBe(true);
    await revokeGrant(grant.id);
    const dead = await getDoc<typeof grant>('grants', grant.id);
    expect(dead?.expires).toBe(new Date(0).toISOString());
    expect((await checkAccess([dead!], { subject: grant.subject, target: a.id, action: 'slice-read', purpose: 'care', now: '2026-01-01T00:00:00Z' })).ok).toBe(false);
  });
  it('presence tracks sessions; device revoke ends them', async () => {
    const reg0 = registerDevice({ devices: [] }, 'did:milyfe:alice', 'phone-1', 'phone', '2026-01-01T00:00:00Z');
    await setPresence('did:milyfe:alice', 'phone-1', 'cell-a', 'available');
    await registerPresenceDevice('did:milyfe:alice', 'phone-1');
    expect((await getPresence('did:milyfe:alice', 'phone-1'))?.state).toBe('available');
    const reg1 = revokeDevice(reg0, 'did:milyfe:alice', 'phone-1', '2026-02-01T00:00:00Z');
    expect(reg1.devices[0].revokedAt).toBeDefined();
    await endAllSessions('did:milyfe:alice');
    expect((await getPresence('did:milyfe:alice', 'phone-1'))?.state).toBe('offline');
  });
  it('psyche records change + memory, corrects, and tracks continuity', async () => {
    const change = await recordChange({ id: 'chg-1', instance: 'i1', kind: 'memory', summary: 'met Jo', risk: 'low', continuity: 'kept', decision: 'accept', approval: 'human-1' });
    expect(change.at).toBeDefined();
    const mem = await recordMemory({ id: 'mem-1', instance: 'i1', provenance: 'reported', content: 'Jo likes tea' });
    const fixed = await correctMemory(mem.id, 'mem-fix-1');
    expect(fixed.id).toBe(mem.id);
    await setContinuity('i1', 'paused', 'drill');
    expect((await getContinuity('i1'))?.status).toBe('paused');
  });
  it('security quarantines with review, freezes panic, audits', async () => {
    const q = await quarantine('did:milyfe:suspect', 'farming signals', 24);
    expect(q.releasedAt).toBeUndefined();
    await releaseQuarantine(q.id, 'did:milyfe:reviewer');
    await audit('drill', { ok: true });
    expect(typeof (await panicFreeze('did:milyfe:alice'))).toBe('string');
  });
  it('receipts save and verify; tampering fails', async () => {
    const kp = await generateKeyPair();
    const r = await issueReceipt({
      actor: kp.did, branch: 'trunk', os: 'MiID', purpose: 'drill', capability: 'id.verify',
      approval: { by: kp.did, role: 'member', scope: 'self', reason: 'drill' },
      impact: {}, status: 'executed', correction: { path: 'support', route: 'support.open' }, explains: 'Identity verified for the drill.',
    }, kp.privateKey);
    await saveReceipt(r);
    expect(await verifySavedReceipt(r.id)).toBe(true);
    expect((await getReceipt(r.id))?.id).toBe(r.id);
    await saveReceipt({ ...r, purpose: 'forged' });
    expect(await verifySavedReceipt(r.id)).toBe(false);
  });
  it('bus publishes, delivers, and replays for idempotent consumers', async () => {
    const seen = new Set<string>();
    let deliveries = 0;
    subscribe('cell.*', (e) => {
      deliveries++;
      seen.add(e.id); // idempotent consumer dedupes by id
    });
    const first = await publish({
      family: 'cell', name: 'joined', actor: 'did:milyfe:alice', cell: 'cell-a', entity: 'alice',
      privacy: 'place', payload: { hello: 'world' }, receipt: 'r1',
    });
    expect(first.sequence).toBeGreaterThanOrEqual(1);
    const replayed = await replay('alice', 0);
    expect(replayed).toBeGreaterThanOrEqual(1);
    expect(seen.size).toBe(1); // one unique event despite re-delivery
    expect(deliveries).toBeGreaterThanOrEqual(2);
  });
});
