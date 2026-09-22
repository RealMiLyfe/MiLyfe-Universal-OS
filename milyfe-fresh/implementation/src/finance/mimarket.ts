// MiMarket — neighbor marketplace: listings, orders, bookings, gigs, reviews,
// refunds, disputes. Settlement rides MiMoney; verdicts ride MiResolve.
// Business, customer, campaign, donor, constituent, and public-office records
// live in separate registers — mixing them is refused, not warned.
import {
  assertCaller, assertHumanFor, assertMlyWording, emitOrQueue, notice, receiptFor,
  type Caller, type HumanApproval, type Notice,
} from './shared';
import { marketOrderToSettlement } from './bridges';

// ---------- Register separation (campaign-family records never land here) ----------
export type MarketRegister = 'business' | 'customer';
const GOVERNANCE_REGISTERS = ['campaign', 'donor', 'constituent', 'public-office'];

export function assertMarketRegister<R extends string>(register: R): R {
  if (GOVERNANCE_REGISTERS.includes(register)) throw new Error(`WRONG_REGISTER_${register.toUpperCase().replace('-', '_')}_USE_GOVERNANCE`);
  if (register !== 'business' && register !== 'customer') throw new Error('UNKNOWN_REGISTER');
  return register;
}

// ---------- Profiles (merchants and customers in separate stores) ----------
export interface MerchantProfile {
  id: string;
  owner: string;
  shop: string;
  verified: boolean;
  terms: string;
  register: 'business';
}

export interface CustomerProfile {
  id: string;
  owner: string;
  handle: string;
  register: 'customer';
}

export interface RideProfile {
  id: string;
  owner: string;
  area: string;
  seats: number;
  register: 'business';
}

export function createMerchant(id: string, caller: Caller, shop: string, terms: string): MerchantProfile {
  assertCaller(caller);
  assertMlyWording(terms);
  return { id, owner: caller.did, shop, verified: false, terms, register: assertMarketRegister('business') };
}

export function approveMerchant(m: MerchantProfile, caller: Caller, approval: HumanApproval): MerchantProfile {
  assertHumanFor(caller, 'market.merchant-approve');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  return { ...m, verified: true };
}

export function createCustomer(id: string, caller: Caller, handle: string): CustomerProfile {
  assertCaller(caller);
  return { id, owner: caller.did, handle, register: assertMarketRegister('customer') };
}

export function createRideProfile(id: string, caller: Caller, area: string, seats: number): RideProfile {
  assertCaller(caller);
  if (!Number.isInteger(seats) || seats < 1 || seats > 8) throw new Error('BAD_SEATS');
  return { id, owner: caller.did, area, seats, register: assertMarketRegister('business') };
}

// ---------- Listings + forge offers ----------
export type ListingKind = 'goods' | 'service' | 'classified' | 'job' | 'gig' | 'ride';
export type ListingState = 'draft' | 'published' | 'ordered' | 'fulfilled' | 'retired';

export interface Listing {
  id: string;
  seller: string;
  kind: ListingKind;
  title: string;
  priceMinor: string;
  terms: string;
  state: ListingState;
  freshAsOf: string;
}

export function publishListing(
  id: string, caller: Caller, merchant: MerchantProfile, kind: ListingKind, title: string, priceMinor: string, terms: string, nowIso: string,
): Listing {
  assertCaller(caller);
  if (!merchant.verified) throw new Error('MERCHANT_UNVERIFIED');
  if (caller.did !== merchant.owner) throw new Error('NOT_OWNER');
  if (BigInt(priceMinor) < 0n) throw new Error('BAD_PRICE');
  assertMlyWording(title);
  assertMlyWording(terms);
  return { id, seller: merchant.id, kind, title, priceMinor, terms, state: 'published', freshAsOf: nowIso };
}

/** Forge venture → market offer. Reference only — no forge source import. */
export function offerFromVenture(id: string, caller: Caller, merchant: MerchantProfile, ventureRef: string, title: string, priceMinor: string, nowIso: string): Listing {
  assertCaller(caller);
  if (!ventureRef) throw new Error('VENTURE_REF_REQUIRED');
  return publishListing(id, caller, merchant, 'service', title, priceMinor, `from venture ${ventureRef}`, nowIso);
}

