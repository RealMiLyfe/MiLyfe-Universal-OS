// MiWork — real work, verified skills, honest pay. Recruitment alone is never
// earned work; rewards need verified contribution + delivery evidence. Work
// relationships are stated explicitly — never silently classified — with the
// outside-review boundary kept visible.
import type { ValueState } from '@/contracts';
import { activeDevices, type DeviceRegistry } from '@/trunk/midevice';
import { allowedTransition } from './mimoney';
import {
  assertCaller, assertHumanFor, assertMlyWording, emitOrQueue, notice,
  type Caller, type HumanApproval, type Notice,
} from './shared';

// ---------- Opportunities (jobs, gigs, apprenticeships, service) ----------
export type OpportunityKind = 'job' | 'gig' | 'apprenticeship' | 'service';

export interface Opportunity {
  id: string;
  poster: string;
  kind: OpportunityKind;
  title: string;
  payMinor: string;
  skills: string[];
  state: 'open' | 'filled' | 'closed';
}

export function postOpportunity(
  id: string, caller: Caller, kind: OpportunityKind, title: string, payMinor: string, skills: string[],
): Opportunity {
  assertCaller(caller);
  if (BigInt(payMinor) < 0n) throw new Error('BAD_PAY');
  assertMlyWording(title);
  return { id, poster: caller.did, kind, title, payMinor, skills, state: 'open' };
}

export function closeOpportunity(o: Opportunity, caller: Caller, filled: boolean): Opportunity {
  assertCaller(caller);
  if (caller.did !== o.poster) throw new Error('NOT_OWNER');
  if (o.state !== 'open') throw new Error('NOT_OPEN');
  return { ...o, state: filled ? 'filled' : 'closed' };
}

/** Credential → opportunity matching. References only — no education import. */
export function matchCredential(opportunity: Opportunity, credentialRef: string, issuerRef: string, skills: string[]): { match: boolean; missing: string[] } {
  if (!credentialRef || !issuerRef) throw new Error('CREDENTIAL_REF_REQUIRED');
  const have = new Set(skills);
  const missing = opportunity.skills.filter((s) => !have.has(s));
  return { match: missing.length === 0, missing };
}

// ---------- Work agreements (relationship stated, never assumed) ----------
export type WorkRelationship = 'employee' | 'contractor' | 'volunteer' | 'partner' | 'co-op' | 'unclassified-pending-review';

export const EXTERNAL_REVIEW_NOTE = 'Work, tax, and labor rules differ by place. This record states what both sides agreed — it is not a legal verdict. Outside review may apply.';

export interface WorkAgreement {
  id: string;
  opportunity: string;
  worker: string;
  poster: string;
  relationship: WorkRelationship;
  payMinor: string;
  schedule: string;
  safety: string;
  youth: boolean;
  guardianApproval?: HumanApproval;
  signatures: string[];
  reviewNote: typeof EXTERNAL_REVIEW_NOTE;
  state: 'draft' | 'signed' | 'ended' | 'breached';
}

const YOUTH_ALLOWED: OpportunityKind[] = ['apprenticeship'];

export function draftAgreement(
  id: string, caller: Caller, o: Opportunity, worker: string, relationship: WorkRelationship,
  schedule: string, safety: string, youth: boolean, kind: OpportunityKind, guardianApproval?: HumanApproval,
): WorkAgreement {
  assertCaller(caller);
  if (!relationship) throw new Error('RELATIONSHIP_REQUIRED');
  if (youth) {
    if (!YOUTH_ALLOWED.includes(kind)) throw new Error('YOUTH_WORK_BLOCKED');
    if (!guardianApproval?.by) throw new Error('YOUTH_NEEDS_GUARDIAN');
  }
  return {
    id, opportunity: o.id, worker, poster: o.poster, relationship, payMinor: o.payMinor,
    schedule, safety, youth, guardianApproval, signatures: [], reviewNote: EXTERNAL_REVIEW_NOTE, state: 'draft',
  };
}

export function signAgreement(a: WorkAgreement, caller: Caller): WorkAgreement {
  assertCaller(caller);
  if (caller.did !== a.worker && caller.did !== a.poster) throw new Error('NOT_A_PARTY');
  if (a.state !== 'draft') throw new Error('NOT_DRAFT');
  const signatures = [...new Set([...a.signatures, caller.did])];
  const both = signatures.includes(a.worker) && signatures.includes(a.poster);
  return { ...a, signatures, state: both ? 'signed' : 'draft' };
}

/** Wage/exploitation smell check. Flags + routes — never a legal verdict. */
export function flagTerms(a: WorkAgreement, normPayMinor: string): { flags: string[]; route: string } {
  const flags: string[] = [];
  if (BigInt(a.payMinor) < BigInt(normPayMinor)) flags.push('below-norm pay');
  if (!a.safety || a.safety.length < 8) flags.push('weak safety terms');
  if (a.relationship === 'unclassified-pending-review') flags.push('relationship unclassified — review before starting');
  return { flags, route: 'labor clinic + human job coach' };
}

// ---------- Contributions + work records (verified, device-attested) ----------
export type ContributionKind = 'delivery' | 'hours' | 'craft' | 'care' | 'referral' | 'recruit';

