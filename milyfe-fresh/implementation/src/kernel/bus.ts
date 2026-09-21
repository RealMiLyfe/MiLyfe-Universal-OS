// Kernel: bus — publish / subscribe / replay. Versioned, idempotent, replay-safe.
// Source: EVENT-CONTRACTS.md, TRUNK-MAPS.md §4.

import { randomId } from './id';
import { getEventsSince, nextSequence, recordEvent, type EventRecord } from './store';

export interface PublishInput {
  id?: string;
  family: string;
  name: string;
  version?: string;
  actor: string;
  cell: string;
  entity: string;
  privacy: 'public' | 'place' | 'circle' | 'private' | 'sealed';
  payload: unknown;
  receipt: string;
}

export type Handler = (event: EventRecord) => void | Promise<void>;

const handlers = new Map<string, Set<Handler>>();
const seen = new Set<string>();

function match(pattern: string, family: string, name: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith('.*')) return family === pattern.slice(0, -2);
  return pattern === `${family}.${name}`;
}

export function subscribe(pattern: string, handler: Handler): () => void {
  let set = handlers.get(pattern);
  if (!set) {
    set = new Set();
    handlers.set(pattern, set);
  }
  set.add(handler);
  return () => {
    set.delete(handler);
  };
}

async function dispatch(e: EventRecord): Promise<void> {
  if (seen.has(e.id)) return;
  seen.add(e.id);
  for (const [pattern, set] of handlers) {
    if (match(pattern, e.family, e.name)) {
      for (const h of set) await h(e);
    }
  }
}

export async function publish(input: PublishInput): Promise<EventRecord> {
  const e: EventRecord = {
    id: input.id ?? randomId(),
    family: input.family,
    name: input.name,
    version: input.version ?? '1',
    at: new Date().toISOString(),
    actor: input.actor,
    cell: input.cell,
    entity: input.entity,
    privacy: input.privacy,
    payload: input.payload,
    sequence: await nextSequence(input.entity),
    receipt: input.receipt,
  };
  await recordEvent(e);
  await dispatch(e);
  return e;
}

/** Re-dispatch an entity's events in sequence order (recovery, new subscribers). */
export async function replay(entity: string, fromSeq = 0): Promise<number> {
  const rows = await getEventsSince(entity, fromSeq);
  seen.clear(); // replay intentionally re-delivers; consumers must stay idempotent
  for (const e of rows) await dispatch(e);
  return rows.length;
}

export function __resetBusForTests(): void {
  handlers.clear();
  seen.clear();
}
