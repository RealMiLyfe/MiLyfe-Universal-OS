// MiMoney: sole-ledger math. Pure functions (tested) + thin API callers.
// Money moves only via server RPC + human signature. Units: integer minor units as string.
// Nine value labels: projected/pending/verified/settled/allocated/rewarded/reinvested/reserved/disputed/reversed.
import type { ValueState } from '@/contracts';

export type Pot = 'spending' | 'savings' | 'community';

export interface Balances {
  spending: string;
  savings: string;
  community: string;
}

export function zeroBalances(): Balances {
  return { spending: '0', savings: '0', community: '0' };
}

/** No-negative check: balance - amount >= 0 (BigInt minor units). */
export function canDebit(balanceMinor: string, amountMinor: string): boolean {
  try {
    return BigInt(balanceMinor) - BigInt(amountMinor) >= 0n && BigInt(amountMinor) > 0n;
  } catch {
    return false;
  }
}

export function applyDebit(balanceMinor: string, amountMinor: string): string {
  if (!canDebit(balanceMinor, amountMinor)) throw new Error('INSUFFICIENT_OR_INVALID');
  return (BigInt(balanceMinor) - BigInt(amountMinor)).toString();
}

export function applyCredit(balanceMinor: string, amountMinor: string): string {
  if (BigInt(amountMinor) <= 0n) throw new Error('CREDIT_MUST_BE_POSITIVE');
  return (BigInt(balanceMinor) + BigInt(amountMinor)).toString();
}

/** Issuance split: default 70% place / 30% commons. */
export function splitIssuance(amountMinor: string, placePct = 70): { place: string; commons: string } {
  const total = BigInt(amountMinor);
  if (total <= 0n) throw new Error('ISSUANCE_MUST_BE_POSITIVE');
  const place = (total * BigInt(placePct)) / 100n;
  return { place: place.toString(), commons: (total - place).toString() };
}

/** PROVISIONAL (2026-09-21): the 34% breaker figure is not constitutional and not
 *  universal. It applies only to treasury books that explicitly opt in, until a
 *  MiTreasury specification + authority record adopts (or replaces) it. */
export const PROVISIONAL_BREAKER_PCT = 34;

export function breakerTrips(spendMinor: string, treasuryMinor: string, pct: number = PROVISIONAL_BREAKER_PCT): boolean {
  const spend = BigInt(spendMinor);
  const treasury = BigInt(treasuryMinor);
  if (treasury <= 0n) return true;
  return spend * 100n > treasury * BigInt(pct);
}

export function supermajorityNeeded(votesFor: number, votesTotal: number): boolean {
  if (votesTotal <= 0) return false;
  return votesFor * 100 >= votesTotal * 80;
}

/** Runway gauge: honest "months left" from reserves + monthly burn. */
export function runwayMonths(reservesMinor: string, monthlyBurnMinor: string): string {
  const reserves = BigInt(reservesMinor);
  const burn = BigInt(monthlyBurnMinor);
  if (burn <= 0n) return 'no burn — runway holds';
  if (reserves <= 0n) return '0 months — reserves empty';
  const months = Number(reserves / burn);
  return `${months} month${months === 1 ? '' : 's'} at current burn`;
}

export function isSpendable(state: ValueState): boolean {
  // Spendable: settled, rewarded, reinvested (by holder / receiving-treasury rules).
  // Everything else — projected, pending, verified, allocated, reserved, disputed, reversed — is NOT.
  return state === 'settled' || state === 'rewarded' || state === 'reinvested';
}

const TRANSITIONS: Record<ValueState, ValueState[]> = {
  projected: ['pending', 'reversed'],
  pending: ['verified', 'disputed', 'reversed'],
  verified: ['settled', 'allocated', 'reserved', 'disputed'],
  settled: ['reinvested', 'disputed'],
  allocated: ['settled', 'reversed'],
  rewarded: ['reinvested', 'disputed'],
  reinvested: ['disputed'],
  reserved: ['settled', 'allocated'],
  disputed: ['settled', 'reversed'],
  reversed: [],
};

/** Only these moves are legal. Anything else is rejected (never silently forced). */
export function allowedTransition(from: ValueState, to: ValueState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function totalBalance(b: Balances): string {
  return (BigInt(b.spending) + BigInt(b.savings) + BigInt(b.community)).toString();
}

export async function apiTransfer(input: {
  sender: string; recipient: string; amountMinor: string; pot: Pot; reason: string; signature: string;
  idempotencyKey: string; actor: string; cell: string; context: string; role: string; token?: string;
}): Promise<{ ok: boolean; receipt?: unknown; error?: string }> {
  const res = await fetch('/api/transfer', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(input.token ? { authorization: `Bearer ${input.token}` } : {}),
    },
    body: JSON.stringify({
      api: 'milyfe/1',
      op: 'money.transfer',
      idempotencyKey: input.idempotencyKey,
      actor: input.actor,
      context: { cell: input.cell, context: input.context, role: input.role },
      params: {
        sender: input.sender, recipient: input.recipient,
        amountMinor: input.amountMinor, pot: input.pot,
        reason: input.reason, signature: input.signature,
      },
    }),
  });
  return (await res.json()) as { ok: boolean; receipt?: unknown; error?: string };
}

