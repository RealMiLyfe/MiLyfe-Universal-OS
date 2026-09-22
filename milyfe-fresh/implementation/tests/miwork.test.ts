import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import { emptyRegistry, registerDevice } from '@/trunk/midevice';
import {
  careContributionToClaim, claimPayout, closeOpportunity, draftAgreement, endAgreement, escalateWorkDispute,
  exportWorkHistory, flagTerms, logContribution, matchCredential, moveClaim, openWorkDispute,
  postOpportunity, signAgreement, verifyContribution, workerHelp, EXTERNAL_REVIEW_NOTE,
} from '@/finance/miwork';
import type { Caller } from '@/finance/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const NOW = '2026-06-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'checked the work' };

function registry() {
  return registerDevice(emptyRegistry(), ALICE, 'phone-1', 'phone', NOW);
}

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('miwork opportunities + credential matching', () => {
  it('posts, matches credentials by reference, closes with notice', () => {
    const o = postOpportunity('op-1', HUMAN, 'gig', 'Fix fence', '200', ['carpentry']);
    expect(matchCredential(o, 'cred-1', 'street-school', ['carpentry'])).toEqual({ match: true, missing: [] });
    expect(matchCredential(o, 'cred-1', 'street-school', ['baking']).match).toBe(false);
    expect(() => matchCredential(o, '', 'street-school', [])).toThrow('CREDENTIAL_REF_REQUIRED');
    expect(closeOpportunity(o, HUMAN, true).state).toBe('filled');
  });
});

describe('miwork agreements (relationship stated, never assumed)', () => {
  it('every agreement states its relationship + review note, dual-signed', () => {
    const o = postOpportunity('op-1', HUMAN, 'gig', 'Fix fence', '200', ['carpentry']);
    const a = draftAgreement('a1', HUMAN, o, tdid('worker'), 'contractor', 'weekends', 'gloves + goggles provided', false, 'gig');
    expect(a.relationship).toBe('contractor');
    expect(a.reviewNote).toBe(EXTERNAL_REVIEW_NOTE);
    const one = signAgreement(a, HUMAN);
    expect(one.state).toBe('draft');
    // Poster is ALICE here; worker signs second.
    const worker: Caller = { did: tdid('worker'), kind: 'human' };
    const a2 = { ...a, worker: tdid('worker') };
    const signed = signAgreement(signAgreement(a2, HUMAN), worker);
    expect(signed.state).toBe('signed');
    expect(one.signatures).toContain(ALICE);
    expect(endAgreement(signed, worker, false).state).toBe('ended');
  });
  it('youth fenced: apprenticeships + guardian only; child labor never', () => {
    const o = postOpportunity('op-1', HUMAN, 'job', 'Night hauling', '500', []);
    expect(() => draftAgreement('a1', HUMAN, o, tdid('kid'), 'employee', 'nights', 'none', true, 'job', APPROVAL)).toThrow('YOUTH_WORK_BLOCKED');
    const app = postOpportunity('op-2', HUMAN, 'apprenticeship', 'Learn baking', '50', []);
    expect(() => draftAgreement('a2', HUMAN, app, tdid('kid'), 'volunteer', 'days', 'supervised', true, 'apprenticeship')).toThrow('YOUTH_NEEDS_GUARDIAN');
    const ok = draftAgreement('a2', HUMAN, app, tdid('kid'), 'volunteer', 'days', 'supervised kitchen', true, 'apprenticeship', APPROVAL);
    expect(ok.youth).toBe(true);
  });
  it('terms get flagged (pay, safety, unclassified) with a human route', () => {
    const o = postOpportunity('op-1', HUMAN, 'gig', 'Haul bricks', '20', []);
    const a = draftAgreement('a1', HUMAN, o, tdid('w'), 'unclassified-pending-review', 'now', 'x', false, 'gig');
    const { flags, route } = flagTerms(a, '200');
    expect(flags).toContain('below-norm pay');
    expect(flags).toContain('relationship unclassified — review before starting');
    expect(route).toContain('labor clinic');
  });
});

