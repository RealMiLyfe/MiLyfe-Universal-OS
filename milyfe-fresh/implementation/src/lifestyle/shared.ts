// Lifestyle shared trunk wiring. Every Lifestyle OS goes through here for:
// identity checks (MiID), permission checks (kernel scope), receipts (kernel
// receipt), bus events (no cross-branch imports), consent (MiMind scopes),
// plain-language notices, and offline honesty (store outbox).
import { publish } from '@/kernel/bus';
import { isDid } from '@/kernel/id';
import type { ReceiptInput } from '@/kernel/receipt';
import { can, type Check, type Grant } from '@/kernel/scope';
import { enqueue } from '@/kernel/store';
import { createMind, grantScope, readWithConsent, type ConsentScope, type MindRecord } from '@/trunk/mimind';

export type LifestyleOs = 'MiCare' | 'MiHealth' | 'MiPlace' | 'MiEducation';
export interface Caller {
  did: string;
  kind: 'human' | 'agent';
}
export interface HumanApproval {
  by: string;
  at: string;
  reason: string;
}

/** High-impact acts no agent may ever perform. Humans only. */
export const AGENT_FORBIDDEN_ACTIONS = [
  'care.plan-approve',
  'care.decide-alone',
  'care.helper-suspend',
  'health.diagnose',
  'health.treat',
  'health.prescribe',
  'health.slice-share',
  'health.record-delete',
  'child.care-change',
  'safety.escalate-close',
  'edu.credential-issue',
  'edu.kid-release',
  'place.treasury-freeze',
] as const;

export function assertCaller(caller: Caller): void {
  if (!isDid(caller.did)) throw new Error('BAD_DID');
  if (caller.kind !== 'human' && caller.kind !== 'agent') throw new Error('BAD_CALLER_KIND');
}

/** High-impact actions stop agents cold. Everything else passes with a valid caller. */
export function assertHumanFor(caller: Caller, action: string): void {
  assertCaller(caller);
  if ((AGENT_FORBIDDEN_ACTIONS as readonly string[]).includes(action) && caller.kind !== 'human') {
    throw new Error(`AGENT_BLOCKED_${action.toUpperCase().replace(/[.-]/g, '_')}`);
  }
}

/** Kernel permission check. Anything not granted stays unavailable. */
export function assertGrant(grants: Grant[], check: Check): string {
  const verdict = can(grants, check);
  if (!verdict.ok) throw new Error(`DENIED_${verdict.reason}`);
  return verdict.grantId ?? '';
}

/** Consent proof: a live grant issued BY the data owner TO this caller. */
export function assertOwnerConsent(grants: Grant[], owner: string, caller: string, targetPrefix: string, action: string, nowIso: string): string {
  const live = grants.filter((g) => g.issuer === owner && g.subject === caller && g.expires > nowIso);
  const hit = live.find((g) => g.scope.includes(action) && (g.target === targetPrefix || g.target.startsWith(`${targetPrefix}:`) || g.target === '*'));
  if (!hit) throw new Error('DENIED_NO_OWNER_CONSENT');
  return hit.id;
}

// ---------- Consent books (MiMind scopes, owner-held, revocable) ----------
export type ConsentBook = MindRecord;

export function openConsentBook(owner: string): ConsentBook {
  return createMind(owner);
}

export function grantConsent(book: ConsentBook, granter: string, reader: string, fields: string[], expiresAt: string): ConsentBook {
  if (granter !== book.owner) throw new Error('NOT_OWNER');
  const scope: ConsentScope = { reader, fields, expiresAt };
  return grantScope(book, scope);
}

export function revokeConsent(book: ConsentBook, owner: string, reader: string, fields?: string[]): ConsentBook {
  if (owner !== book.owner) throw new Error('NOT_OWNER');
  if (!fields) return { ...book, scopes: book.scopes.filter((s) => s.reader !== reader) };
  const drop = new Set(fields);
  return {
    ...book,
    scopes: book.scopes
      .map((s) => (s.reader === reader ? { ...s, fields: s.fields.filter((f) => !drop.has(f)) } : s))
      .filter((s) => s.fields.length > 0),
  };
}

export function readConsented(book: ConsentBook, reader: string, fields: Record<string, string>, nowIso: string): Record<string, string> {
  return readWithConsent({ ...book, fields }, reader, nowIso);
}

// ---------- Plain-language notices (accessibility: short, coded-free, human fallback) ----------
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

// ---------- Receipts: every consequential action explains itself in plain words ----------
export function receiptFor(
  os: LifestyleOs,
  input: Omit<ReceiptInput, 'branch' | 'os'>,
): ReceiptInput {
  assertPlain(input.explains, 500);
  return { ...input, branch: 'lifestyle', os };
}

// ---------- Bus events: references ride the bus, bodies never do ----------
type Privacy = 'public' | 'place' | 'circle' | 'private' | 'sealed';
const REFERENCE_KEYS = ['ref', 'kind', 'at', 'count', 'reason', 'label'];

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

// ---------- Scoped reads: only the consented slice leaves the record ----------
export function pick<T extends object>(record: T, fields: string[]): Partial<T> {
  const keep = new Set(fields);
  return Object.fromEntries(Object.entries(record).filter(([k]) => keep.has(k))) as Partial<T>;
}