// ---------- Authoritative MLY ledger (one ledger, no negatives, idempotent) ----------
import { MLY_DISCLOSURE, assertCaller, assertHumanFor, assertMlyWording, type Caller, type HumanApproval } from './shared';

export interface PostingHistory {
  at: string;
  event: string;
}

export interface PostingRecord {
  key: string;
  from: string;
  to: string;
  amountMinor: string;
  state: ValueState;
  history: PostingHistory[];
  orderRef?: string;
  refundOf?: string;
  note?: string;
}

export interface SettleResult {
  posting: PostingRecord;
}

/** One ledger. Balances never negative. Same key twice = same posting (never double-post). */
export class Ledger {
  private balances = new Map<string, string>();
  private postings = new Map<string, PostingRecord>();
  private queue: Promise<void> = Promise.resolve();
  private issuedTotal = '0';

  /** Serializes every balance-changing op so concurrent settles stay honest. */
  private serial<T>(fn: () => T | Promise<T>): Promise<T> {
    const run = this.queue.then(fn);
    this.queue = run.then(
      () => {},
      () => {},
    );
    return run;
  }

  openAccount(id: string): void {
    if (!this.balances.has(id)) this.balances.set(id, '0');
  }

  balance(id: string): string {
    return this.balances.get(id) ?? '0';
  }

  getPosting(key: string): PostingRecord | undefined {
    return this.postings.get(key);
  }

  /** Draft a pending posting. Moves no money. Same key + same facts = same posting. */
  post(
    caller: Caller,
    input: { key: string; from: string; to: string; amountMinor: string; orderRef?: string; note?: string },
    nowIso: string,
  ): PostingRecord {
    assertCaller(caller);
    if (input.note) assertMlyWording(input.note);
    const seen = this.postings.get(input.key);
    if (seen) {
      if (seen.from !== input.from || seen.to !== input.to || seen.amountMinor !== input.amountMinor) {
        throw new Error('KEY_REUSE_MISMATCH');
      }
      return seen;
    }
    if (BigInt(input.amountMinor) <= 0n) throw new Error('AMOUNT_MUST_BE_POSITIVE');
    if (input.from === input.to) throw new Error('NO_SELF_SEND');
    this.openAccount(input.from);
    this.openAccount(input.to);
    const posting: PostingRecord = {
      key: input.key, from: input.from, to: input.to, amountMinor: input.amountMinor,
      state: 'pending', history: [{ at: nowIso, event: 'posted pending' }],
      orderRef: input.orderRef, note: input.note,
    };
    this.postings.set(input.key, posting);
    return posting;
  }

  private move(p: PostingRecord, to: ValueState, event: string, nowIso: string): PostingRecord {
    if (!allowedTransition(p.state, to)) throw new Error(`ILLEGAL_MONEY_MOVE_${p.state.toUpperCase()}_TO_${to.toUpperCase()}`);
    const next: PostingRecord = { ...p, state: to, history: [...p.history, { at: nowIso, event }] };
    this.postings.set(p.key, next);
    return next;
  }

  /** Settle: pending → verified → settled, balance-checked, serialized. Human only. */
  async settle(key: string, caller: Caller, approval: HumanApproval, nowIso: string): Promise<SettleResult> {
    assertHumanFor(caller, 'money.settle');
    if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
    return this.serial(() => {
      const p = this.postings.get(key);
      if (!p) throw new Error('UNKNOWN_POSTING');
      if (p.state === 'settled') return { posting: p };
      let next = p.state === 'pending' ? this.move(p, 'verified', 'verified for settlement', nowIso) : p;
      if (!canDebit(this.balance(next.from), next.amountMinor)) throw new Error('INSUFFICIENT_OR_INVALID');
      this.balances.set(next.from, applyDebit(this.balance(next.from), next.amountMinor));
      this.balances.set(next.to, applyCredit(this.balance(next.to), next.amountMinor));
      next = this.move(next, 'settled', `settled by ${approval.by}`, nowIso);
      return { posting: next };
    });
  }

