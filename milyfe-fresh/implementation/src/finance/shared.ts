// Finance shared trunk wiring. Self-contained on purpose: finance never
// imports governance or lifestyle source. Trunk + contracts + bus only.
import { publish } from '@/kernel/bus';
import { isDid } from '@/kernel/id';
import type { ReceiptInput } from '@/kernel/receipt';
import { can, type Check, type Grant } from '@/kernel/scope';
import { enqueue } from '@/kernel/store';

export type FinanceOs = 'MiForge' | 'MiMarket' | 'MiMoney' | 'MiWork';
export interface Caller {
  did: string;
  kind: 'human' | 'agent';
}
export interface HumanApproval {
  by: string;
  at: string;
  reason: string;
}

/** Money and market power no agent may ever wield alone. Humans only. */
export const FINANCE_FORBIDDEN = [
  'money.mint',
  'money.settle',
  'money.refund',
  'money.reverse',
  'money.allocate',
  'money.reserve-release',
  'treasury.spend',
  'treasury.budget-approve',
  'market.takedown',
  'market.fee-change',
  'market.merchant-approve',
  'work.payout-approve',
  'work.reward-approve',
  'forge.revenue-recognize',
  'forge.welcome-disburse',
] as const;

// ---------- MLY honesty: MLY is MLY. Never USD, never pegged, never promised. ----------
export const MLY_DISCLOSURE = 'MLY is MLY: not USD, not pegged to anything, no promised cash-out or guaranteed value. Voluntary exchange with willing counterparties only.';

const USD_WORDS = ['USD', 'US dollar', 'pegged', 'guaranteed cash', 'guaranteed redemption', 'guaranteed appreciation', 'cash-out promise', 'redeemable for dollars'];

/** Rejects any wording that dresses MLY up as dollars or promises. */
export function assertMlyWording(text: string): void {
  const hit = USD_WORDS.find((w) => text.includes(w));
  if (hit) throw new Error(`MLY_MISREPRESENTATION_${hit.toUpperCase().replace(/[^A-Z]+/g, '_')}`);
}

export function labelMly(amountMinor: string): string {
  return `${amountMinor} MLY (${MLY_DISCLOSURE})`;
}

// ---------- Callers, permissions, human gates ----------
export function assertCaller(caller: Caller): void {
  if (!isDid(caller.did)) throw new Error('BAD_DID');
  if (caller.kind !== 'human' && caller.kind !== 'agent') throw new Error('BAD_CALLER_KIND');
}

export function assertHumanFor(caller: Caller, action: string): void {
  assertCaller(caller);
  if ((FINANCE_FORBIDDEN as readonly string[]).includes(action) && caller.kind !== 'human') {
    throw new Error(`AGENT_BLOCKED_${action.toUpperCase().replace(/[.-]/g, '_')}`);
  }
}

export function assertGrant(grants: Grant[], check: Check): string {
  const verdict = can(grants, check);
  if (!verdict.ok) throw new Error(`DENIED_${verdict.reason}`);
  return verdict.grantId ?? '';
}

// ---------- Plain notices ----------
const CODE_PATTERN = /\b[A-Z]{2,}(?:_[A-Z0-9]+)+\b/;

export function assertPlain(text: string, max = 280): void {
  if (!text || text.length > max) throw new Error('NOTICE_NOT_PLAIN');
  if (CODE_PATTERN.test(text)) throw new Error('NOTICE_HAS_CODES');
}

export interface Notice {
  title: string;
  plain: string;
  audioOffered: true;
  humanFallback: string;
}

export function notice(title: string, plain: string, humanFallback: string): Notice {
  assertPlain(plain);
  return { title, plain, audioOffered: true, humanFallback };
}

// ---------- Receipts (branch: finance) ----------
export function receiptFor(os: FinanceOs, input: Omit<ReceiptInput, 'branch' | 'os'>): ReceiptInput {
  assertPlain(input.explains, 500);
  assertMlyWording(input.explains);
  assertMlyWording(input.purpose);
  return { ...input, branch: 'finance', os };
}

// ---------- Bus: references ride, bodies never do ----------
type Privacy = 'public' | 'place' | 'circle' | 'private' | 'sealed';
const REFERENCE_KEYS = ['ref', 'kind', 'at', 'count', 'reason', 'label', 'scope'];

export function assertReferenceOnly(privacy: Privacy, payload: Record<string, unknown>): void {
  if (privacy !== 'private' && privacy !== 'sealed') return;
  for (const [k, v] of Object.entries(payload)) {
    if (!REFERENCE_KEYS.includes(k)) throw new Error(`BUS_BODY_LEAK_${k.toUpperCase()}`);
    if (typeof v !== 'string' || v.length > 140) throw new Error('BUS_VALUE_TOO_BIG');
  }
}

export interface EmitInput {
  family: string;
  name: string;
  actor: Caller;
  cell: string;
  entity: string;
  privacy: Privacy;
  payload: Record<string, unknown>;
  receipt: string;
  online: boolean;
}

export const OFFLINE_NOTE = 'Saved on your device. It will send when you are back online.';

export async function emitOrQueue(e: EmitInput): Promise<{ mode: 'published' | 'queued-offline'; id: string; note?: string }> {
  assertCaller(e.actor);
  assertReferenceOnly(e.privacy, e.payload);
  if (e.online) {
    const rec = await publish({
      family: e.family, name: e.name, actor: e.actor.did, cell: e.cell,
      entity: e.entity, privacy: e.privacy, payload: e.payload, receipt: e.receipt,
    });
    return { mode: 'published', id: rec.id };
  }
  const key = await enqueue(`${e.family}.${e.name}`, { ...e.payload, receipt: e.receipt });
  return { mode: 'queued-offline', id: key, note: OFFLINE_NOTE };
}