export interface Contribution {
  id: string;
  worker: string;
  agreement: string;
  kind: ContributionKind;
  detail: string;
  hoursMinor: string;
  device: string;
  state: 'logged' | 'verified' | 'rejected';
}

export function logContribution(
  id: string, caller: Caller, registry: DeviceRegistry, agreement: WorkAgreement, kind: ContributionKind, detail: string, hoursMinor: string, deviceId: string,
): Contribution {
  assertCaller(caller);
  if (caller.did !== agreement.worker) throw new Error('NOT_WORKER');
  if (agreement.state !== 'signed') throw new Error('AGREEMENT_NOT_SIGNED');
  if (!activeDevices(registry, caller.did).some((d) => d.id === deviceId)) throw new Error('UNVERIFIED_DEVICE');
  if (BigInt(hoursMinor) < 0n) throw new Error('BAD_HOURS');
  return { id, worker: caller.did, agreement: agreement.id, kind, detail, hoursMinor, device: deviceId, state: 'logged' };
}

export function verifyContribution(c: Contribution, caller: Caller, approval: HumanApproval): Contribution {
  assertCaller(caller);
  if (caller.kind !== 'human') throw new Error('VERIFY_NEEDS_HUMAN');
  if (c.state !== 'logged') throw new Error('NOT_LOGGABLE');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  return { ...c, state: 'verified' };
}

// ---------- Payout claims (verified work + approved rules + human) ----------
export interface PayoutClaim {
  id: string;
  contribution: string;
  worker: string;
  amountMinor: string;
  state: ValueState;
  evidenceRef: string;
}

export function claimPayout(id: string, caller: Caller, c: Contribution, amountMinor: string, evidenceRef: string): PayoutClaim {
  assertCaller(caller);
  if (caller.did !== c.worker) throw new Error('NOT_WORKER');
  if (c.state !== 'verified') throw new Error('WORK_NOT_VERIFIED');
  if (c.kind === 'referral' || c.kind === 'recruit') throw new Error('RECRUITMENT_NOT_WORK');
  if (!evidenceRef) throw new Error('NO_EVIDENCE_NO_REWARD');
  if (BigInt(amountMinor) <= 0n) throw new Error('AMOUNT_MUST_BE_POSITIVE');
  return { id, contribution: c.id, worker: c.worker, amountMinor, state: 'pending', evidenceRef };
}

export function moveClaim(p: PayoutClaim, to: ValueState, caller: Caller): PayoutClaim {
  if (['settled', 'rewarded', 'reinvested', 'allocated', 'reversed'].includes(to)) {
    assertHumanFor(caller, 'work.payout-approve');
  } else {
    assertCaller(caller);
  }
  if (!allowedTransition(p.state, to)) throw new Error(`ILLEGAL_CLAIM_MOVE_${p.state.toUpperCase()}_TO_${to.toUpperCase()}`);
  return { ...p, state: to };
}

/** Care support → work/money credit. Reference only — no care import. */
export function careContributionToClaim(
  id: string, caller: Caller, careRef: string, worker: string, amountMinor: string, approval: HumanApproval,
): PayoutClaim {
  assertHumanFor(caller, 'work.reward-approve');
  if (!careRef) throw new Error('CARE_REF_REQUIRED');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  return { id, contribution: careRef, worker, amountMinor, state: 'pending', evidenceRef: careRef };
}

// ---------- Disputes, support, export, closure ----------
export interface WorkDispute {
  id: string;
  agreement: string;
  by: string;
  text: string;
  state: 'open' | 'escalated' | 'resolved';
}

export function openWorkDispute(id: string, caller: Caller, agreement: WorkAgreement, text: string): WorkDispute {
  assertCaller(caller);
  return { id, agreement: agreement.id, by: caller.did, text, state: 'open' };
}

export async function escalateWorkDispute(d: WorkDispute, caller: Caller, cell: string, online: boolean) {
  assertCaller(caller);
  const bus = await emitOrQueue({
    family: 'resolve', name: 'dispute-opened', actor: caller, cell, entity: d.agreement,
    privacy: 'private', payload: { ref: d.agreement, kind: 'work-dispute' }, receipt: 'see-receipt', online,
  });
  return { dispute: { ...d, state: 'escalated' as const }, bus };
}

export interface WorkerSupport {
  id: string;
  worker: string;
  issue: string;
  notice: Notice;
}

export function workerHelp(id: string, caller: Caller, issue: string): WorkerSupport {
  assertCaller(caller);
  return {
    id, worker: caller.did, issue,
    notice: notice('Help is on the way', 'A human job coach will look at your case. Unpaid verified work goes on the fast path.', 'Visit the worker desk in your street.'),
  };
}

export function endAgreement(a: WorkAgreement, caller: Caller, breached: boolean): WorkAgreement {
  assertCaller(caller);
  if (caller.did !== a.worker && caller.did !== a.poster) throw new Error('NOT_A_PARTY');
  if (a.state !== 'signed') throw new Error('NOT_SIGNED');
  return { ...a, state: breached ? 'breached' : 'ended' };
}

export function exportWorkHistory(agreements: WorkAgreement[], contributions: Contribution[], claims: PayoutClaim[]) {
  return JSON.parse(JSON.stringify({ agreements, contributions, claims })) as {
    agreements: WorkAgreement[]; contributions: Contribution[]; claims: PayoutClaim[];
  };
}