  /** Guided moves (allocate, reserve, reward, reinvest…) with transition law + human gates. */
  async movePosting(key: string, to: ValueState, caller: Caller, note: string, nowIso: string): Promise<PostingRecord> {
    const HUMAN_TARGETS: ValueState[] = ['settled', 'allocated', 'reversed', 'rewarded', 'reinvested', 'reserved'];
    if (HUMAN_TARGETS.includes(to)) assertHumanFor(caller, to === 'rewarded' ? 'work.reward-approve' : 'money.allocate');
    else assertCaller(caller);
    if (note) assertMlyWording(note);
    return this.serial(() => {
      const p = this.postings.get(key);
      if (!p) throw new Error('UNKNOWN_POSTING');
      return this.move(p, to, note || `moved to ${to}`, nowIso);
    });
  }

  /** Reverse: money flows back if the recipient still holds it; otherwise disputed. Human only. */
  async reverse(key: string, caller: Caller, approval: HumanApproval, reason: string, nowIso: string): Promise<{ posting: PostingRecord; reversed: boolean }> {
    assertHumanFor(caller, 'money.reverse');
    if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
    assertMlyWording(reason);
    return this.serial(() => {
      const p = this.postings.get(key);
      if (!p) throw new Error('UNKNOWN_POSTING');
      const disputed = p.state === 'disputed' ? p : this.move(p, 'disputed', `disputed: ${reason}`, nowIso);
      if (!canDebit(this.balance(disputed.to), disputed.amountMinor)) {
        return { posting: disputed, reversed: false };
      }
      this.balances.set(disputed.to, applyDebit(this.balance(disputed.to), disputed.amountMinor));
      this.balances.set(disputed.from, applyCredit(this.balance(disputed.from), disputed.amountMinor));
      return { posting: this.move(disputed, 'reversed', `reversed: ${reason}`, nowIso), reversed: true };
    });
  }

  /** Refund: a new settled posting flowing back, linked to the original. Human only. */
  async refund(newKey: string, originalKey: string, caller: Caller, approval: HumanApproval, nowIso: string): Promise<PostingRecord> {
    assertHumanFor(caller, 'money.refund');
    if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
    const orig = this.postings.get(originalKey);
    if (!orig) throw new Error('UNKNOWN_POSTING');
    if (orig.state !== 'settled' && orig.state !== 'disputed') throw new Error('REFUND_NEEDS_SETTLED');
    const back = this.post(caller, { key: newKey, from: orig.to, to: orig.from, amountMinor: orig.amountMinor, orderRef: orig.orderRef }, nowIso);
    const withLink: PostingRecord = { ...back, refundOf: originalKey };
    this.postings.set(newKey, withLink);
    return (await this.settle(newKey, caller, approval, nowIso)).posting;
  }

  /** Anyone valid can flag; resolution stays human. */
  dispute(key: string, caller: Caller, reason: string, nowIso: string): PostingRecord {
    assertCaller(caller);
    assertMlyWording(reason);
    const p = this.postings.get(key);
    if (!p) throw new Error('UNKNOWN_POSTING');
    return this.move(p, 'disputed', `disputed by ${caller.did}: ${reason}`, nowIso);
  }

  /** Issuance grows circulation. Human + budget reference, always. */
  async mint(to: string, amountMinor: string, caller: Caller, approval: HumanApproval, budgetRef: string, nowIso: string): Promise<void> {
    assertHumanFor(caller, 'money.mint');
    if (!approval.by || !approval.reason || !budgetRef) throw new Error('APPROVAL_INCOMPLETE');
    if (BigInt(amountMinor) <= 0n) throw new Error('AMOUNT_MUST_BE_POSITIVE');
    return this.serial(() => {
      this.openAccount(to);
      this.balances.set(to, applyCredit(this.balance(to), amountMinor));
      this.issuedTotal = (BigInt(this.issuedTotal) + BigInt(amountMinor)).toString();
      void nowIso;
    });
  }

  /** Conservation audit: every unit issued must sit in exactly one account. */
  reconcile(): { ok: boolean; breaks: string[]; total: string; issued: string } {
    let total = '0';
    const breaks: string[] = [];
    for (const [id, bal] of this.balances) {
      if (BigInt(bal) < 0n) breaks.push(`negative:${id}`);
      total = (BigInt(total) + BigInt(bal)).toString();
    }
    if (total !== this.issuedTotal) breaks.push(`conservation:${total}-vs-${this.issuedTotal}`);
    return { ok: breaks.length === 0, breaks, total, issued: this.issuedTotal };
  }