export function retireListing(l: Listing, caller: Caller, merchant: MerchantProfile): Listing {
  assertCaller(caller);
  if (caller.did !== merchant.owner) throw new Error('NOT_OWNER');
  if (l.state === 'retired') throw new Error('ALREADY_RETIRED');
  return { ...l, state: 'retired' };
}

// ---------- Orders (placed → accepted → in-progress → delivered → complete) ----------
export type OrderState = 'placed' | 'accepted' | 'in-progress' | 'delivered' | 'complete' | 'disputed' | 'refunded' | 'canceled';

export interface Order {
  id: string;
  listing: string;
  buyer: string;
  seller: string;
  amountMinor: string;
  state: OrderState;
  history: { at: string; event: string }[];
}

const ORDER_MOVES: Record<OrderState, OrderState[]> = {
  placed: ['accepted', 'canceled', 'disputed'],
  accepted: ['in-progress', 'canceled', 'disputed'],
  'in-progress': ['delivered', 'disputed'],
  delivered: ['complete', 'disputed'],
  complete: ['disputed'],
  disputed: ['refunded', 'complete'],
  refunded: [],
  canceled: [],
};

export function placeOrder(id: string, caller: Caller, customer: CustomerProfile, listing: Listing, nowIso: string): Order {
  assertCaller(caller);
  if (caller.did !== customer.owner) throw new Error('NOT_OWNER');
  if (listing.state !== 'published') throw new Error('LISTING_NOT_LIVE');
  return {
    id, listing: listing.id, buyer: customer.id, seller: listing.seller,
    amountMinor: listing.priceMinor, state: 'placed', history: [{ at: nowIso, event: 'placed' }],
  };
}

export function moveOrder(o: Order, to: OrderState, note: string, nowIso: string): Order {
  if (!ORDER_MOVES[o.state].includes(to)) throw new Error(`BAD_ORDER_MOVE_${o.state.toUpperCase()}_TO_${to.toUpperCase()}`.replace(/-/g, '_'));
  return { ...o, state: to, history: [...o.history, { at: nowIso, event: `${o.state}→${to}: ${note}` }] };
}

/** Order → MiMoney settlement. Reference-only bus handoff, receipted. */
export async function settleOrder(o: Order, caller: Caller, cell: string, online: boolean) {
  assertCaller(caller);
  if (o.state !== 'delivered') throw new Error('SETTLE_NEEDS_DELIVERY');
  const { receipt, bus } = await marketOrderToSettlement(caller, o.id, cell, online);
  return { order: moveOrder(o, 'complete', 'settlement requested', new Date().toISOString()), receipt, bus };
}

// ---------- Bookings ----------
export type BookingState = 'requested' | 'confirmed' | 'done' | 'canceled' | 'disputed';

export interface Booking {
  id: string;
  listing: string;
  buyer: string;
  slot: string;
  state: BookingState;
}

export function requestBooking(id: string, caller: Caller, customer: CustomerProfile, listing: Listing, slot: string): Booking {
  assertCaller(caller);
  if (caller.did !== customer.owner) throw new Error('NOT_OWNER');
  if (listing.state !== 'published') throw new Error('LISTING_NOT_LIVE');
  return { id, listing: listing.id, buyer: customer.id, slot, state: 'requested' };
}

export function moveBooking(b: Booking, to: BookingState): Booking {
  const ok: Record<BookingState, BookingState[]> = {
    requested: ['confirmed', 'canceled'], confirmed: ['done', 'canceled', 'disputed'], done: ['disputed'], canceled: [], disputed: ['done', 'canceled'],
  };
  if (!ok[b.state].includes(to)) throw new Error('BAD_BOOKING_MOVE');
  return { ...b, state: to };
}

// ---------- Reviews (verified purchase only), complaints, disputes ----------
export interface Review {
  id: string;
  order: string;
  by: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
}

