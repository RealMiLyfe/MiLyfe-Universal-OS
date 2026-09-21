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

/** Circuit breaker: spend > 34% of treasury triggers 48h cooldown + 80% supermajority. */
export function breakerTrips(spendMinor: string, treasuryMinor: string): boolean {
  const spend = BigInt(spendMinor);
  const treasury = BigInt(treasuryMinor);
  if (treasury <= 0n) return true;
  return spend * 100n > treasury * 34n;
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
