import { describe, expect, it } from 'vitest';
import {
  anchorEvidence, captureEvidence, checkReentryItem, consentPeace, openReentryPack, openRightsCase, proposePeace, settlePeace,
} from '@/governance/mijustice';

const NOW = '2026-01-01T00:00:00Z';

describe('mijustice (shield: cases, evidence, peace, reentry)', () => {
  it('rights cases open sealed or open, even against milyfe itself', () => {
    const c = openRightsCase('rc-1', 'alice', 'milyfe', 'wrong ban appeal denied', true, NOW);
    expect(c.sealed).toBe(true);
    expect(c.state).toBe('open');
  });
  it('evidence captures fresh, anchors once', () => {
    const e = captureEvidence('ev-1', 'rc-1', 'sha256:abc', NOW);
    expect(e.anchoredAt).toBeUndefined();
    const anchored = anchorEvidence(e, NOW);
    expect(anchored.anchoredAt).toBe(NOW);
    expect(() => anchorEvidence(anchored, NOW)).toThrow('ALREADY_ANCHORED');
  });
  it('peace needs both consents; broken truce ends holding', () => {
    let t = proposePeace('pt-1', 'a', 'b', '500');
    expect(() => consentPeace(t, 'stranger', NOW)).toThrow('NOT_A_PARTY');
    t = consentPeace(t, 'a', NOW);
    expect(t.state).toBe('proposed');
    t = consentPeace(t, 'b', NOW);
    expect(t.state).toBe('holding');
    expect(t.startedAt).toBe(NOW);
    expect(settlePeace(t, false).state).toBe('broken');
    expect(() => proposePeace('pt-2', 'a', 'b', '0')).toThrow('INVALID_ESCROW');
  });
  it('reentry packs check off day-one needs once each', () => {
    let p = openReentryPack('returning-member');
    p = checkReentryItem(p, 'id-help');
    p = checkReentryItem(p, 'job-board');
    expect(p.done).toEqual(['id-help', 'job-board']);
    expect(() => checkReentryItem(p, 'id-help')).toThrow('ALREADY_DONE');
  });
});
