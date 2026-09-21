// MiData service: data spaces + purpose-bound grants (device-first, mirrored via outbox).
import { can, enqueue, getDoc, putDoc, type Check, type Grant } from '@/kernel';

export interface DataSpace { id: string; owner: string; kind: string; policy: string; createdAt: string }

export async function createSpace(owner: string, kind: string): Promise<DataSpace> {
  const id = `space:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
  const s: DataSpace = { id, owner, kind, policy: 'owner-only', createdAt: new Date().toISOString() };
  await putDoc('spaces', id, s);
  await enqueue('midata.space-created', { id, owner, kind });
  return s;
}

export async function saveGrant(g: Grant): Promise<void> {
  await putDoc('grants', g.id, g);
  await enqueue('midata.grant', { id: g.id });
}

export async function revokeGrant(id: string): Promise<void> {
  const g = await getDoc<Grant>('grants', id);
  if (!g) throw new Error('GRANT_NOT_FOUND');
  await putDoc('grants', id, { ...g, expires: new Date(0).toISOString() });
  await enqueue('midata.revoke', { id });
}

export async function checkAccess(grants: Grant[], check: Check) {
  return can(grants, check);
}
