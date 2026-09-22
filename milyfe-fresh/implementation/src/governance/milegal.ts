// MiLegal — neutral legal infrastructure. Information, jurisdiction checks,
// holds, and routing to real lawyers. Never legal advice: AI output is
// summary-only and always labeled "not a lawyer".

export interface JurisdictionProfile {
  jurisdiction: string; // e.g. 'US-FL'
  capability: string; // what is being asked
  allowed: boolean; // profile says yes or no
  ceiling: number; // max risk class permitted (lower = stricter)
  freshAsOf: string; // ISO — stale profiles fail closed
}

/** Enable only if profile-yes AND consent AND class within ceiling AND fresh.
 *  Across profiles, the strictest wins. Anything unsure → denied + routed. */
export function checkEnable(
  profiles: JurisdictionProfile[],
  capability: string,
  riskClass: number,
  consent: boolean,
  nowIso: string,
  freshnessDays = 90,
): { allowed: boolean; reason: string } {
  if (!consent) return { allowed: false, reason: 'NO_CONSENT' };
  const relevant = profiles.filter((p) => p.capability === capability);
  if (relevant.length === 0) return { allowed: false, reason: 'NO_PROFILE' };
  for (const p of relevant) {
    const ageDays = (Date.parse(nowIso) - Date.parse(p.freshAsOf)) / 86_400_000;
    if (ageDays > freshnessDays) return { allowed: false, reason: `STALE_PROFILE_${p.jurisdiction}` };
    if (!p.allowed) return { allowed: false, reason: `DENIED_BY_${p.jurisdiction}` };
    if (riskClass > p.ceiling) return { allowed: false, reason: `CEILING_${p.jurisdiction}` };
  }
  return { allowed: true, reason: 'ALL_PROFILES_ALLOW' };
}

// ---------- Legal holds (narrow, recorded, time-limited, revocable) ----------
export interface LegalHold {
  id: string;
  scope: string; // exactly what is held, nothing more
  reason: string;
  placedBy: string;
  placedAt: string;
  expiresAt: string;
  releasedAt?: string;
}

export function placeHold(holds: LegalHold[], hold: Omit<LegalHold, 'releasedAt'>): LegalHold[] {
  if (hold.expiresAt <= hold.placedAt) throw new Error('HOLD_NEEDS_END');
  return [...holds, hold];
}

export function releaseHold(holds: LegalHold[], id: string, nowIso: string): LegalHold[] {
  return holds.map((h) => (h.id === id && !h.releasedAt ? { ...h, releasedAt: nowIso } : h));
}

export function activeHolds(holds: LegalHold[], nowIso: string): LegalHold[] {
  return holds.filter((h) => !h.releasedAt && h.expiresAt > nowIso);
}

// ---------- Professional routing (to a real lawyer, privilege preserved) ----------
export interface Referral {
  id: string;
  member: string;
  need: string; // plain-language need, e.g. 'eviction notice'
  jurisdiction: string;
  privileged: true; // always sealed + access-logged
  at: string;
}

export function routeToCounsel(id: string, member: string, need: string, jurisdiction: string, nowIso: string): Referral {
  return { id, member, need, jurisdiction, privileged: true, at: nowIso };
}

/** Labels any AI summary honestly. Never presented as advice. */
export function aiSummaryLabel(text: string): string {
  return `NOT A LAWYER — information only, check with counsel:\n${text}`;
}
