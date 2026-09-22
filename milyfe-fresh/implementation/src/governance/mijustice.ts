// MiJustice — shield, not sword. Rights knowledge, witnesses, paper,
// lawyers, neighbors. Supports people inside and returning; claims no
// authority over incarceration itself.

export interface RightsCase {
  id: string;
  holder: string; // rights-holder
  against: 'person' | 'police' | 'courts' | 'agency' | 'milyfe';
  summary: string;
  sealed: boolean;
  state: 'open' | 'supported' | 'redress' | 'closed';
  openedAt: string;
}

export function openRightsCase(
  id: string, holder: string, against: RightsCase['against'], summary: string, sealed: boolean, nowIso: string,
): RightsCase {
  return { id, holder, against, summary, sealed, state: 'open', openedAt: nowIso };
}

// ---------- Evidence: write-it-while-fresh, timestamped, custody-logged ----------
export interface EvidenceAnchor {
  id: string;
  caseId: string;
  digest: string; // hash of the captured material
  capturedAt: string;
  anchoredAt?: string; // set when timestamped (queued offline)
}

export function captureEvidence(id: string, caseId: string, digest: string, nowIso: string): EvidenceAnchor {
  return { id, caseId, digest, capturedAt: nowIso };
}

export function anchorEvidence(e: EvidenceAnchor, nowIso: string): EvidenceAnchor {
  if (e.anchoredAt) throw new Error('ALREADY_ANCHORED');
  return { ...e, anchoredAt: nowIso };
}

// ---------- Peace terms: dual consent, escrow, broken truce → community pot ----------
export interface PeaceTerm {
  id: string;
  parties: [string, string];
  escrowMinor: string; // MLY held while the truce runs
  consentedBy: string[];
  state: 'proposed' | 'holding' | 'kept' | 'broken';
  windowDays: 30;
  startedAt?: string;
}

export function proposePeace(id: string, a: string, b: string, escrowMinor: string): PeaceTerm {
  if (BigInt(escrowMinor) <= 0n) throw new Error('INVALID_ESCROW');
  return { id, parties: [a, b], escrowMinor, consentedBy: [], state: 'proposed', windowDays: 30 };
}

export function consentPeace(t: PeaceTerm, party: string, nowIso: string): PeaceTerm {
  if (t.state !== 'proposed') throw new Error('NOT_PROPOSED');
  if (!t.parties.includes(party)) throw new Error('NOT_A_PARTY');
  if (t.consentedBy.includes(party)) throw new Error('ALREADY_CONSENTED');
  const consentedBy = [...t.consentedBy, party];
  const both = t.parties.every((p) => consentedBy.includes(p));
  return { ...t, consentedBy, ...(both ? { state: 'holding' as const, startedAt: nowIso } : {}) };
}

export function settlePeace(t: PeaceTerm, kept: boolean): PeaceTerm {
  if (t.state !== 'holding') throw new Error('NOT_HOLDING');
  // Kept → escrow returns; broken → escrow goes to the community pot per terms.
  return { ...t, state: kept ? 'kept' : 'broken' };
}

// ---------- Reentry pack: day-one checklist, nothing fancy, everything needed ----------
export type ReentryItem = 'pocket-money' | 'clothes-food' | 'id-help' | 'job-board' | 'calendar';

export interface ReentryPack {
  member: string;
  done: ReentryItem[];
}

export function openReentryPack(member: string): ReentryPack {
  return { member, done: [] };
}

export function checkReentryItem(p: ReentryPack, item: ReentryItem): ReentryPack {
  if (p.done.includes(item)) throw new Error('ALREADY_DONE');
  return { ...p, done: [...p.done, item] };
}
