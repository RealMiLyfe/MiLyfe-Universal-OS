// MiSecurity service: quarantine + panic freeze + audit (device-first, mirrored via outbox).
import { endAllSessions } from './mipresence';
import { enqueue, getDoc, putDoc } from '@/kernel';

export interface Quarantine { id: string; target: string; reason: string; expires: string; reviewer?: string; releasedAt?: string }

export async function quarantine(target: string, reason: string, hours = 24): Promise<Quarantine> {
  const q: Quarantine = {
    id: `q:${Date.now().toString(36)}`, target, reason,
    expires: new Date(Date.now() + hours * 3600_000).toISOString(),
  };
  await putDoc('quarantines', q.id, q);
  await enqueue('misecurity.quarantine', { id: q.id, target, reason });
  return q;
}

export async function releaseQuarantine(id: string, reviewer: string): Promise<void> {
  const q = await getDoc<Quarantine>('quarantines', id);
  if (!q) throw new Error('QUARANTINE_NOT_FOUND');
  await putDoc('quarantines', id, { ...q, reviewer, releasedAt: new Date().toISOString() });
  await enqueue('misecurity.release', { id, reviewer });
}

/** Leave-now: kill sessions, hide presence, request jar freeze via outbox. One tap. */
export async function panicFreeze(entity: string): Promise<string> {
  await endAllSessions(entity);
  await putDoc('sessions', `${entity}:panic`, {
    id: `${entity}:panic`, entity, device: 'all', cell: '', state: 'emergency', updatedAt: new Date().toISOString(),
  });
  return enqueue('misecurity.panic-freeze', { entity });
}

export async function audit(event: string, detail: Record<string, unknown>): Promise<void> {
  await putDoc('audit', `${Date.now()}:${Math.random().toString(36).slice(2)}`, { event, detail, at: new Date().toISOString() });
}
