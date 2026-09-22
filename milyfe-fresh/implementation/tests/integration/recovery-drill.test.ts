import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  __resetBusForTests, db, enqueue, getDoc, listDocs, putDoc, syncOutbox,
} from '@/kernel';
import { createEntity, setEntityStatus } from '@/trunk/miid';
import { createSpace } from '@/trunk/midata';
import { saveProgress } from '@/trunk/mionboard';
import { endAllSessions, getPresence, registerDevice as registerPresenceDevice, setPresence } from '@/trunk/mipresence';
import { getContinuity, setContinuity } from '@/trunk/mipsyche';
import { panicFreeze, quarantine } from '@/trunk/misecurity';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('recovery drill (backup → wipe → restore → verify)', () => {
  it('all device docs survive a wipe via backup/restore with lineage intact', async () => {
    const { entity } = await createEntity('member');
    await setEntityStatus(entity.did, 'active', 'drill');
    await createSpace(entity.did, 'health');
    await saveProgress('flow-9', 'person', 'welcome', { name: 'Jo' });
    await setContinuity('psy-9', 'paused', 'drill');
    await enqueue('money.settle', { ref: 'o9' }, 'drill-q9');

    const backupDocs = await db.docs.toArray();
    const backupOutbox = await db.outbox.toArray();
    expect(backupDocs.length).toBeGreaterThan(3);

    await db.docs.clear();
    await db.outbox.clear();
    expect(await getDoc('entities', entity.did)).toBeUndefined();

    for (const d of backupDocs) await putDoc(d.collection, d.id, d.value);
    for (const o of backupOutbox) await db.outbox.put(o);

    expect((await getDoc<{ status: string }>('entities', entity.did))?.status).toBe('active');
    expect(await getContinuity('psy-9')).toMatchObject({ status: 'paused' });
    expect((await listDocs('spaces')).length).toBeGreaterThanOrEqual(1);
    const res = await syncOutbox(async () => {});
    expect(res).toEqual({ acked: 2, failed: 0 }); // drill op + trunk space-created op
  });
  it('incident freeze leaves sessions tombstoned offline, entity quarantined', async () => {
    const { entity } = await createEntity('member');
    await setPresence(entity.did, 'phone-1', 'cell-a', 'available');
    await registerPresenceDevice(entity.did, 'phone-1');
    const q = await quarantine(entity.did, 'stolen-phone drill', 24);
    expect(q.releasedAt).toBeUndefined();
    await panicFreeze(entity.did);
    await endAllSessions(entity.did);
    expect((await getPresence(entity.did, 'phone-1'))?.state).toBe('offline');
  });
});
