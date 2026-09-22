// MiEducation — free learning for life: paths, classes, mentorship,
// issuer-signed credentials. No universal reputation scores — progress is
// the learner's, and no credential exists without an authorized issuer.
import {
  assertCaller, assertHumanFor, notice, receiptFor,
  type Caller, type HumanApproval, type Notice,
} from './shared';

// ---------- Paths + enrollment (youth enroll through a grown-up) ----------
export interface Path {
  id: string;
  title: string;
  steps: string[];
  state: 'draft' | 'published';
}

export function draftPath(id: string, caller: Caller, title: string, steps: string[]): Path {
  assertCaller(caller);
  return { id, title, steps, state: 'draft' };
}

export function publishPath(p: Path, caller: Caller, approval: HumanApproval): Path {
  assertCaller(caller);
  if (caller.kind !== 'human') throw new Error('PUBLISH_NEEDS_HUMAN');
  if (p.state === 'published') throw new Error('ALREADY_PUBLISHED');
  if (!approval.by || !approval.reason) throw new Error('APPROVAL_INCOMPLETE');
  return { ...p, state: 'published' };
}

export interface Enrollment {
  id: string;
  path: string;
  learner: string;
  youth: boolean;
  grownUp?: string;
  state: 'enrolled' | 'paused' | 'done' | 'withdrawn';
}

export function enroll(id: string, caller: Caller, path: Path, learner: string, youth: boolean, grownUp?: string): Enrollment {
  assertCaller(caller);
  if (path.state !== 'published') throw new Error('PATH_NOT_PUBLISHED');
  if (youth && !grownUp) throw new Error('YOUTH_NEEDS_GROWNUP');
  return { id, path: path.id, learner, youth, grownUp, state: 'enrolled' };
}

// ---------- Progress (learner's own; teachers see class slices only) ----------
export interface Progress {
  learner: string;
  path: string;
  milestones: { name: string; at: string }[];
  deviceSavedAt: string;
  syncedAt?: string;
}

export function startProgress(learner: string, path: string, nowIso: string): Progress {
  return { learner, path, milestones: [], deviceSavedAt: nowIso };
}

export function recordMilestone(p: Progress, caller: Caller, name: string, nowIso: string): Progress {
  assertCaller(caller);
  if (caller.did !== p.learner) throw new Error('NOT_LEARNER');
  if (p.milestones.some((m) => m.name === name)) throw new Error('MILESTONE_DONE');
  return { ...p, milestones: [...p.milestones, { name, at: nowIso }], deviceSavedAt: nowIso };
}

/** Teachers see only their class's slice: names + milestone counts, nothing else. */
export function teacherSlice(p: Progress, classLearners: string[]): { learner: string; milestones: number } | null {
  if (!classLearners.includes(p.learner)) return null;
  return { learner: p.learner, milestones: p.milestones.length };
}

// ---------- Offline packs (full path on device; sync later, honestly) ----------
export interface OfflinePack {
  path: string;
  version: string;
  savedAt: string;
}

export function savePack(path: string, version: string, nowIso: string): OfflinePack {
  return { path, version, savedAt: nowIso };
}

export function syncProgress(p: Progress, pack: OfflinePack, nowIso: string): Progress {
  if (pack.path !== p.path) throw new Error('PACK_PATH_MISMATCH');
  return { ...p, syncedAt: nowIso };
}

// ---------- Mentorship ----------
export type MentorState = 'matched' | 'active' | 'ended';

export interface Mentorship {
  id: string;
  mentor: string;
  learner: string;
  goal: string;
  state: MentorState;
}

export function matchMentor(id: string, caller: Caller, mentor: string, learner: string, goal: string): Mentorship {
  assertCaller(caller);
  if (mentor === learner) throw new Error('SELF_MENTOR');
  return { id, mentor, learner, goal, state: 'matched' };
}

export function moveMentorship(m: Mentorship, to: MentorState): Mentorship {
  const ok: Record<MentorState, MentorState[]> = { matched: ['active', 'ended'], active: ['ended'], ended: [] };
  if (!ok[m.state].includes(to)) throw new Error('BAD_MENTOR_MOVE');
  return { ...m, state: to };
}

// ---------- Credentials (issuer authority or nothing; disputes never silent) ----------
export interface IssuerAuthority {
  issuer: string;
  authorizedBy: string;
  scopes: string[];
  at: string;
}

export type CredentialState = 'issued' | 'revoked';