  exportLedger(): { disclosure: string; issued: string; accounts: Record<string, string>; postings: PostingRecord[] } {
    return JSON.parse(
      JSON.stringify({
        disclosure: MLY_DISCLOSURE,
        issued: this.issuedTotal,
        accounts: Object.fromEntries(this.balances),
        postings: [...this.postings.values()],
      }),
    ) as { disclosure: string; issued: string; accounts: Record<string, string>; postings: PostingRecord[] };
  }
}

// ---------- Treasury book (budgeted, human-spent, provisional breaker opt-in) ----------
export interface TreasuryBook {
  balanceMinor: string;
  paidMinor: string;
  budgetMinor: string;
  /** Provisional breaker threshold, or null for no breaker. Opt-in only. */
  breakerPct: number | null;
}

export function openTreasuryBook(budgetMinor: string, opts?: { breakerPct?: number | null }): TreasuryBook {
  if (BigInt(budgetMinor) <= 0n) throw new Error('BUDGET_MUST_BE_POSITIVE');
  return { balanceMinor: '0', paidMinor: '0', budgetMinor, breakerPct: opts?.breakerPct ?? null };
}

export function fundTreasuryBook(b: TreasuryBook, amountMinor: string): TreasuryBook {
  if (BigInt(amountMinor) <= 0n) throw new Error('INVALID_AMOUNT');
  return { ...b, balanceMinor: (BigInt(b.balanceMinor) + BigInt(amountMinor)).toString() };
}

/** A breaker override is a full record: human, budget, scope, reason, expiry,
 *  receipt, and supermajority evidence — never a bare vote count. */
export interface TreasuryOverride {
  approvedBy: string;
  budgetRef: string;
  scope: string;
  reason: string;
  expiresAt: string;
  receiptId: string;
  votesFor: number;
  votesTotal: number;
}

export interface TreasurySpendAudit {
  spentMinor: string;
  at: string;
  approval: HumanApproval;
  override: TreasuryOverride | null;
  /** Rollback/correction path, always attached. */
  rollback: string;
}

export const TREASURY_ROLLBACK_PATH = 'Correct via correctTreasurySpend (same books, same day) or dispute via MiResolve → ledger reverse.';

export function spendTreasuryBook(
  b: TreasuryBook, amountMinor: string, caller: Caller, approval: HumanApproval, nowIso: string, override?: TreasuryOverride,
): { book: TreasuryBook; audit: TreasurySpendAudit } {
  assertHumanFor(caller, 'treasury.spend');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  if (BigInt(amountMinor) <= 0n) throw new Error('INVALID_AMOUNT');
  if (BigInt(b.balanceMinor) < BigInt(amountMinor)) throw new Error('TREASURY_SHORT');
  if (BigInt(b.paidMinor) + BigInt(amountMinor) > BigInt(b.budgetMinor)) throw new Error('BUDGET_EXCEEDED');
  let usedOverride: TreasuryOverride | null = null;
  if (b.breakerPct !== null && breakerTrips(amountMinor, b.balanceMinor, b.breakerPct)) {
    if (!override) throw new Error('BREAKER_TRIPPED_NEEDS_OVERRIDE');
    for (const field of ['approvedBy', 'budgetRef', 'scope', 'reason', 'expiresAt', 'receiptId'] as const) {
      if (!override[field]) throw new Error(`OVERRIDE_MISSING_${field.toUpperCase()}`);
    }
    if (override.expiresAt <= nowIso) throw new Error('OVERRIDE_EXPIRED');
    if (!supermajorityNeeded(override.votesFor, override.votesTotal)) throw new Error('OVERRIDE_WEAK');
    usedOverride = override;
  }
  const book: TreasuryBook = {
    ...b,
    balanceMinor: (BigInt(b.balanceMinor) - BigInt(amountMinor)).toString(),
    paidMinor: (BigInt(b.paidMinor) + BigInt(amountMinor)).toString(),
  };
  return { book, audit: { spentMinor: amountMinor, at: nowIso, approval, override: usedOverride, rollback: TREASURY_ROLLBACK_PATH } };
}

/** Rollback: restores a spend to the books (same-day correction path). */
export function correctTreasurySpend(b: TreasuryBook, amountMinor: string, caller: Caller, reason: string): TreasuryBook {
  assertHumanFor(caller, 'treasury.spend');
  if (!reason) throw new Error('REASON_REQUIRED');
  if (BigInt(amountMinor) <= 0n || BigInt(b.paidMinor) < BigInt(amountMinor)) throw new Error('NOTHING_TO_CORRECT');
  return {
    ...b,
    balanceMinor: (BigInt(b.balanceMinor) + BigInt(amountMinor)).toString(),
    paidMinor: (BigInt(b.paidMinor) - BigInt(amountMinor)).toString(),
  };
}
