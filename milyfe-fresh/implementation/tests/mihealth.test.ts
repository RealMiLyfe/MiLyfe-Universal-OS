import { describe, expect, it } from 'vitest';
import type { Grant } from '@/kernel/scope';
import {
  connectIntegration, emergencyAccess, exportHealthRecord, grantSlice, openHealthConsent, readSlices,
  readYouthSlices, reportAggregate, requestClinical, requestRecordDeletion, revokeSlice, routeToProfessional,
  setEmergencyCard, unlinkIntegration,
} from '@/lifestyle/mihealth';
import type { Caller } from '@/lifestyle/shared';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const ALICE = tdid('alice');
const YOUTH = tdid('youth1');
const HUMAN: Caller = { did: ALICE, kind: 'human' };
const AGENT: Caller = { did: tdid('agent1'), kind: 'agent' };
const NOW = '2026-06-01T00:00:00Z';
const LATER = '2027-01-01T00:00:00Z';
const RECORDS = { allergies: 'peanuts', meds: 'inhaler', therapy: 'weekly', notes: 'private' };

describe('mihealth slices (per-slice consent, logged reads)', () => {
  it('reads return granted slices only; every read logged', () => {
    const book = grantSlice(openHealthConsent(ALICE), ALICE, 'clinic-a', ['allergies', 'meds'], LATER);
    const { slices, access } = readSlices(book, 'clinic-a', RECORDS, 'grant-1', NOW);
    expect(slices).toEqual({ allergies: 'peanuts', meds: 'inhaler' });
    expect(access).toEqual({ at: NOW, reader: 'clinic-a', slices: ['allergies', 'meds'], grantRef: 'grant-1' });
  });
  it('revocation is immediate; expired grants read nothing', () => {
    let book = grantSlice(openHealthConsent(ALICE), ALICE, 'clinic-a', ['allergies'], LATER);
    book = revokeSlice(book, ALICE, 'clinic-a');
    expect(readSlices(book, 'clinic-a', RECORDS, 'grant-1', NOW).slices).toEqual({});
    const stale = grantSlice(openHealthConsent(ALICE), ALICE, 'clinic-b', ['meds'], '2020-01-01T00:00:00Z');
    expect(readSlices(stale, 'clinic-b', RECORDS, 'grant-2', NOW).slices).toEqual({});
  });
  it('youth reads need assent + guardian permission (kernel rule)', () => {
    const base: Grant = {
      id: crypto.randomUUID(), issuer: tdid('guardian'), subject: ALICE, target: `health:record:${YOUTH}`,
      purpose: 'care', scope: ['slice-read'], expires: LATER, roles: ['child'], approval: 'guardian',
    };
    expect(() => readYouthSlices([{ ...base }], HUMAN, YOUTH, NOW)).toThrow('DENIED_NO_MATCHING_GRANT');
    const ok = readYouthSlices([{ ...base, youthAssent: true, guardianPermission: 'yes' }], HUMAN, YOUTH, NOW);
    expect(ok).toBe(base.id);
  });
});

describe('mihealth clinical boundary (refuse by default)', () => {
  it('diagnose/treat/prescribe refused without licensed authority', () => {
    expect(() => requestClinical(HUMAN, 'diagnose')).toThrow('NO_CLINICAL_AUTHORITY_DIAGNOSE');
    expect(() => requestClinical(HUMAN, 'treat', { license: '', reviewerHuman: ALICE, reviewedAt: NOW })).toThrow('NO_CLINICAL_AUTHORITY_TREAT');
    expect(() => requestClinical(HUMAN, 'prescribe')).toThrow('NO_CLINICAL_AUTHORITY_PRESCRIBE');
  });
  it('agents blocked even with authority; humans route (never perform)', () => {
    const auth = { license: 'FL-MD-123', reviewerHuman: ALICE, reviewedAt: NOW };
    expect(() => requestClinical(AGENT, 'diagnose', auth)).toThrow('AGENT_BLOCKED_HEALTH_DIAGNOSE');
    expect(requestClinical(HUMAN, 'diagnose', auth)).toEqual({ routed: true, to: 'FL-MD-123', reviewedBy: ALICE, action: 'diagnose' });
  });
});

describe('mihealth integrations + aggregates + routing', () => {
  it('links need the member; unlink confirms', () => {
    expect(() => connectIntegration('l1', HUMAN, tdid('other'), 'clinic', ['meds'], 'c1')).toThrow('NOT_OWNER');
    const { link, receipt } = connectIntegration('l1', HUMAN, ALICE, 'clinic-a', ['meds'], 'consent-1');
    expect(link.state).toBe('linked');
    expect(receipt.os).toBe('MiHealth');
    const out = unlinkIntegration(link, HUMAN, NOW);
    expect(out.link.state).toBe('unlinked');
    expect(() => unlinkIntegration(out.link, HUMAN, NOW)).toThrow('ALREADY_UNLINKED');
  });
  it('aggregates need groups of 10+ and strip individuals', () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({ zip: '32201', visits: '2', name: `person-${i}` }));
    expect(() => reportAggregate(rows.slice(0, 9), ['zip'])).toThrow('GROUP_TOO_SMALL');
    const rep = reportAggregate(rows, ['zip', 'visits']);
    expect(rep.count).toBe(12);
    expect(rep.rows[0]).toEqual({ zip: '32201', visits: '2' });
  });
  it('routing is privilege-sealed', () => {
    expect(routeToProfessional('r1', HUMAN, 'rash', 'US-FL', NOW).privileged).toBe(true);
  });
});

describe('mihealth emergency card + export + deletion', () => {
  it('member-chosen card works offline; emergency access is logged + flagged', () => {
    const card = setEmergencyCard(HUMAN, { allergies: 'peanuts' });
    expect(card.offline).toBe(true);
    expect(() => emergencyAccess(card, HUMAN, '', NOW)).toThrow('REASON_REQUIRED');
    const acc = emergencyAccess(card, { did: tdid('responder'), kind: 'human' }, 'unresponsive at park', NOW);
    expect(acc.needsReview).toBe(true);
    expect(acc.card.fields).toEqual({ allergies: 'peanuts' });
  });
  it('full record + access log export; deletion needs human owner + approval', () => {
    expect(exportHealthRecord(RECORDS, []).records).toEqual(RECORDS);
    expect(() => requestRecordDeletion(AGENT, ALICE, { by: ALICE, at: NOW, reason: 'x' })).toThrow('AGENT_BLOCKED_HEALTH_RECORD_DELETE');
    expect(() => requestRecordDeletion(HUMAN, tdid('other'), { by: ALICE, at: NOW, reason: 'x' })).toThrow('NOT_OWNER');
    expect(requestRecordDeletion(HUMAN, ALICE, { by: ALICE, at: NOW, reason: 'leaving' }).status).toBe('approved');
  });
});
