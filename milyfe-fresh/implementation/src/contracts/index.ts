// Frozen Phase 3 contracts as Zod schemas (C1–C12, v1.0.0-draft).
// Every API route validates with these. No implementation without contract.

import { z } from 'zod';

export const DidRef = z.string().regex(/^did:milyfe:[A-Za-z0-9_-]{40,60}$/);
export const ContextRef = z.object({ cell: z.string().min(1), context: z.string().min(1), role: z.string().min(1) });

export const ApiEnvelope = z.object({
  api: z.literal('milyfe/1'),
  op: z.string().min(1),
  idempotencyKey: z.uuid(),
  actor: DidRef,
  context: ContextRef,
  params: z.record(z.string(), z.unknown()),
  signature: z.string().optional(),
});
export type ApiEnvelope = z.infer<typeof ApiEnvelope>;

export const MiEvent = z.object({
  id: z.uuid(),
  family: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  at: z.string().datetime(),
  actor: DidRef,
  cell: z.string().min(1),
  entity: z.string().min(1),
  privacy: z.enum(['public', 'place', 'circle', 'private', 'sealed']),
  payload: z.record(z.string(), z.unknown()),
  causationId: z.uuid().optional(),
  receipt: z.string().min(1),
});
export type MiEvent = z.infer<typeof MiEvent>;

export const MiReceiptSchema = z.object({
  id: z.uuid(),
  at: z.string().datetime(),
  actor: DidRef,
  branch: z.enum(['trunk', 'governance', 'lifestyle', 'finance']),
  os: z.string().min(1),
  purpose: z.string().min(1),
  capability: z.string().min(1),
  approval: z.object({
    by: z.string().min(1), role: z.string().min(1), scope: z.string().min(1),
    reason: z.string().min(1), evidence: z.string().optional(), expires: z.string().datetime().optional(),
  }),
  impact: z.object({ data: z.string().optional(), value: z.string().optional(), other: z.string().optional() }),
  status: z.enum(['proposed', 'approved', 'executed', 'settled', 'rejected', 'reversed', 'expired', 'corrected']),
  correction: z.object({ path: z.string().min(1), route: z.string().min(1), window: z.string().optional() }),
  explains: z.string().min(1),
  policy: z.string().min(1),
  signature: z.string().min(1),
});
export type MiReceiptSchema = z.infer<typeof MiReceiptSchema>;

export const MiScopeGrant = z.object({
  id: z.uuid(),
  issuer: DidRef,
  subject: DidRef,
  target: z.string().min(1),
  purpose: z.string().min(1),
  scope: z.array(z.string().min(1)).min(1),
  expires: z.string().datetime(),
  roles: z.array(z.enum(['household', 'child', 'shop', 'recovery', 'teacher', 'keeper', 'mediator', 'auditor', 'helper', 'temporary'])).optional(),
  youthAssent: z.boolean().optional(),
  guardianPermission: z.string().optional(),
  emergency: z.boolean().default(false),
  delegable: z.boolean().default(false),
  hopsLeft: z.number().int().min(0).max(3).default(0),
  approval: z.string().min(1),
});
export type MiScopeGrant = z.infer<typeof MiScopeGrant>;

export const MoneyState = z.enum(['projected', 'pending', 'settled', 'rewarded', 'disputed', 'reversed']);

export const Posting = z.object({
  id: z.uuid(),
  at: z.string().datetime(),
  entries: z.array(z.object({ account: z.string().min(1), entity: DidRef, delta: z.string().min(1) })).min(2),
  state: MoneyState,
  purpose: z.string().min(1),
  approval: z.string().min(1),
  receipt: z.string().min(1),
}).refine(
  (p) => {
    // Balanced: integer minor units must sum to zero (checked as BigInt).
    try {
      const sum = p.entries.reduce((acc, e) => acc + BigInt(e.delta), 0n);
      return sum === 0n;
    } catch {
      return false;
    }
  },
  { message: 'POSTING_UNBALANCED' },
);
export type Posting = z.infer<typeof Posting>;

export const CryptoDeposit = z.object({
  id: z.uuid(),
  entity: DidRef,
  asset: z.enum(['USDC', 'USDT', 'SOL', 'BTC', 'ETH', 'XRP']),
  amount: z.string().min(1),
  tx: z.string().min(1),
  confirmations: z.number().int().min(0),
  status: z.enum(['announced', 'observed', 'confirmed', 'credited']),
  creditedMly: z.string().default('0'),
  receipt: z.string().min(1),
});
export type CryptoDeposit = z.infer<typeof CryptoDeposit>;

export const CashExchange = z.object({
  id: z.uuid(),
  node: DidRef,
  member: DidRef,
  fiatAmount: z.string().min(1),
  fiatCode: z.string().min(1),
  mlyCredited: z.string().min(1),
  nodeConfirmed: z.boolean(),
  memberConfirmed: z.boolean(),
  receipt: z.string().min(1),
});
export type CashExchange = z.infer<typeof CashExchange>;

export const SwapListing = z.object({
  id: z.uuid(),
  maker: DidRef,
  offer: z.string().min(1),
  terms: z.string().min(1),
  meetingPolicy: z.string().min(1),
  status: z.enum(['listed', 'matched', 'met', 'settled', 'disputed', 'canceled']),
  receipt: z.string().min(1),
});
export type SwapListing = z.infer<typeof SwapListing>;

export const FinanceCard = z.object({
  id: z.uuid(),
  entity: DidRef,
  formFactor: z.enum(['digital-nfc', 'digital-ble', 'digital-qr']),
  keyRef: z.string().min(1),
  limits: z.string().min(1),
  status: z.enum(['active', 'frozen', 'revoked']),
  receipt: z.string().min(1),
});
export type FinanceCard = z.infer<typeof FinanceCard>;

export const TransferParams = z.object({
  sender: DidRef,
  recipient: DidRef,
  amountMinor: z.string().regex(/^[1-9][0-9]*$/),
  pot: z.enum(['spending', 'savings', 'community']),
  reason: z.string().max(280).default(''),
  signature: z.string().min(1), // human signature required — never auto
});
export type TransferParams = z.infer<typeof TransferParams>;
