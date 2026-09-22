import { describe, expect, it } from 'vitest';
import {
  assertKidSafe, disputeCredential, draftPath, enroll, exportLearningRecord, issueCredential, matchMentor,
  moveMentorship, publishPath, publishStory, recordMilestone, revokeCredential, savePack, startProgress,
  syncProgress, teacherSlice, verifyCredential,
} from '@/lifestyle/mieducation';
import type { Caller } from '@/lifestyle/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'path reviewed' };
const AUTHORITY = { issuer: 'street-school', authorizedBy: ALICE, scopes: ['first-aid'], at: NOW };

function publishedPath() {
  return publishPath(draftPath('path-1', HUMAN, 'First aid', ['basics', 'practice']), HUMAN, APPROVAL);
}

describe('mieducation paths + enrollment + progress', () => {
  it('publishing needs a human + approval; youth enroll via grown-up', () => {
    const draft = draftPath('path-1', HUMAN, 'First aid', ['basics']);
    expect(() => publishPath(draft, AGENT, APPROVAL)).toThrow('PUBLISH_NEEDS_HUMAN');
    expect(() => enroll('e1', HUMAN, draft, ALICE, false)).toThrow('PATH_NOT_PUBLISHED');
    const path = publishPath(draft, HUMAN, APPROVAL);
    expect(() => enroll('e1', HUMAN, path, tdid('kid1'), true)).toThrow('YOUTH_NEEDS_GROWNUP');
    expect(enroll('e1', HUMAN, path, tdid('kid1'), true, ALICE).grownUp).toBe(ALICE);
  });
  it('progress belongs to the learner; teachers see counts only', () => {
    let p = startProgress(ALICE, 'path-1', NOW);
    expect(() => recordMilestone(p, { did: tdid('other'), kind: 'human' }, 'basics', NOW)).toThrow('NOT_LEARNER');
    p = recordMilestone(p, HUMAN, 'basics', NOW);
    expect(() => recordMilestone(p, HUMAN, 'basics', NOW)).toThrow('MILESTONE_DONE');
    expect(teacherSlice(p, ['someone-else'])).toBeNull();
    expect(teacherSlice(p, [ALICE])).toEqual({ learner: ALICE, milestones: 1 });
  });
  it('offline packs save on device; wrong-path sync refused', () => {
    const p = startProgress(ALICE, 'path-1', NOW);
    const pack = savePack('path-1', 'v3', NOW);
    expect(() => syncProgress(p, savePack('other-path', 'v1', NOW), NOW)).toThrow('PACK_PATH_MISMATCH');
    expect(syncProgress(p, pack, NOW).syncedAt).toBe(NOW);
  });
  it('mentorship matches honestly, ends cleanly', () => {
    expect(() => matchMentor('m1', HUMAN, ALICE, ALICE, 'x')).toThrow('SELF_MENTOR');
    const m = moveMentorship(matchMentor('m1', HUMAN, tdid('mentor'), ALICE, 'first aid'), 'active');
    expect(moveMentorship(m, 'ended').state).toBe('ended');
  });
});

describe('mieducation credentials (issuer authority or nothing)', () => {
  it('issuing needs a human + authorized issuer + signature', () => {
    const path = publishedPath();
    void path;
    expect(() => issueCredential('c1', AGENT, ALICE, 'first-aid', 'ev-1', AUTHORITY, 'sig')).toThrow('AGENT_BLOCKED_EDU_CREDENTIAL_ISSUE');
    expect(() => issueCredential('c1', HUMAN, ALICE, 'brain-surgery', 'ev-1', AUTHORITY, 'sig')).toThrow('ISSUER_NOT_AUTHORIZED');
    expect(() => issueCredential('c1', HUMAN, ALICE, 'first-aid', 'ev-1', AUTHORITY, '')).toThrow('SIGNATURE_REQUIRED');
    const { credential, receipt } = issueCredential('c1', HUMAN, ALICE, 'first-aid', 'ev-1', AUTHORITY, 'sig-abc');
    expect(credential.state).toBe('issued');
    expect(receipt.os).toBe('MiEducation');
  });
  it('verification checks issuer + revocation + signature; never a score', () => {
    const { credential } = issueCredential('c1', HUMAN, ALICE, 'first-aid', 'ev-1', AUTHORITY, 'sig-abc');
    expect(verifyCredential(credential, [], ['other-school'])).toEqual({ valid: false, reason: 'UNKNOWN_ISSUER' });
    expect(verifyCredential(credential, ['c1'], ['street-school'])).toEqual({ valid: false, reason: 'REVOKED' });
    const good = verifyCredential(credential, [], ['street-school']);
    expect(good).toEqual({ valid: true, badge: 'first-aid', issuer: 'street-school' });
    expect(good).not.toHaveProperty('score');
  });
  it('revocation needs due process + appeal window; disputes stay open', () => {
    const { credential } = issueCredential('c1', HUMAN, ALICE, 'first-aid', 'ev-1', AUTHORITY, 'sig-abc');
    expect(() => revokeCredential(credential, AGENT, { reason: 'x', decidedBy: ALICE, appealUntil: LATER_SAFE })).toThrow('REVOKE_NEEDS_HUMAN');
    const out = revokeCredential(credential, HUMAN, { reason: 'cheating evidence', decidedBy: ALICE, appealUntil: '2026-07-01T00:00:00Z' });
    expect(out.credential.state).toBe('revoked');
    expect(disputeCredential('d1', HUMAN, credential, 'that was not me').state).toBe('open');
  });
  const LATER_SAFE = '2026-07-01T00:00:00Z';
});

describe('mieducation kid mode', () => {
  it('no money on kid surfaces; no public story without a grown-up', () => {
    expect(() => assertKidSafe({ price: '5' })).toThrow('KID_NO_MONEY_PRICE');
    expect(() => assertKidSafe({ mly: '1' })).toThrow('KID_NO_MONEY_MLY');
    expect(() => assertKidSafe({ lesson: 'counting' })).not.toThrow();
    expect(() => publishStory(HUMAN, true)).toThrow('GROWNUP_REQUIRED');
    expect(publishStory(HUMAN, true, APPROVAL).audioOffered).toBe(true);
  });
  it('learning record exports whole', () => {
    const path = publishedPath();
    const e = enroll('e1', HUMAN, path, ALICE, false);
    expect(exportLearningRecord([e], [], []).enrollments).toHaveLength(1);
  });
});
