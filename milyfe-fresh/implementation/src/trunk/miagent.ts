// MiAgent permissions: skill registry, leases, chorus cap, forbidden scopes.
// Non-regulated foundation. Leases are purpose-bound + expiring; forbidden scopes
// can never be leased. Source: MIAGENT.md, AGENT-SKILL-CONTRACT.md.

import { getDoc, putDoc } from '@/kernel';

export type SkillRisk = 'ordinary' | 'high-risk' | 'regulated' | 'financial';
export interface Skill { id: string; version: string; owner: string; risk: SkillRisk; capabilities: string[]; tools: string[] }
export interface Lease { id: string; agent: string; skill: string; goal: string; scope: string[]; expires: string; receipt: string }

export const FORBIDDEN_LEASE_SCOPES = [
  'money.move-alone', 'money.pot-spend-alone', 'child.gate-change', 'compact.change',
  'identity.create-without-human', 'kill-switch', 'actuation.ungated',
] as const;

export const CHORUS_CAP_PCT = 5;

export async function registerSkill(s: Skill): Promise<void> {
  if (s.capabilities.some((c) => (FORBIDDEN_LEASE_SCOPES as readonly string[]).includes(c))) {
    throw new Error('SKILL_FORBIDDEN_SCOPE');
  }
  await putDoc('skills', `${s.id}@${s.version}`, s);
}

export async function getSkill(id: string, version: string): Promise<Skill | undefined> {
  return getDoc<Skill>('skills', `${id}@${version}`);
}

export async function issueLease(l: Omit<Lease, 'receipt'> & { receipt: string }): Promise<Lease> {
  if (l.scope.some((s) => (FORBIDDEN_LEASE_SCOPES as readonly string[]).includes(s))) throw new Error('LEASE_FORBIDDEN_SCOPE');
  if (new Date(l.expires).getTime() <= Date.now()) throw new Error('LEASE_MUST_EXPIRE_IN_FUTURE');
  if (!l.goal.trim()) throw new Error('LEASE_NEEDS_GOAL');
  await putDoc('leases', l.id, l);
  return l as Lease;
}

export async function revokeLease(id: string): Promise<void> {
  const l = await getDoc<Lease>('leases', id);
  if (!l) throw new Error('LEASE_NOT_FOUND');
  await putDoc('leases', id, { ...l, expires: new Date(0).toISOString() });
}

export async function leaseValid(id: string, nowIso?: string): Promise<boolean> {
  const l = await getDoc<Lease>('leases', id);
  if (!l) return false;
  return new Date(l.expires).getTime() > new Date(nowIso ?? new Date().toISOString()).getTime();
}

/** Chorus cap: helpers must stay at or under 5% of decision weight. Pure check. */
export function chorusCapOk(helperWeight: number, totalWeight: number): boolean {
  if (totalWeight <= 0) return helperWeight <= 0;
  return (helperWeight / totalWeight) * 100 <= CHORUS_CAP_PCT;
}
