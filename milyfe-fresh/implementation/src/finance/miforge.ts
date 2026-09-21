// MiForge: founding-cohort engine helpers. Pure logic (tested) + thin API callers.
// Cohorts: 200 Pro + 1,000 Daily founding members; welcome credits are explicit
// budgeted treasury ops (locked until sign-off), never mint-on-signup.

export type CohortKind = 'pro' | 'daily';
export type MemberStatus = 'invited' | 'onboarding' | 'stuck' | 'active' | 'welcomed' | 'exited';

export interface CohortMember {
  id: string;
  cohort: string;
  kind: CohortKind;
  entity: string;
  status: MemberStatus;
  step: string;
  lastActiveAt: string;
  nudges: number;
}

export const FOUNDING_TARGETS: Record<CohortKind, number> = { pro: 200, daily: 1000 };
export const STUCK_AFTER_HOURS = 48;
export const MAX_NUDGES = 3;

/** Stuck detection: onboarding with no activity beyond the window, or max nudges with no progress. */
export function detectStuck(m: CohortMember, nowIso?: string): boolean {
  if (m.status !== 'onboarding' && m.status !== 'stuck') return false;
  const now = new Date(nowIso ?? new Date().toISOString()).getTime();
  const idleHours = (now - new Date(m.lastActiveAt).getTime()) / 3_600_000;
  return idleHours > STUCK_AFTER_HOURS || m.nudges >= MAX_NUDGES;
}

export function cohortCounts(members: CohortMember[]): Record<MemberStatus, number> {
  const counts: Record<MemberStatus, number> = {
    invited: 0, onboarding: 0, stuck: 0, active: 0, welcomed: 0, exited: 0,
  };
  for (const m of members) counts[m.status]++;
  return counts;
}

/** Welcome budget guard: never exceed the human-approved per-cohort budget. */
export function welcomeWithinBudget(alreadyCreditedMinor: string, nextMinor: string, budgetMinor: string): boolean {
  try {
    return BigInt(alreadyCreditedMinor) + BigInt(nextMinor) <= BigInt(budgetMinor) && BigInt(nextMinor) > 0n;
  } catch {
    return false;
  }
}
