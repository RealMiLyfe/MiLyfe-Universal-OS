// MiPsyche continuity: change records, continuity log, pause/restore.
// Non-regulated foundation. Memory provenance tags enforced on every record.
// Source: MIPSYCHE.md, MIPSYCHE-CONTINUITY-CONTRACT.md.

import { getDoc, putDoc } from '@/kernel';

export type Provenance = 'direct' | 'reported' | 'inference' | 'reconstruction' | 'uncertain' | 'disputed';
export type PsycheKind = 'model' | 'memory' | 'values' | 'personality' | 'goals' | 'embodiment';

export interface PsycheChange {
  id: string;
  instance: string;
  kind: PsycheKind;
  summary: string;
  risk: string;
  continuity: string;
  decision: 'rollback' | 'branch' | 'accept';
  approval: string;
  at: string;
}

export interface MemoryRecord {
  id: string;
  instance: string;
  provenance: Provenance;
  content: string;
  correctedBy?: string;
  at: string;
}

export interface ContinuityState {
  instance: string;
  status: 'active' | 'paused' | 'retired';
  lineage: string[];
  updatedAt: string;
}

export async function recordChange(c: Omit<PsycheChange, 'at'>): Promise<PsycheChange> {
  if (!c.summary.trim() || !c.risk.trim() || !c.continuity.trim()) throw new Error('CHANGE_NEEDS_SUMMARY_RISK_CONTINUITY');
  const full: PsycheChange = { ...c, at: new Date().toISOString() };
  await putDoc('psyche-changes', c.id, full);
  return full;
}

export async function recordMemory(m: Omit<MemoryRecord, 'at'>): Promise<MemoryRecord> {
  const full: MemoryRecord = { ...m, at: new Date().toISOString() };
  await putDoc('psyche-memory', m.id, full);
  return full;
}

/** Corrections append — history is never silently rewritten. */
export async function correctMemory(id: string, correctionId: string): Promise<MemoryRecord> {
  const m = await getDoc<MemoryRecord>('psyche-memory', id);
  if (!m) throw new Error('MEMORY_NOT_FOUND');
  const next: MemoryRecord = { ...m, correctedBy: correctionId };
  await putDoc('psyche-memory', id, next);
  return next;
}

export async function setContinuity(instance: string, status: ContinuityState['status'], reason: string): Promise<ContinuityState> {
  const prev = (await getDoc<ContinuityState>('psyche-continuity', instance)) ?? { instance, status: 'active', lineage: [], updatedAt: '' };
  const next: ContinuityState = {
    instance, status,
    lineage: [...prev.lineage, `${status}:${reason}:${new Date().toISOString()}`],
    updatedAt: new Date().toISOString(),
  };
  await putDoc('psyche-continuity', instance, next);
  return next;
}

export async function getContinuity(instance: string): Promise<ContinuityState | undefined> {
  return getDoc<ContinuityState>('psyche-continuity', instance);
}
