// MiName service: human-readable names. Names change; stable IDs never do.
import { getDoc, putDoc } from '@/kernel';

export interface NameRecord { label: string; scope: string; entity: string; status: 'active' | 'disputed' | 'released'; history: string[] }

const RESERVED = ['mi', 'milyfe', 'admin', 'support', 'bank', 'police', 'court'];

export async function claimName(label: string, scope: string, entity: string): Promise<NameRecord> {
  const clean = label.trim().toLowerCase();
  if (clean.length < 2 || clean.length > 40) throw new Error('NAME_LENGTH');
  if (!/^[a-z0-9._-]+$/.test(clean)) throw new Error('NAME_CHARS');
  if (RESERVED.includes(clean)) throw new Error('NAME_RESERVED');
  const key = `${scope}:${clean}`;
  const existing = await getDoc<NameRecord>('names', key);
  if (existing && existing.status === 'active') throw new Error('NAME_TAKEN');
  const rec: NameRecord = { label: clean, scope, entity, status: 'active', history: [`claimed:${entity}:${new Date().toISOString()}`] };
  await putDoc('names', key, rec);
  return rec;
}

export async function lookupName(label: string, scope: string): Promise<NameRecord | undefined> {
  return getDoc<NameRecord>('names', `${scope}:${label.trim().toLowerCase()}`);
}
