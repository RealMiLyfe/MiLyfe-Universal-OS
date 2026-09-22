// MiCare — care coordination: plans, relationships, respite, check-ins,
// supported decisions, escalations. Never clinical care: no diagnosis,
// no prescriptions, and no agent ever approves a care decision alone.
import type { Grant } from '@/kernel/scope';
import {
  assertCaller, assertGrant, assertHumanFor, assertOwnerConsent, emitOrQueue, notice,
  receiptFor, type Caller, type HumanApproval, type Notice,
} from './shared';

// ---------- Care plans (receiver consent required, human approval to activate) ----------
export type PlanState = 'draft' | 'active' | 'paused' | 'ended';

export interface CarePlan {
  id: string;
  receiver: string;
  helpers: { did: string; role: string; suspended?: boolean }[];
  needs: string[];
  schedule: string;
  respiteWindows: string[];
  state: PlanState;
  consentRef: string;
  approvedBy?: HumanApproval;
}

export function draftPlan(
  grants: Grant[], caller: Caller, id: string, receiver: string, needs: string[], schedule: string, nowIso: string,
): CarePlan {
  assertCaller(caller);
  const consentRef = assertOwnerConsent(grants, receiver, caller.did, 'care:plan', 'plan-draft', nowIso);
  assertGrant(grants, { subject: caller.did, target: 'care:plan', action: 'plan-draft', purpose: 'care', now: nowIso });
  return { id, receiver, helpers: [], needs, schedule, respiteWindows: [], state: 'draft', consentRef };
}

export function approvePlan(plan: CarePlan, caller: Caller, approval: HumanApproval): CarePlan {
  assertHumanFor(caller, 'care.plan-approve');
  if (plan.state !== 'draft') throw new Error('PLAN_NOT_DRAFT');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  return { ...plan, state: 'active', approvedBy: approval };
}

export function addHelper(plan: CarePlan, grants: Grant[], caller: Caller, helper: string, role: string, nowIso: string): CarePlan {
  assertCaller(caller);
  assertOwnerConsent(grants, plan.receiver, caller.did, 'care:plan', 'helper-add', nowIso);
  if (plan.helpers.some((h) => h.did === helper && !h.suspended)) throw new Error('HELPER_ALREADY_ON_PLAN');
  return { ...plan, helpers: [...plan.helpers, { did: helper, role }] };
}

/** Abuse path: suspend now, human review next, resolve/justice notified by bus. */
export async function suspendHelper(
  plan: CarePlan, caller: Caller, approval: HumanApproval, helper: string, reason: string, cell: string, online: boolean,
) {
  assertHumanFor(caller, 'care.helper-suspend');
  if (!plan.helpers.some((h) => h.did === helper && !h.suspended)) throw new Error('HELPER_NOT_FOUND');
  const next: CarePlan = {
    ...plan, helpers: plan.helpers.map((h) => (h.did === helper ? { ...h, suspended: true } : h)),
  };
  const receipt = receiptFor('MiCare', {
    actor: caller.did, purpose: `Suspend helper ${helper} from plan ${plan.id}`, capability: 'care.helper-suspend',
    approval: { by: approval.by, role: 'human-reviewer', scope: 'care-safety', reason: approval.reason },
    impact: { other: 'helper suspended pending review' }, status: 'executed',
    correction: { path: 'MiResolve service-failure case', route: 'resolve.appeal-requested' },
    explains: 'A helper was removed from a care plan after a safety report. A human reviews what happened next.',
  });
  const bus = await emitOrQueue({
    family: 'care', name: 'helper-suspended', actor: caller, cell, entity: plan.id,
    privacy: 'sealed', payload: { ref: plan.id, kind: 'helper-suspended', reason: reason.slice(0, 140) },
    receipt: 'see-receipt', online,
  });
  return { plan: next, receipt, bus };
}

// ---------- Supported decisions (assent + supporter + scope; human countersign) ----------
export interface SupportedDecision {
  id: string;
  person: string;
  supporter: string;
  scope: string;
  assent: 'yes';
  countersign: HumanApproval;
  at: string;
}

export function recordSupportedDecision(
  id: string, caller: Caller, person: string, supporter: string, scope: string, countersign: HumanApproval, nowIso: string,
): SupportedDecision {
  assertHumanFor(caller, 'care.decide-alone');
  if (!countersign.by || !countersign.reason) throw new Error('APPROVAL_INCOMPLETE');
  return { id, person, supporter, scope, assent: 'yes', countersign, at: nowIso };
}

// ---------- Respite (hours trade, never money) ----------
export type BookingState = 'booked' | 'done' | 'no-show' | 'rebooked';

export interface RespiteBooking {
  id: string;
  plan: string;
  helper: string;
  window: string;
  hours: number;
  state: BookingState;
}

