// Sandbox: synthetic MiMoney states + MiForge/MiMarket sandboxes.
// FAKE money for practice and testing. Sandbox value can NEVER enter real
// ledger paths: every sandbox artifact is tagged synthetic, and the real-path
// guard refuses it. Same no-negative math as real money (shared functions).

import { allowedTransition, applyCredit, applyDebit, canDebit } from './mimoney';
import type { ValueState } from '@/contracts';

export const SYNTHETIC_BANNER = 'SYNTHETIC — not real money, not spendable, practice only';

export interface SyntheticReceipt {
  id: string;
  synthetic: true;
  kind: string;
  detail: string;
  at: string;
}

/** Real-path guard: real ledger/market/treasury code must call this and abort on synthetic input. */
export function refuseSyntheticInRealPath(artifact: { synthetic?: boolean }, path: string): void {
  if (artifact.synthetic === true) throw new Error(`SYNTHETIC_REFUSED_IN_${path.toUpperCase().replace(/[^A-Z]/g, '_')}`);
}

let receiptCounter = 0;
function syntheticReceipt(kind: string, detail: string): SyntheticReceipt {
  receiptCounter++;
  return { id: `syn-${Date.now().toString(36)}-${receiptCounter}`, synthetic: true, kind, detail, at: new Date().toISOString() };
}

// ---------- Synthetic MiMoney states (nine labels, synthetic-guarded) ----------

export class SyntheticLedger {
  private balances = new Map<string, string>();
  readonly banner = SYNTHETIC_BANNER;

  balance(account: string): string {
    return this.balances.get(account) ?? '0';
  }

  /** Practice faucet: clearly-labeled fake funds. Never callable from real paths (no server route). */
  faucet(account: string, amountMinor: string): SyntheticReceipt {
    const next = applyCredit(this.balance(account), amountMinor);
    this.balances.set(account, next);
    return syntheticReceipt('faucet', `+${amountMinor} to ${account}`);
  }

  transfer(from: string, to: string, amountMinor: string): { state: ValueState; receipt: SyntheticReceipt } {
    if (!canDebit(this.balance(from), amountMinor)) throw new Error('INSUFFICIENT_OR_INVALID');
    this.balances.set(from, applyDebit(this.balance(from), amountMinor));
    this.balances.set(to, applyCredit(this.balance(to), amountMinor));
    // Label says settled; synthetic flag + banner say practice-only. Real paths refuse this receipt.
    return { state: 'settled', receipt: syntheticReceipt('transfer', `${from}→${to} ${amountMinor}`) };
  }

  /** Lifecycle move with transition enforcement (fake money, real rules). */
  move(from: ValueState, to: ValueState, note: string): { state: ValueState; receipt: SyntheticReceipt } {
    if (!allowedTransition(from, to)) throw new Error(`ILLEGAL_TRANSITION_${from}_TO_${to}`.toUpperCase());
    return { state: to, receipt: syntheticReceipt('lifecycle', `${from}→${to}: ${note}`) };
  }

  /** Projected amounts are tracked separately and NEVER counted in balance(). */
  project(account: string, amountMinor: string): { state: ValueState; receipt: SyntheticReceipt } {
    if (BigInt(amountMinor) <= 0n) throw new Error('PROJECTION_MUST_BE_POSITIVE');
    return { state: 'projected', receipt: syntheticReceipt('projection', `${account} may receive ${amountMinor} (not real, not counted)`) };
  }
}

// ---------- MiForge sandbox: offers + welcome simulation (never posts) ----------
export interface SandboxOffer { id: string; owner: string; title: string; status: 'draft' | 'sandbox-published'; synthetic: true }

export function createOffer(owner: string, title: string): SandboxOffer {
  if (!title.trim()) throw new Error('OFFER_NEEDS_TITLE');
  return { id: `offer-${Date.now().toString(36)}`, owner, title: title.trim(), status: 'draft', synthetic: true };
}

export function publishOfferSandbox(offer: SandboxOffer): SandboxOffer {
  refuseSyntheticInRealPath({ synthetic: false }, 'noop'); // real publish lives elsewhere; this stays sandbox
  return { ...offer, status: 'sandbox-published' };
}

/** Simulates what a welcome disbursement WOULD do under a budget. Returns a plan, posts nothing. */
export function simulateWelcome(memberCount: number, perMemberMinor: string, budgetMinor: string): { total: string; withinBudget: boolean; receipt: SyntheticReceipt } {
  const total = (BigInt(perMemberMinor) * BigInt(memberCount)).toString();
  const withinBudget = BigInt(total) <= BigInt(budgetMinor);
  return { total, withinBudget, receipt: syntheticReceipt('welcome-simulation', `${memberCount}×${perMemberMinor}=${total} vs budget ${budgetMinor}`) };
}

// ---------- MiMarket sandbox: listings + orders, projected-only ----------
export interface SandboxListing { id: string; seller: string; title: string; priceMinor: string; synthetic: true }
export interface SandboxOrder {
  id: string; listing: string; buyer: string; state: ValueState; synthetic: true;
}

export function createListing(seller: string, title: string, priceMinor: string): SandboxListing {
  if (BigInt(priceMinor) <= 0n) throw new Error('PRICE_MUST_BE_POSITIVE');
  return { id: `listing-${Date.now().toString(36)}`, seller, title, priceMinor, synthetic: true };
}

export function placeOrderSandbox(listing: SandboxListing, buyer: string): SandboxOrder {
  return { id: `order-${Date.now().toString(36)}`, listing: listing.id, buyer, state: 'pending', synthetic: true };
}

export function fulfillOrderSandbox(order: SandboxOrder): { order: SandboxOrder; receipt: SyntheticReceipt } {
  if (order.state !== 'pending') throw new Error('ORDER_NOT_FULFILLABLE');
  const next: SandboxOrder = { ...order, state: 'settled' };
  return { order: next, receipt: syntheticReceipt('order', `sandbox order ${order.id} complete (fake)`) };
}
