// MiPlace — local life: resources, surplus, quests, rides, shops, projects.
// Neighbors coordinating, never a replacement for government, utilities,
// emergency authorities, courts, or licensed providers. Every provider says so.
import {
  assertCaller, assertHumanFor, emitOrQueue, notice, receiptFor,
  type Caller, type HumanApproval, type Notice,
} from './shared';

export const NOT_GOVERNMENT = 'Neighbors helping neighbors. Not a government, utility, court, or emergency authority.';
export const EMERGENCY_LABEL = 'For real emergencies call your local emergency number. This listing is information only.';

// ---------- Places (child policy can only be standard or stricter) ----------
export interface Place {
  id: string;
  name: string;
  charter: string;
  childPolicy: 'standard' | 'strict';
  languages: string[];
}

export function createPlace(id: string, caller: Caller, name: string, charter: string, childPolicy: string, languages: string[]): Place {
  assertCaller(caller);
  if (childPolicy !== 'standard' && childPolicy !== 'strict') throw new Error('CHILD_POLICY_TOO_WEAK');
  return { id, name, charter, childPolicy, languages };
}

// ---------- Resources (freshness enforced: stale is labeled, then hidden) ----------
export type ResourceState = 'listed' | 'stale-labeled' | 'delisted';

export interface Resource {
  id: string;
  place: string;
  kind: 'shelter' | 'food' | 'legal-aid' | 'clinic' | 'other';
  name: string;
  contact: string;
  freshAsOf: string;
  state: ResourceState;
  honesty: typeof NOT_GOVERNMENT;
}

export function addResource(
  id: string, caller: Caller, place: string, kind: Resource['kind'], name: string, contact: string, nowIso: string,
): Resource {
  assertCaller(caller);
  return { id, place, kind, name, contact, freshAsOf: nowIso, state: 'listed', honesty: NOT_GOVERNMENT };
}

/** Stale past maxDays gets labeled; past double gets delisted with reason. */
export function sweepStale(resources: Resource[], nowIso: string, maxDays = 90): { resources: Resource[]; delisted: { id: string; reason: string }[] } {
  const delisted: { id: string; reason: string }[] = [];
  const next = resources.map((r) => {
    const age = (Date.parse(nowIso) - Date.parse(r.freshAsOf)) / 86_400_000;
    if (age > maxDays * 2 && r.state !== 'delisted') {
      delisted.push({ id: r.id, reason: 'stale too long, delisted until re-verified' });
      return { ...r, state: 'delisted' as const };
    }
    if (age > maxDays && r.state === 'listed') return { ...r, state: 'stale-labeled' as const };
    return r;
  });
  return { resources: next, delisted };
}

// ---------- Surplus, quests, rides ----------
export type PinState = 'open' | 'claimed' | 'expired';

export interface SurplusPin {
  id: string;
  place: string;
  what: string;
  qty: string;
  pickupBy: string;
  state: PinState;
}

export function postSurplus(id: string, caller: Caller, place: string, what: string, qty: string, pickupBy: string): SurplusPin {
  assertCaller(caller);
  return { id, place, what, qty, pickupBy, state: 'open' };
}

export async function claimSurplus(pin: SurplusPin, caller: Caller, cell: string, online: boolean) {
  assertCaller(caller);
  if (pin.state !== 'open') throw new Error('PIN_NOT_OPEN');
  const bus = await emitOrQueue({
    family: 'place', name: 'surplus-claimed', actor: caller, cell, entity: pin.id,
    privacy: 'place', payload: { ref: pin.id, kind: 'surplus-claimed' }, receipt: 'see-receipt', online,
  });
  return { pin: { ...pin, state: 'claimed' as const }, bus };
}

export interface Quest {
  id: string;
  place: string;
  task: string;
  state: 'posted' | 'taken' | 'done' | 'reposted';
}

export function postQuest(id: string, caller: Caller, place: string, task: string): Quest {
  assertCaller(caller);
  return { id, place, task, state: 'posted' };
}

export function moveQuest(q: Quest, to: Quest['state']): Quest {
  const ok: Record<Quest['state'], Quest['state'][]> = { posted: ['taken'], taken: ['done', 'reposted'], done: [], reposted: ['taken'] };
  if (!ok[q.state].includes(to)) throw new Error('BAD_QUEST_MOVE');
  return { ...q, state: to };
}

export interface Ride {
  id: string;
  place: string;
  driver: string;
  to: string;
  at: string;
  seats: number;
  riders: string[];
}