export function bookRespite(id: string, caller: Caller, plan: CarePlan, helper: string, window: string, hours: number): RespiteBooking {
  assertCaller(caller);
  if (plan.state !== 'active') throw new Error('PLAN_NOT_ACTIVE');
  if (!plan.helpers.some((h) => h.did === helper && !h.suspended)) throw new Error('HELPER_NOT_ON_PLAN');
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24) throw new Error('BAD_HOURS');
  return { id, plan: plan.id, helper, window, hours, state: 'booked' };
}

export function markBooking(b: RespiteBooking, to: BookingState): RespiteBooking {
  const ok: Record<BookingState, BookingState[]> = { booked: ['done', 'no-show'], done: [], 'no-show': ['rebooked'], rebooked: ['done', 'no-show'] };
  if (!ok[b.state].includes(to)) throw new Error('BAD_BOOKING_MOVE');
  return { ...b, state: to };
}

// ---------- Check-ins (theirs to set; queue honestly offline) ----------
export interface CheckIn {
  id: string;
  plan: string;
  by: string;
  at: string;
  queued: boolean;
}

export async function checkIn(id: string, caller: Caller, plan: CarePlan, cell: string, nowIso: string, online: boolean): Promise<CheckIn> {
  assertCaller(caller);
  const bus = await emitOrQueue({
    family: 'care', name: 'check-in', actor: caller, cell, entity: plan.id, privacy: 'private',
    payload: { ref: plan.id, kind: 'check-in', at: nowIso }, receipt: 'see-receipt', online,
  });
  return { id, plan: plan.id, by: caller.did, at: nowIso, queued: bus.mode === 'queued-offline' };
}

// ---------- Safety escalation (anyone can raise; only humans close) ----------
export type EscalationState = 'raised' | 'human-review' | 'resolved';

export interface Escalation {
  id: string;
  plan: string;
  reason: string;
  severity: 'watch' | 'urgent' | 'emergency';
  state: EscalationState;
  notice: Notice;
}

export function raiseEscalation(id: string, caller: Caller, plan: CarePlan, reason: string, severity: Escalation['severity']): Escalation {
  assertCaller(caller);
  return {
    id, plan: plan.id, reason, severity, state: severity === 'emergency' ? 'human-review' : 'raised',
    notice: notice('Safety report received', 'Someone raised a safety concern on this care plan. A human coordinator is being looped in now.', 'Call your care coordinator or place keeper.'),
  };
}

export function closeEscalation(e: Escalation, caller: Caller, approval: HumanApproval): Escalation {
  assertHumanFor(caller, 'safety.escalate-close');
  if (e.state === 'resolved') throw new Error('ALREADY_RESOLVED');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  return { ...e, state: 'resolved' };
}

// ---------- Support, appeal, export, deletion ----------
export interface SupportTicket {
  id: string;
  plan: string;
  issue: string;
  state: 'open' | 'matched' | 'closed';
}

export function openSupportTicket(id: string, caller: Caller, plan: CarePlan, issue: string): SupportTicket {
  assertCaller(caller);
  return { id, plan: plan.id, issue, state: 'open' };
}

export async function appealToResolve(caller: Caller, plan: CarePlan, cell: string, online: boolean) {
  assertCaller(caller);
  // Contract bus handoff to MiResolve — no cross-branch source import.
  return emitOrQueue({
    family: 'resolve', name: 'appeal-requested', actor: caller, cell, entity: plan.id,
    privacy: 'private', payload: { ref: plan.id, kind: 'care-appeal' }, receipt: 'see-receipt', online,
  });
}

export function exportCareHistory(plan: CarePlan, bookings: RespiteBooking[], escalations: Escalation[]): CarePlan & { bookings: RespiteBooking[]; escalations: Escalation[] } {
  return JSON.parse(JSON.stringify({ ...plan, bookings, escalations })) as CarePlan & { bookings: RespiteBooking[]; escalations: Escalation[] };
}

export function requestDeletion(caller: Caller, plan: CarePlan, isYouth: boolean, guardianApproval?: HumanApproval) {
  assertCaller(caller);
  if (isYouth && !guardianApproval?.by) throw new Error('YOUTH_NEEDS_GUARDIAN');
  return receiptFor('MiCare', {
    actor: caller.did, purpose: `Delete care history for plan ${plan.id}`, capability: 'care.history-delete',
    approval: { by: guardianApproval?.by ?? caller.did, role: isYouth ? 'guardian' : 'member', scope: 'care-history', reason: 'deletion requested' },
    impact: { data: 'care history queued for deletion per retention rules' }, status: 'approved',
    correction: { path: 'Deletion can be cancelled before the retention window ends', route: 'care.deletion-cancel' },
    explains: 'Your care history is queued for deletion. It is kept only as long as the rules require, then removed.',
  });
}