export function leaveReview(id: string, caller: Caller, order: Order, stars: number, text: string): Review {
  assertCaller(caller);
  if (order.state !== 'complete') throw new Error('REVIEW_NEEDS_COMPLETED_ORDER');
  if (![1, 2, 3, 4, 5].includes(stars)) throw new Error('BAD_STARS');
  assertMlyWording(text);
  return { id, order: order.id, by: caller.did, stars: stars as Review['stars'], text };
}

export interface MarketComplaint {
  id: string;
  order: string;
  from: string;
  text: string;
  state: 'open' | 'answered' | 'escalated';
  filedAt: string;
}

export function fileComplaint(id: string, caller: Caller, order: Order, text: string, nowIso: string): MarketComplaint {
  assertCaller(caller);
  return { id, order: order.id, from: caller.did, text, state: 'open', filedAt: nowIso };
}

export async function escalateDispute(c: MarketComplaint, caller: Caller, order: Order, cell: string, online: boolean) {
  assertCaller(caller);
  const bus = await emitOrQueue({
    family: 'resolve', name: 'dispute-opened', actor: caller, cell, entity: order.id,
    privacy: 'private', payload: { ref: order.id, kind: 'market-dispute' }, receipt: 'see-receipt', online,
  });
  return { complaint: { ...c, state: 'escalated' as const }, order: moveOrder(order, 'disputed', 'escalated to MiResolve', new Date().toISOString()), bus };
}

// ---------- Fees (visible always; material changes need a human) ----------
export interface FeeRule {
  id: string;
  pct: number;
  flatMinor: string;
  material: boolean;
}

export function setFee(id: string, caller: Caller, pct: number, flatMinor: string, material: boolean): FeeRule {
  assertHumanFor(caller, 'market.fee-change');
  if (pct < 0 || pct > 100) throw new Error('BAD_FEE');
  return { id, pct, flatMinor, material };
}

export function quoteFee(rule: FeeRule, amountMinor: string): string {
  return ((BigInt(amountMinor) * BigInt(Math.floor(rule.pct * 100))) / 10000n + BigInt(rule.flatMinor)).toString();
}

/** Marketplace volume = settled completions only. Projected never counts. */
export function settledGmv(orders: Order[]): string {
  return orders
    .filter((o) => o.state === 'complete')
    .reduce((n, o) => n + BigInt(o.amountMinor), 0n)
    .toString();
}

// ---------- Merchant support + takedown (due process, never silent) ----------
export interface SupportCase {
  id: string;
  merchant: string;
  issue: string;
  state: 'open' | 'resolved';
  notice: Notice;
}

export function openSupportCase(id: string, caller: Caller, merchant: MerchantProfile, issue: string): SupportCase {
  assertCaller(caller);
  return {
    id, merchant: merchant.id, issue, state: 'open',
    notice: notice('Support case opened', 'A human on the merchant desk will answer within seven days.', 'Visit the merchant desk in your street.'),
  };
}

export function takedownListing(l: Listing, caller: Caller, approval: HumanApproval, reason: string) {
  assertHumanFor(caller, 'market.takedown');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  const receipt = receiptFor('MiMarket', {
    actor: caller.did, purpose: `Takedown listing ${l.id}`, capability: 'market.takedown',
    approval: { by: approval.by, role: 'human-reviewer', scope: 'market', reason: approval.reason },
    impact: { other: `listing ${l.id} retired: ${reason}` }, status: 'executed',
    correction: { path: 'Appeal via MiResolve', route: 'resolve.appeal-requested' },
    explains: `A listing was taken down because: ${reason}. The seller can appeal.`,
  });
  return { listing: { ...l, state: 'retired' as const }, receipt };
}

export function exportMarketHistory(orders: Order[], reviews: Review[], complaints: MarketComplaint[]) {
  return JSON.parse(JSON.stringify({ orders, reviews, complaints })) as { orders: Order[]; reviews: Review[]; complaints: MarketComplaint[] };
}
