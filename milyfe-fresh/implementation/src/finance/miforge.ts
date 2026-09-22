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

// ---------- Ventures (idea → offer → customers → income → books) ----------
import type { ValueState } from '@/contracts';
import { allowedTransition } from './mimoney';
import { assertCaller, assertHumanFor, assertMlyWording, type Caller, type HumanApproval } from './shared';

export type VentureStage = 'idea' | 'offer' | 'customers' | 'income' | 'paused' | 'retired';

export interface BusinessNode {
  id: string;
  venture: string;
  kind: 'shop' | 'creator' | 'service' | 'agent';
  owner: string;
  verified: boolean;
}

export interface Venture {
  id: string;
  owner: string;
  name: string;
  stage: VentureStage;
  nodes: BusinessNode[];
  history: { at: string; event: string }[];
}

export function startVenture(id: string, caller: Caller, name: string, nowIso: string): Venture {
  assertCaller(caller);
  assertMlyWording(name);
  return { id, owner: caller.did, name, stage: 'idea', nodes: [], history: [{ at: nowIso, event: 'idea started' }] };
}

const STAGE_MOVES: Record<VentureStage, VentureStage[]> = {
  idea: ['offer', 'retired'],
  offer: ['customers', 'paused', 'retired'],
  customers: ['income', 'paused', 'retired'],
  income: ['paused', 'retired'],
  paused: ['offer', 'customers', 'income', 'retired'],
  retired: [],
};

export function moveVenture(v: Venture, caller: Caller, to: VentureStage, note: string, nowIso: string): Venture {
  assertCaller(caller);
  if (caller.did !== v.owner) throw new Error('NOT_OWNER');
  if (!STAGE_MOVES[v.stage].includes(to)) throw new Error('BAD_VENTURE_MOVE');
  return { ...v, stage: to, history: [...v.history, { at: nowIso, event: `${v.stage}→${to}: ${note}` }] };
}

/** Merchant/creator onboarding: listed only after verification. */
export function onboardNode(v: Venture, caller: Caller, node: Omit<BusinessNode, 'venture' | 'verified'>): Venture {
  assertCaller(caller);
  if (caller.did !== v.owner) throw new Error('NOT_OWNER');
  if (v.nodes.some((n) => n.id === node.id)) throw new Error('NODE_EXISTS');
  return { ...v, nodes: [...v.nodes, { ...node, venture: v.id, verified: false }] };
}

export function verifyNode(v: Venture, caller: Caller, nodeId: string, approval: HumanApproval): Venture {
  assertHumanFor(caller, 'market.merchant-approve');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  return { ...v, nodes: v.nodes.map((n) => (n.id === nodeId ? { ...n, verified: true } : n)) };
}

// ---------- Products, services, agents, workflows ----------
export interface Offering {
  id: string;
  node: string;
  kind: 'product' | 'service' | 'agent' | 'workflow';
  title: string;
  priceMinor: string;
  obligations: string;
  state: 'draft' | 'published' | 'paused' | 'retired';
}

export function draftOffering(
  id: string, caller: Caller, v: Venture, nodeId: string, kind: Offering['kind'], title: string, priceMinor: string, obligations: string,
): Offering {
  assertCaller(caller);
  const node = v.nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error('UNKNOWN_NODE');
  if (!node.verified) throw new Error('NODE_UNVERIFIED');
  if (BigInt(priceMinor) < 0n) throw new Error('BAD_PRICE');
  assertMlyWording(title);
  assertMlyWording(obligations);
  return { id, node: nodeId, kind, title, priceMinor, obligations, state: 'draft' };
}

export function publishOffering(o: Offering, caller: Caller, v: Venture): Offering {
  assertCaller(caller);
  if (caller.did !== v.owner) throw new Error('NOT_OWNER');
  if (o.state !== 'draft' && o.state !== 'paused') throw new Error('NOT_PUBLISHABLE');
  return { ...o, state: 'published' };
}

export function pauseOffering(o: Offering, caller: Caller, v: Venture): Offering {
  assertCaller(caller);
  if (caller.did !== v.owner) throw new Error('NOT_OWNER');
  if (o.state !== 'published') throw new Error('NOT_LIVE');
  return { ...o, state: 'paused' };
}

export function retireOffering(o: Offering, caller: Caller, v: Venture): Offering {
  assertCaller(caller);
  if (caller.did !== v.owner) throw new Error('NOT_OWNER');
  if (o.state === 'retired') throw new Error('ALREADY_RETIRED');
  return { ...o, state: 'retired' };
}

