// MiPresence service: sessions + honest visibility states (device-first).
import { getDoc, putDoc } from '@/kernel';

export type PresenceState = 'available' | 'busy' | 'hidden' | 'offline' | 'emergency';
export interface Session { id: string; entity: string; device: string; cell: string; state: PresenceState; updatedAt: string }

export async function setPresence(entity: string, device: string, cell: string, state: PresenceState): Promise<Session> {
  const id = `${entity}:${device}`;
  const s: Session = { id, entity, device, cell, state, updatedAt: new Date().toISOString() };
  await putDoc('sessions', id, s);
  return s;
}

export async function getPresence(entity: string, device: string): Promise<Session | undefined> {
  return getDoc<Session>('sessions', `${entity}:${device}`);
}

export async function endAllSessions(entity: string): Promise<void> {
  // Tombstone sessions for panic-freeze / leave-now. Device list tracked per entity.
  const devices = (await getDoc<string[]>('entity-devices', entity)) ?? [];
  for (const d of devices) {
    await putDoc('sessions', `${entity}:${d}`, {
      id: `${entity}:${d}`, entity, device: d, cell: '', state: 'offline', updatedAt: new Date().toISOString(),
    } satisfies Session);
  }
}

export async function registerDevice(entity: string, device: string): Promise<void> {
  const devices = (await getDoc<string[]>('entity-devices', entity)) ?? [];
  if (!devices.includes(device)) await putDoc('entity-devices', entity, [...devices, device]);
}
