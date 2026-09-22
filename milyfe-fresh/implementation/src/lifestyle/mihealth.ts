// MiHealth — health boundary: permissions, slices, routing, aggregates.
// AI never diagnoses, treats, or prescribes. Clinical acts need a licensed
// professional plus human review; without both, MiHealth refuses and routes.
import type { Grant } from '@/kernel/scope';
import {
  assertCaller, assertGrant, assertHumanFor, grantConsent, openConsentBook, readConsented, receiptFor,
  revokeConsent, type Caller, type ConsentBook, type HumanApproval,
} from './shared';

// ---------- Slice permissions (per-slice, expiring, instantly revocable) ----------
export function openHealthConsent(owner: string): ConsentBook {
  return openConsentBook(owner);
}

export function grantSlice(book: ConsentBook, owner: string, reader: string, slices: string[], expiresAt: string): ConsentBook {
  return grantConsent(book, owner, reader, slices, expiresAt);
}

export function revokeSlice(book: ConsentBook, owner: string, reader: string, slices?: string[]): ConsentBook {
  return revokeConsent(book, owner, reader, slices);
}

export interface AccessEntry {
  at: string;
  reader: string;
  slices: string[];
  grantRef: string;
}

export interface SliceRead {
  slices: Record<string, string>;
  access: AccessEntry;
}

/** Read only the granted, unexpired slices. Every read is logged. */
export function readSlices(
  book: ConsentBook, reader: string, records: Record<string, string>, grantRef: string, nowIso: string,
): SliceRead {
  const slices = readConsented(book, reader, records, nowIso);
  return { slices, access: { at: nowIso, reader, slices: Object.keys(slices), grantRef } };
}

/** Youth reads: kernel enforces assent + guardian permission for child-role grants. */
export function readYouthSlices(grants: Grant[], caller: Caller, youth: string, nowIso: string): string {
  assertCaller(caller);
  return assertGrant(grants, { subject: caller.did, target: `health:record:${youth}`, action: 'slice-read', purpose: 'care', now: nowIso });
}

// ---------- Clinical boundary (refuse by default, route to professionals) ----------
export type ClinicalAction = 'diagnose' | 'treat' | 'prescribe';

export interface ClinicalAuthority {
  license: string;
  reviewerHuman: string;
  reviewedAt: string;
}

export function requestClinical(caller: Caller, action: ClinicalAction, authority?: ClinicalAuthority) {
  assertHumanFor(caller, `health.${action}`);
  if (!authority?.license || !authority?.reviewerHuman || !authority?.reviewedAt) {
    throw new Error(`NO_CLINICAL_AUTHORITY_${action.toUpperCase()}`);
  }
  // MiHealth never performs the act — it routes to the licensed professional.
  return { routed: true as const, to: authority.license, reviewedBy: authority.reviewerHuman, action };
}

// ---------- Integrations (consent in, confirmed unlink out) ----------
export interface ClinicalLink {
  id: string;
  member: string;
  clinic: string;
  slices: string[];
  state: 'linked' | 'unlinked';
  consentRef: string;
}

export function connectIntegration(
  id: string, caller: Caller, member: string, clinic: string, slices: string[], consentRef: string,
) {
  assertCaller(caller);
  if (caller.did !== member) throw new Error('NOT_OWNER');
  const link: ClinicalLink = { id, member, clinic, slices, state: 'linked', consentRef };
  const receipt = receiptFor('MiHealth', {
    actor: caller.did, purpose: `Link clinic ${clinic} to health record`, capability: 'health.integrate',
    approval: { by: member, role: 'member', scope: slices.join(','), reason: 'member consented' },
    impact: { data: `clinic sees: ${slices.join(', ')}` }, status: 'executed',
    correction: { path: 'Unlink any time; the clinic keeps nothing new', route: 'health.unlink' },
    explains: `Your clinic can now see ${slices.join(', ')}. You can unlink any time.`,
  });
  return { link, receipt };
}

export function unlinkIntegration(link: ClinicalLink, caller: Caller, nowIso: string) {
  assertCaller(caller);
  if (caller.did !== link.member) throw new Error('NOT_OWNER');
  if (link.state === 'unlinked') throw new Error('ALREADY_UNLINKED');
  return {
    link: { ...link, state: 'unlinked' as const },
    confirmedAt: nowIso,
    note: 'Unlinked. The clinic keeps nothing new from this point on.',
  };
}

// ---------- Public-health aggregates (groups only, never individuals) ----------
export const MIN_GROUP = 10;

export function reportAggregate(rows: Record<string, string>[], buckets: string[]) {
  if (rows.length < MIN_GROUP) throw new Error('GROUP_TOO_SMALL');
  const keep = new Set(buckets);
  const stripped = rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => keep.has(k))));
  return { count: stripped.length, buckets, rows: stripped };
}

// ---------- Professional routing + emergency card ----------
export interface HealthReferral {
  id: string;
  member: string;
  need: string;
  jurisdiction: string;
  privileged: true;
  at: string;
}

export function routeToProfessional(id: string, caller: Caller, need: string, jurisdiction: string, nowIso: string): HealthReferral {
  assertCaller(caller);
  return { id, member: caller.did, need, jurisdiction, privileged: true, at: nowIso };
}

export interface EmergencyCard {
  member: string;
  fields: Record<string, string>;
  offline: true;
}

export function setEmergencyCard(caller: Caller, fields: Record<string, string>): EmergencyCard {
  assertCaller(caller);
  return { member: caller.did, fields, offline: true };
}

export interface EmergencyAccess {
  card: EmergencyCard;
  accessor: string;
  reason: string;
  at: string;
  needsReview: true;
}

/** Emergency access is narrow, logged, and always flagged for human review. */
export function emergencyAccess(card: EmergencyCard, caller: Caller, reason: string, nowIso: string): EmergencyAccess {
  assertCaller(caller);
  if (!reason) throw new Error('REASON_REQUIRED');
  return { card, accessor: caller.did, reason, at: nowIso, needsReview: true };
}

// ---------- Export + deletion ----------
export function exportHealthRecord(records: Record<string, string>, accessLog: AccessEntry[]) {
  return JSON.parse(JSON.stringify({ records, accessLog })) as { records: Record<string, string>; accessLog: AccessEntry[] };
}

export function requestRecordDeletion(caller: Caller, member: string, approval: HumanApproval) {
  assertHumanFor(caller, 'health.record-delete');
  if (caller.did !== member) throw new Error('NOT_OWNER');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  return receiptFor('MiHealth', {
    actor: caller.did, purpose: 'Delete health record', capability: 'health.record-delete',
    approval: { by: approval.by, role: 'human-reviewer', scope: 'health-record', reason: approval.reason },
    impact: { data: 'health record queued for deletion per retention + law' }, status: 'approved',
    correction: { path: 'Deletion can be cancelled before the retention window ends', route: 'health.deletion-cancel' },
    explains: 'Your health record is queued for deletion. It is kept only as long as the law and rules require.',
  });
}
