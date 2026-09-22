import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { __resetBusForTests, db } from '@/kernel';
import {
  CHORUS_CAP_PCT, FORBIDDEN_LEASE_SCOPES, chorusCapOk, issueLease, leaseValid, registerSkill, revokeLease,
} from '@/trunk/miagent';
import { activeDevices, emptyRegistry, registerDevice, revokeDevice } from '@/trunk/midevice';
import { AGENT_FORBIDDEN_ACTIONS, assertHumanFor as assertHumanL } from '@/lifestyle/shared';
import { FINANCE_FORBIDDEN, assertHumanFor as assertHumanF } from '@/finance/shared';
import { draftAgreement, logContribution, postOpportunity, signAgreement } from '@/finance/miwork';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const NOW = '2026-06-01T00:00:00Z';

beforeEach(async () => {
  __resetBusForTests();
  await db.outbox.clear();
  await db.docs.clear();
  await db.events.clear();
  await db.kv.clear();
});

describe('agent leases (purpose-bound, expiring, revocable)', () => {
  it('skills register; forbidden capabilities refused', async () => {
    await registerSkill({ id: 'tutor', version: '1', owner: tdid('school'), risk: 'ordinary', capabilities: ['edu.tutor'], tools: [] });
    await expect(registerSkill({ id: 'evil', version: '1', owner: tdid('x'), risk: 'financial', capabilities: ['money.move-alone'], tools: [] })).rejects.toThrow('SKILL_FORBIDDEN_SCOPE');
    expect(FORBIDDEN_LEASE_SCOPES).toContain('child.gate-change');
  });
  it('leases issue, expire, and revoke', async () => {
    await issueLease({ id: 'lease-1', agent: tdid('agent1'), skill: 'tutor@1', goal: 'teach', scope: ['edu.tutor'], expires: '2027-01-01T00:00:00Z', receipt: 'r1' });
    expect(await leaseValid('lease-1', NOW)).toBe(true);
    expect(await leaseValid('lease-1', '2028-01-01T00:00:00Z')).toBe(false);
    await revokeLease('lease-1');
    expect(await leaseValid('lease-1', NOW)).toBe(false);
    await expect(issueLease({ id: 'lease-2', agent: tdid('a'), skill: 's', goal: 'g', scope: ['kill-switch'], expires: '2027-01-01T00:00:00Z', receipt: 'r' })).rejects.toThrow('LEASE_FORBIDDEN_SCOPE');
  });
  it('helper chorus capped at 5%', () => {
    expect(CHORUS_CAP_PCT).toBe(5);
    expect(chorusCapOk(5, 100)).toBe(true);
    expect(chorusCapOk(6, 100)).toBe(false);
  });
});

describe('agent boundaries hold across lifestyle + finance', () => {
  it('agents blocked on all 28 high-impact actions; humans pass', () => {
    const agent = { did: tdid('agent9'), kind: 'agent' } as const;
    const human = { did: tdid('human9'), kind: 'human' } as const;
    expect(AGENT_FORBIDDEN_ACTIONS.length + FINANCE_FORBIDDEN.length).toBe(28);
    for (const a of AGENT_FORBIDDEN_ACTIONS) {
      expect(() => assertHumanL(agent, a)).toThrow(/^AGENT_BLOCKED_/);
      expect(() => assertHumanL(human, a)).not.toThrow();
    }
    for (const a of FINANCE_FORBIDDEN) {
      expect(() => assertHumanF(agent, a)).toThrow(/^AGENT_BLOCKED_/);
      expect(() => assertHumanF(human, a)).not.toThrow();
    }
  });
});

describe('device boundaries (attested work only)', () => {
  it('revoked devices cannot attest contributions', () => {
    const worker = { did: tdid('worker'), kind: 'human' } as const;
    const poster = { did: tdid('poster'), kind: 'human' } as const;
    let reg = registerDevice(emptyRegistry(), worker.did, 'phone-1', 'phone', NOW);
    expect(activeDevices(reg, worker.did)).toHaveLength(1);
    const opp = postOpportunity('op-1', poster, 'gig', 'Move boxes', '100', []);
    let agreement = draftAgreement('a1', poster, opp, worker.did, 'contractor', 'sat', 'gloves', false, 'gig');
    agreement = signAgreement(signAgreement(agreement, poster), worker);
    expect(logContribution('c1', worker, reg, agreement, 'delivery', 'done', '4', 'phone-1').device).toBe('phone-1');
    reg = revokeDevice(reg, worker.did, 'phone-1', NOW);
    expect(activeDevices(reg, worker.did)).toHaveLength(0);
    expect(() => logContribution('c2', worker, reg, agreement, 'delivery', 'done', '4', 'phone-1')).toThrow('UNVERIFIED_DEVICE');
  });
});
