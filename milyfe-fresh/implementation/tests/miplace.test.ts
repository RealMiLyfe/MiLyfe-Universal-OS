import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import {
  addEmergencyResource, addResource, answerComplaint, claimSurplus, completeMilestone, createPlace,
  EMERGENCY_LABEL, exportPlaceHistory, fileComplaint, freezeTreasury, joinRide, moveQuest, NOT_GOVERNMENT,
  offerRide, postAnnouncement, postQuest, postSurplus, startProject, sweepStale,
} from '@/lifestyle/miplace';
import type { Caller } from '@/lifestyle/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const APPROVAL = { by: ALICE, at: NOW, reason: 'missing funds report' };

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('miplace honesty (never a government)', () => {
  it('child policy can only stay standard or get stricter', () => {
    expect(() => createPlace('p1', HUMAN, 'Riverside', 'be kind', 'weak', ['en'])).toThrow('CHILD_POLICY_TOO_WEAK');
    expect(createPlace('p1', HUMAN, 'Riverside', 'be kind', 'strict', ['en']).childPolicy).toBe('strict');
  });
  it('every resource carries the not-a-government label', () => {
    const r = addResource('r1', HUMAN, 'p1', 'food', 'Pantry', '555-0100', NOW);
    expect(r.honesty).toBe(NOT_GOVERNMENT);
    expect(addEmergencyResource('e1', HUMAN, 'p1', 'shelter', 'go to 5th st').label).toBe(EMERGENCY_LABEL);
  });
  it('stale resources get labeled, then delisted', () => {
    const fresh = addResource('r1', HUMAN, 'p1', 'food', 'Pantry', 'x', NOW);
    const old = { ...addResource('r2', HUMAN, 'p1', 'food', 'Old', 'x', NOW), freshAsOf: '2026-02-01T00:00:00Z' };
    const ancient = { ...addResource('r3', HUMAN, 'p1', 'food', 'Gone', 'x', NOW), freshAsOf: '2024-01-01T00:00:00Z' };
    const { resources, delisted } = sweepStale([fresh, old, ancient], NOW, 90);
    expect(resources.find((r) => r.id === 'r1')?.state).toBe('listed');
    expect(resources.find((r) => r.id === 'r2')?.state).toBe('stale-labeled');
    expect(resources.find((r) => r.id === 'r3')?.state).toBe('delisted');
    expect(delisted).toEqual([{ id: 'r3', reason: 'stale too long, delisted until re-verified' }]);
  });
});

describe('miplace street life (surplus, quests, rides)', () => {
  it('surplus claims once; offline claims queue', async () => {
    const pin = postSurplus('s1', HUMAN, 'p1', 'bread', '10 loaves', 'today 6pm');
    const { pin: claimed, bus } = await claimSurplus(pin, HUMAN, 'cell-a', true);
    expect(claimed.state).toBe('claimed');
    expect(bus.mode).toBe('published');
    await expect(claimSurplus(claimed, HUMAN, 'cell-a', true)).rejects.toThrow('PIN_NOT_OPEN');
    const offline = await claimSurplus(postSurplus('s2', HUMAN, 'p1', 'soup', '5', 'today'), HUMAN, 'cell-a', false);
    expect(offline.bus.mode).toBe('queued-offline');
  });
  it('quests move posted → taken → done; rides cap seats', () => {
    let q = postQuest('q1', HUMAN, 'p1', 'fix the fence');
    expect(() => moveQuest(q, 'done')).toThrow('BAD_QUEST_MOVE');
    q = moveQuest(moveQuest(q, 'taken'), 'done');
    expect(q.state).toBe('done');
    let ride = offerRide('ride-1', HUMAN, 'p1', 'clinic', NOW, 1);
    ride = joinRide(ride, { did: tdid('rider1'), kind: 'human' });
    expect(() => joinRide(ride, { did: tdid('rider2'), kind: 'human' })).toThrow('RIDE_FULL');
    expect(() => offerRide('ride-2', HUMAN, 'p1', 'x', NOW, 99)).toThrow('BAD_SEATS');
  });
});

describe('miplace shops + projects + announcements', () => {
  it('complaints due in 7 days; late answers show a standing note', () => {
    const c = fileComplaint('c1', HUMAN, 'shop-1', 'overcharged', NOW);
    expect(c.dueAt).toBe('2026-06-08T00:00:00.000Z');
    expect(answerComplaint(c, '2026-06-02T00:00:00Z').standingNote).toBeUndefined();
    expect(answerComplaint(c, '2026-07-01T00:00:00Z').standingNote).toBe('does not answer on time');
  });
  it('treasury freezes need a human + reason', () => {
    const p = completeMilestone(startProject('pj-1', HUMAN, 'p1', 'garden', ['soil', 'seeds']), 'soil');
    expect(p.milestones[0].done).toBe(true);
    expect(() => freezeTreasury(p, AGENT, APPROVAL, 'x')).toThrow('AGENT_BLOCKED_PLACE_TREASURY_FREEZE');
    const { project, receipt } = freezeTreasury(p, HUMAN, APPROVAL, 'missing funds report');
    expect(project.frozen).toBe(true);
    expect(receipt.os).toBe('MiPlace');
  });
  it('announcements are scoped and plain', () => {
    const a = postAnnouncement('a1', HUMAN, 'p1', 'place', 'Hello day', 'Meet at the park Saturday at ten in the morning.');
    expect(a.notice.audioOffered).toBe(true);
    expect(() => postAnnouncement('a2', HUMAN, 'p1', 'place', 'x', 'See ERR_PLACE_404 soon')).toThrow('NOTICE_HAS_CODES');
  });
  it('place history exports', () => {
    const place = createPlace('p1', HUMAN, 'Riverside', 'be kind', 'standard', ['en']);
    expect(exportPlaceHistory(place, [], [], []).place.id).toBe('p1');
  });
});
