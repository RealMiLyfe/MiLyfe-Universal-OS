// Kernel: store — Dexie (device-first) + outbox + sync transport.
// Source: MIDATA.md (offline map), TRUNK-MAPS.md §6. Supabase is the server
// half: API routes persist there; this module syncs the outbox via injectable transport.

import Dexie, { type Table } from 'dexie';
import { randomId } from './id';

export interface KVRecord {
  key: string;
  value: unknown;
}

export interface OutboxItem {
  key: string;
  op: string;
  params: unknown;
  status: 'queued' | 'sending' | 'acked' | 'failed';
  attempts: number;
  createdAt: string;
  lastError?: string;
}

export interface DocRecord {
  key: string;
  collection: string;
  id: string;
  value: unknown;
  updatedAt: string;
}

export interface EventRecord {
  id: string;
  family: string;
  name: string;
  version: string;
  at: string;
  actor: string;
  cell: string;
  entity: string;
  privacy: string;
  payload: unknown;
  sequence: number;
  receipt: string;
}

export class MiLyfeDB extends Dexie {
  kv!: Table<KVRecord, string>;
  outbox!: Table<OutboxItem, string>;
  docs!: Table<DocRecord, string>;
  events!: Table<EventRecord, string>;

  constructor(name = 'milyfe-fresh') {
    super(name);
    this.version(1).stores({
      kv: 'key',
      outbox: 'key, status',
      docs: 'key, collection',
      events: 'id, entity, family',
    });
  }
}

export const db = new MiLyfeDB();

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const row = await db.kv.get(key);
  return row?.value as T | undefined;
}

export async function kvPut(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value });
}

/** Idempotent enqueue: same key twice = one entry. */
export async function enqueue(op: string, params: unknown, key = randomId()): Promise<string> {
  const existing = await db.outbox.get(key);
  if (existing) return key;
  await db.outbox.put({
    key,
    op,
    params,
    status: 'queued',
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
  return key;
}

export async function pendingOutbox(): Promise<OutboxItem[]> {
  return db.outbox.where('status').anyOf(['queued', 'failed']).toArray();
}

export type OutboxTransport = (item: OutboxItem) => Promise<void>;

export async function syncOutbox(send: OutboxTransport): Promise<{ acked: number; failed: number }> {
  const items = await pendingOutbox();
  let acked = 0;
  let failed = 0;
  for (const item of items) {
    await db.outbox.update(item.key, { status: 'sending', attempts: item.attempts + 1 });
    try {
      await send(item);
      await db.outbox.update(item.key, { status: 'acked', lastError: undefined });
      acked++;
    } catch (err) {
      await db.outbox.update(item.key, {
        status: 'failed',
        lastError: err instanceof Error ? err.message : 'SYNC_FAILED',
      });
      failed++;
    }
  }
  return { acked, failed };
}

const docKey = (collection: string, id: string) => `${collection}:${id}`;

export async function putDoc(collection: string, id: string, value: unknown): Promise<void> {
  await db.docs.put({ key: docKey(collection, id), collection, id, value, updatedAt: new Date().toISOString() });
}

export async function getDoc<T>(collection: string, id: string): Promise<T | undefined> {
  const row = await db.docs.get(docKey(collection, id));
  return row?.value as T | undefined;
}

export async function listDocs<T>(collection: string): Promise<T[]> {
  const rows = await db.docs.where('collection').equals(collection).toArray();
  return rows.map((r) => r.value as T);
}

export async function recordEvent(e: EventRecord): Promise<void> {
  const existing = await db.events.get(e.id);
  if (existing) return; // replay-safe: same id twice = same state
  await db.events.put(e);
}

export async function getEventsSince(entity: string, fromSeq = 0): Promise<EventRecord[]> {
  const rows = await db.events.where('entity').equals(entity).toArray();
  return rows.filter((r) => r.sequence > fromSeq).sort((a, b) => a.sequence - b.sequence);
}

export async function nextSequence(entity: string): Promise<number> {
  const rows = await db.events.where('entity').equals(entity).toArray();
  return rows.reduce((m, r) => Math.max(m, r.sequence), 0) + 1;
}