// ---------- Value contracts (roles, splits, deliverables — signed before work) ----------
export type ContributorRole = 'founder' | 'maker' | 'helper' | 'reviewer' | 'investor';

export interface ValueContract {
  id: string;
  venture: string;
  parties: { did: string; role: ContributorRole; splitPct: number }[];
  deliverables: string[];
  state: 'draft' | 'signed' | 'fulfilled' | 'corrected' | 'void';
}

export function draftContract(id: string, caller: Caller, v: Venture, parties: ValueContract['parties'], deliverables: string[]): ValueContract {
  assertCaller(caller);
  if (caller.did !== v.owner) throw new Error('NOT_OWNER');
  const total = parties.reduce((n, p) => n + p.splitPct, 0);
  if (total !== 100) throw new Error('SPLITS_MUST_TOTAL_100');
  if (deliverables.length === 0) throw new Error('NEEDS_DELIVERABLES');
  return { id, venture: v.id, parties, deliverables, state: 'draft' };
}

export function signContract(c: ValueContract, caller: Caller, partyDid: string): ValueContract {
  assertCaller(caller);
  if (caller.did !== partyDid) throw new Error('MUST_SIGN_SELF');
  if (!c.parties.some((p) => p.did === partyDid)) throw new Error('NOT_A_PARTY');
  if (c.state !== 'draft') throw new Error('NOT_DRAFT');
  // Single-signature draft moves to signed only when the owner countersigns;
  // simplified: each party signature recorded via history-less promotion when all sign.
  const signed = (c as unknown as { _signedBy?: string[] })._signedBy ?? [];
  const next = [...new Set([...signed, partyDid])];
  const all = c.parties.every((p) => next.includes(p.did));
  return { ...c, state: all ? 'signed' : 'draft', _signedBy: next } as unknown as ValueContract;
}

// ---------- Revenue-state tracking (settled counts; projected never does) ----------
export interface RevenueRecord {
  id: string;
  venture: string;
  amountMinor: string;
  state: ValueState;
  evidenceRef?: string;
  delivery: 'undelivered' | 'delivered' | 'accepted';
}

export function trackRevenue(id: string, caller: Caller, venture: string, amountMinor: string, nowIso: string): RevenueRecord {
  assertCaller(caller);
  void nowIso;
  if (BigInt(amountMinor) <= 0n) throw new Error('AMOUNT_MUST_BE_POSITIVE');
  return { id, venture, amountMinor, state: 'projected', delivery: 'undelivered' };
}

export function markDelivered(r: RevenueRecord, accepted: boolean): RevenueRecord {
  return { ...r, delivery: accepted ? 'accepted' : 'delivered' };
}

/** Revenue recognition: settled state + accepted delivery + human. Nothing else counts. */
export function recognizeRevenue(r: RevenueRecord, caller: Caller, approval: HumanApproval): RevenueRecord {
  assertHumanFor(caller, 'forge.revenue-recognize');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  if (r.state !== 'settled') throw new Error('PROJECTED_NOT_EARNED');
  if (r.delivery !== 'accepted') throw new Error('DELIVERY_NOT_ACCEPTED');
  return r;
}

export function moveRevenue(r: RevenueRecord, to: ValueState): RevenueRecord {
  if (!allowedTransition(r.state, to)) throw new Error(`ILLEGAL_REVENUE_MOVE_${r.state.toUpperCase()}_TO_${to.toUpperCase()}`);
  return { ...r, state: to };
}

/** Earned income = settled records only. Signups, recruits, projections count zero. */
export function earnedIncome(records: RevenueRecord[]): string {
  return records
    .filter((r) => r.state === 'settled')
    .reduce((n, r) => n + BigInt(r.amountMinor), 0n)
    .toString();
}

// ---------- Welcome disbursement (budgeted, human, online — never offline-minted) ----------
export function disburseWelcome(
  alreadyCreditedMinor: string, nextMinor: string, budgetMinor: string, caller: Caller, approval: HumanApproval, online: boolean,
): { ok: true } {
  assertHumanFor(caller, 'forge.welcome-disburse');
  if (!online) throw new Error('NO_OFFLINE_MINT');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  if (!welcomeWithinBudget(alreadyCreditedMinor, nextMinor, budgetMinor)) throw new Error('WELCOME_OVER_BUDGET');
  return { ok: true };
}

export function exportVenture(v: Venture, offerings: Offering[], contracts: ValueContract[], revenue: RevenueRecord[]) {
  return JSON.parse(JSON.stringify({ venture: v, offerings, contracts, revenue })) as {
    venture: Venture; offerings: Offering[]; contracts: ValueContract[]; revenue: RevenueRecord[];
  };
}