describe('miwork verification (device-attested, human-verified)', () => {
  function signedAgreement() {
    const o = postOpportunity('op-1', HUMAN, 'gig', 'Fix fence', '200', ['carpentry']);
    const worker: Caller = { did: ALICE, kind: 'human' };
    const a = draftAgreement('a1', HUMAN, o, ALICE, 'contractor', 'weekends', 'gloves provided', false, 'gig');
    // Poster ALICE + worker ALICE coincide in this drill; sign once as both sides present.
    return signAgreement({ ...a, worker: ALICE }, worker);
  }
  it('unverified devices rejected; humans verify logged work', () => {
    const a = { ...signedAgreement(), state: 'signed' as const, signatures: [ALICE] };
    expect(() => logContribution('c1', HUMAN, registry(), a, 'delivery', 'fence fixed', '8', 'ghost-phone')).toThrow('UNVERIFIED_DEVICE');
    const c = logContribution('c1', HUMAN, registry(), a, 'delivery', 'fence fixed with photos', '8', 'phone-1');
    expect(() => verifyContribution(c, { did: tdid('agent1'), kind: 'agent' }, APPROVAL)).toThrow('VERIFY_NEEDS_HUMAN');
    expect(verifyContribution(c, HUMAN, APPROVAL).state).toBe('verified');
  });
  it('recruitment is not work; rewards need evidence + verified labor', () => {
    const a = { ...signedAgreement(), state: 'signed' as const, signatures: [ALICE] };
    const recruit = verifyContribution(logContribution('c9', HUMAN, registry(), a, 'recruit', 'signed up 5 friends', '1', 'phone-1'), HUMAN, APPROVAL);
    expect(() => claimPayout('p9', HUMAN, recruit, '100', 'ev-9')).toThrow('RECRUITMENT_NOT_WORK');
    const real = verifyContribution(logContribution('c1', HUMAN, registry(), a, 'delivery', 'fence fixed', '8', 'phone-1'), HUMAN, APPROVAL);
    expect(() => claimPayout('p1', HUMAN, real, '200', '')).toThrow('NO_EVIDENCE_NO_REWARD');
    const claim = claimPayout('p1', HUMAN, real, '200', 'photo-set-1');
    expect(claim.state).toBe('pending');
    expect(() => moveClaim(claim, 'settled', HUMAN)).toThrow('ILLEGAL_CLAIM_MOVE');
    const v = moveClaim(claim, 'verified', HUMAN);
    expect(() => moveClaim(v, 'settled', { did: tdid('agent1'), kind: 'agent' })).toThrow('AGENT_BLOCKED_WORK_PAYOUT_APPROVE');
    expect(moveClaim(v, 'settled', HUMAN).state).toBe('settled');
  });
  it('care support converts to claims only with human approval', () => {
    expect(() => careContributionToClaim('cc1', { did: tdid('agent1'), kind: 'agent' }, 'care-1', ALICE, '50', APPROVAL)).toThrow('AGENT_BLOCKED_WORK_REWARD_APPROVE');
    const claim = careContributionToClaim('cc1', HUMAN, 'care-1', ALICE, '50', APPROVAL);
    expect(claim.evidenceRef).toBe('care-1');
  });
});

describe('miwork disputes + support + export', () => {
  it('disputes escalate to MiResolve; help is plain + human', async () => {
    const o = postOpportunity('op-1', HUMAN, 'gig', 'Fix fence', '200', []);
    const a = signAgreement({ ...draftAgreement('a1', HUMAN, o, ALICE, 'contractor', 'w', 'safe', false, 'gig'), worker: ALICE }, HUMAN);
    const d = openWorkDispute('d1', HUMAN, a, 'poster vanished');
    const out = await escalateWorkDispute(d, HUMAN, 'cell-a', true);
    expect(out.dispute.state).toBe('escalated');
    expect((await db.events.toArray())[0].family).toBe('resolve');
    expect(workerHelp('h1', HUMAN, 'not paid').notice.audioOffered).toBe(true);
  });
  it('work history exports whole', () => {
    expect(exportWorkHistory([], [], []).claims).toEqual([]);
  });
});
