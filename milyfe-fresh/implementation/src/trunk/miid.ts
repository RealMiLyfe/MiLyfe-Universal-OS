// MiID service: entity lifecycle over device-first docs (Supabase mirror via outbox).
import { generateKeyPair, getDoc, putDoc } from '@/kernel';

export type EntityStatus = 'invited' | 'claimed' | 'active' | 'suspended' | 'retired';
export interface Entity { did: string; type: string; status: EntityStatus; lineage: string[]; createdAt: string }

export async function createEntity(type: string): Promise<{ entity: Entity; keys: { did: string } }> {
  const kp = await generateKeyPair();
  const entity: Entity = { did: kp.did, type, status: 'invited', lineage: [], createdAt: new Date().toISOString() };
  await putDoc('entities', kp.did, entity);
  // NOTE: private key stays in memory/vault only — callers persist via vault-encrypted backup.
  await putDoc('keys', kp.did, { stored: 'vault-only' });
  return { entity, keys: { did: kp.did } };
}

export async function getEntity(did: string): Promise<Entity | undefined> {
  return getDoc<Entity>('entities', did);
}

export async function setEntityStatus(did: string, status: EntityStatus, reason: string): Promise<Entity> {
  const e = await getEntity(did);
  if (!e) throw new Error('ENTITY_NOT_FOUND');
  const next: Entity = { ...e, status, lineage: [...e.lineage, `${status}:${reason}:${new Date().toISOString()}`] };
  await putDoc('entities', did, next);
  return next;
}