export function offerRide(id: string, caller: Caller, place: string, to: string, at: string, seats: number): Ride {
  assertCaller(caller);
  if (!Number.isInteger(seats) || seats < 1 || seats > 8) throw new Error('BAD_SEATS');
  return { id, place, driver: caller.did, to, at, seats, riders: [] };
}

export function joinRide(ride: Ride, caller: Caller): Ride {
  assertCaller(caller);
  if (ride.riders.includes(caller.did)) throw new Error('ALREADY_RIDING');
  if (ride.riders.length >= ride.seats) throw new Error('RIDE_FULL');
  return { ...ride, riders: [...ride.riders, caller.did] };
}

// ---------- Shops (complaints answered within 7 days or it shows) ----------
export const COMPLAINT_SLA_DAYS = 7;

export interface ShopComplaint {
  id: string;
  shop: string;
  from: string;
  text: string;
  filedAt: string;
  dueAt: string;
  answeredAt?: string;
  standingNote?: string;
}

export function fileComplaint(id: string, caller: Caller, shop: string, text: string, nowIso: string): ShopComplaint {
  assertCaller(caller);
  const due = new Date(Date.parse(nowIso) + COMPLAINT_SLA_DAYS * 86_400_000).toISOString();
  return { id, shop, from: caller.did, text, filedAt: nowIso, dueAt: due };
}

export function answerComplaint(c: ShopComplaint, nowIso: string): ShopComplaint {
  if (c.answeredAt) throw new Error('ALREADY_ANSWERED');
  const late = nowIso > c.dueAt;
  return { ...c, answeredAt: nowIso, ...(late ? { standingNote: 'does not answer on time' } : {}) };
}

// ---------- Projects (milestones + freezable treasury) ----------
export interface Project {
  id: string;
  place: string;
  name: string;
  milestones: { name: string; done: boolean }[];
  treasuryMinor: string;
  frozen: boolean;
}

export function startProject(id: string, caller: Caller, place: string, name: string, milestones: string[]): Project {
  assertCaller(caller);
  return { id, place, name, milestones: milestones.map((m) => ({ name: m, done: false })), treasuryMinor: '0', frozen: false };
}

export function completeMilestone(p: Project, name: string): Project {
  return { ...p, milestones: p.milestones.map((m) => (m.name === name ? { ...m, done: true } : m)) };
}

export function freezeTreasury(p: Project, caller: Caller, approval: HumanApproval, reason: string) {
  assertHumanFor(caller, 'place.treasury-freeze');
  if (p.frozen) throw new Error('ALREADY_FROZEN');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  const receipt = receiptFor('MiPlace', {
    actor: caller.did, purpose: `Freeze project treasury ${p.id}`, capability: 'place.treasury-freeze',
    approval: { by: approval.by, role: 'human-reviewer', scope: 'project-treasury', reason: approval.reason },
    impact: { value: `${p.treasuryMinor} frozen pending gov review` }, status: 'executed',
    correction: { path: 'Governance review unfreezes or redirects', route: 'gov.treasury-review' },
    explains: `Project money is frozen because: ${reason}. Elected reviewers decide what happens next.`,
  });
  return { project: { ...p, frozen: true }, receipt };
}

// ---------- Emergency resources (information + real-authority handoff, never replacement) ----------
export interface EmergencyResource {
  id: string;
  place: string;
  kind: string;
  instructions: string;
  label: typeof EMERGENCY_LABEL;
}

export function addEmergencyResource(id: string, caller: Caller, place: string, kind: string, instructions: string): EmergencyResource {
  assertCaller(caller);
  return { id, place, kind, instructions, label: EMERGENCY_LABEL };
}

// ---------- Announcements (scoped, plain) ----------
export interface Announcement {
  id: string;
  place: string;
  scope: 'place' | 'circle';
  notice: Notice;
}

export function postAnnouncement(id: string, caller: Caller, place: string, scope: 'place' | 'circle', title: string, text: string): Announcement {
  assertCaller(caller);
  return { id, place, scope, notice: notice(title, text, 'Ask your place keeper or greeter.') };
}

export function exportPlaceHistory(place: Place, resources: Resource[], quests: Quest[], projects: Project[]) {
  return JSON.parse(JSON.stringify({ place, resources, quests, projects })) as { place: Place; resources: Resource[]; quests: Quest[]; projects: Project[] };
}