export interface Credential {
  id: string;
  learner: string;
  badge: string;
  issuer: string;
  evidenceRef: string;
  signature: string;
  state: CredentialState;
}

export function issueCredential(
  id: string, caller: Caller, learner: string, badge: string, evidenceRef: string, authority: IssuerAuthority, signature: string,
) {
  assertHumanFor(caller, 'edu.credential-issue');
  if (!authority.authorizedBy || !authority.scopes.includes(badge)) throw new Error('ISSUER_NOT_AUTHORIZED');
  if (!signature) throw new Error('SIGNATURE_REQUIRED');
  const credential: Credential = { id, learner, badge, issuer: authority.issuer, evidenceRef, signature, state: 'issued' };
  const receipt = receiptFor('MiEducation', {
    actor: caller.did, purpose: `Issue credential ${badge} to ${learner}`, capability: 'edu.credential-issue',
    approval: { by: authority.authorizedBy, role: 'issuer', scope: badge, reason: 'requirements met' },
    impact: { other: `credential ${id} issued` }, status: 'executed',
    correction: { path: 'Credential disputes go through appeal, never silent revoke', route: 'edu.credential-dispute' },
    explains: `You earned the ${badge} credential from ${authority.issuer}. It is yours to keep and show anywhere.`,
  });
  return { credential, receipt };
}

export function verifyCredential(c: Credential, revocationList: string[], knownIssuers: string[]) {
  if (!knownIssuers.includes(c.issuer)) return { valid: false as const, reason: 'UNKNOWN_ISSUER' };
  if (revocationList.includes(c.id)) return { valid: false as const, reason: 'REVOKED' };
  if (!c.signature) return { valid: false as const, reason: 'NO_SIGNATURE' };
  return { valid: true as const, badge: c.badge, issuer: c.issuer };
}

export interface RevokeProcess {
  reason: string;
  decidedBy: string;
  appealUntil: string;
}

export function revokeCredential(c: Credential, caller: Caller, process: RevokeProcess) {
  assertCaller(caller);
  if (caller.kind !== 'human') throw new Error('REVOKE_NEEDS_HUMAN');
  if (c.state === 'revoked') throw new Error('ALREADY_REVOKED');
  if (!process.reason || !process.decidedBy || !process.appealUntil) throw new Error('PROCESS_INCOMPLETE');
  const receipt = receiptFor('MiEducation', {
    actor: caller.did, purpose: `Revoke credential ${c.id}`, capability: 'edu.credential-revoke',
    approval: { by: process.decidedBy, role: 'issuer', scope: c.badge, reason: process.reason },
    impact: { other: `credential ${c.id} revoked, appeal open until ${process.appealUntil}` }, status: 'executed',
    correction: { path: 'Appeal before the window ends', route: 'edu.credential-dispute' },
    explains: `The ${c.badge} credential was revoked because: ${process.reason}. You can appeal until ${process.appealUntil}.`,
  });
  return { credential: { ...c, state: 'revoked' as const }, receipt };
}

export interface CredentialDispute {
  id: string;
  credential: string;
  by: string;
  text: string;
  state: 'open' | 'upheld' | 'overturned';
}

export function disputeCredential(id: string, caller: Caller, credential: Credential, text: string): CredentialDispute {
  assertCaller(caller);
  return { id, credential: credential.id, by: caller.did, text, state: 'open' };
}

// ---------- Kid mode (no money, no public story without a grown-up) ----------
export function publishStory(caller: Caller, isYouth: boolean, grownUpApproval?: HumanApproval): Notice {
  assertCaller(caller);
  if (isYouth && !grownUpApproval?.by) throw new Error('GROWNUP_REQUIRED');
  return notice('Story shared', 'Your story is shared with your class. Only your class can see it.', 'Ask your teacher or grown-up for help.');
}

export function assertKidSafe(content: Record<string, unknown>): void {
  const banned = ['price', 'mly', 'payment', 'card'];
  for (const k of Object.keys(content)) {
    if (banned.includes(k.toLowerCase())) throw new Error(`KID_NO_MONEY_${k.toUpperCase()}`);
  }
}

export function exportLearningRecord(enrollments: Enrollment[], progress: Progress[], credentials: Credential[]) {
  return JSON.parse(JSON.stringify({ enrollments, progress, credentials })) as {
    enrollments: Enrollment[]; progress: Progress[]; credentials: Credential[];
  };
}
