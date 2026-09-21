import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db, enqueue, getEventsSince, pendingOutbox, publish, putDoc, getDoc, replay, subscribe, syncOutbox } from '@/kernel';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('kernel store (Dexie + outbox + sync)', () => {
  it('enqueue is idempotent by key', async () => {
    const k = await enqueue('money.transfer', { a: 1 }, 'fixed-key-1');
    const k2 = await enqueue('money.transfer', { a: 999 }, 'fixed-key-1');
    expect(k).toBe(k2);
    expect(await db.outbox.get('fixed-key-1')).toMatchObject({ op: 'money.transfer' });
  });
  it('syncOutbox acks successes and marks failures honestly', async () => {
    await enqueue('op.ok', {}, 'k-ok');
    await enqueue('op.bad', {}, 'k-bad');
    const res = await syncOutbox(async (item) => {
      if (item.key === 'k-bad') throw new Error('NET_DOWN');
    });
    expect(res).toEqual({ acked: 1, failed: 1 });
    expect((await db.outbox.get('k-ok'))?.status).toBe('acked');
    expect((await db.outbox.get('k-bad'))?.status).toBe('failed');
    expect((await pendingOutbox()).map((i) => i.key)).toContain('k-bad');
  });
  it('docs roundtrip', async () => {
    await putDoc('entities', 'e1', { did: 'e1' });
    expect(await getDoc('entities', 'e1')).toEqual({ did: 'e1' });
  });
});

describe('kernel bus (publish/subscribe/replay)', () => {
  it('dispatches to matching subscribers (exact + family.* + *)', async () => {
    const got: string[] = [];
    subscribe('money.credited', () => { got.push('exact'); });
    subscribe('money.*', () => { got.push('family'); });
    subscribe('*', () => { got.push('all'); });
    await publish({ family: 'money', name: 'credited', actor: 'did:milyfe:a', cell: 'c', entity: 'e1', privacy: 'private', payload: {}, receipt: 'r1' });
    expect(got.sort()).toEqual(['all', 'exact', 'family']);
  });
  it('publish is idempotent by event id; sequences order per entity', async () => {
    const e1 = await publish({ id: 'evt-1', family: 'money', name: 'credited', actor: 'a', cell: 'c', entity: 'e2', privacy: 'private', payload: {}, receipt: 'r' });
    const e2 = await publish({ id: 'evt-1', family: 'money', name: 'credited', actor: 'a', cell: 'c', entity: 'e2', privacy: 'private', payload: {}, receipt: 'r' });
    expect(e1.id).toBe(e2.id);
    expect(await getEventsSince('e2')).toHaveLength(1);
    await publish({ family: 'money', name: 'debited', actor: 'a', cell: 'c', entity: 'e2', privacy: 'private', payload: {}, receipt: 'r' });
    const rows = await getEventsSince('e2');
    expect(rows.map((r) => r.sequence)).toEqual([1, 2]);
  });
  it('replays entity history in order', async () => {
    await publish({ family: 't', name: 'a', actor: 'a', cell: 'c', entity: 'e3', privacy: 'private', payload: { n: 1 }, receipt: 'r' });
    await publish({ family: 't', name: 'b', actor: 'a', cell: 'c', entity: 'e3', privacy: 'private', payload: { n: 2 }, receipt: 'r' });
    const names: string[] = [];
    subscribe('t.*', (e) => { names.push(e.name); });
    const count = await replay('e3');
    expect(count).toBe(2);
    expect(names).toEqual(['a', 'b']);
  });
});
