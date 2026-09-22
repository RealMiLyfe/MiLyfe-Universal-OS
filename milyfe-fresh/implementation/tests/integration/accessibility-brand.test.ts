import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { assertMlyWording, notice } from '@/finance/shared';
import { notice as lnotice } from '@/lifestyle/shared';
import { raiseEscalation } from '@/lifestyle/micare';
import { postAnnouncement } from '@/lifestyle/miplace';
import { publishStory } from '@/lifestyle/mieducation';
import { openSupportCase } from '@/finance/mimarket';
import { workerHelp } from '@/finance/miwork';
import { approveMerchant, createMerchant } from '@/finance/mimarket';

const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
const NOW = '2026-06-01T00:00:00Z';

describe('accessibility audit (every notice plain + audio + human fallback)', () => {
  it('all OS notice paths produce accessible notices', () => {
    const human = { did: tdid('member'), kind: 'human' } as const;
    const plan = { id: 'p1', receiver: tdid('r'), helpers: [], needs: [], schedule: '', respiteWindows: [], state: 'active', consentRef: 'c' } as never;
    const merchant = approveMerchant(createMerchant('m1', human, 'Shop', 'terms'), human, { by: human.did, at: NOW, reason: 'ok' });
    const notices = [
      raiseEscalation('e1', human, plan, 'missed visit', 'urgent').notice,
      postAnnouncement('a1', human, 'place-1', 'place', 'Hello day', 'Meet at the park on Saturday morning.').notice,
      publishStory(human, false),
      openSupportCase('s1', human, merchant, 'till stuck').notice,
      workerHelp('h1', human, 'not paid').notice,
      notice('Settled', 'Your money arrived and is spendable now.', 'Ask a human treasurer.'),
      lnotice('Approved', 'Your care plan is active starting today.', 'Call your coordinator.'),
    ];
    for (const n of notices) {
      expect(n.audioOffered).toBe(true);
      expect(n.humanFallback.length).toBeGreaterThan(5);
      expect(n.plain.length).toBeGreaterThan(0);
      expect(n.plain.length).toBeLessThanOrEqual(280);
      expect(n.plain).not.toMatch(/\b[A-Z]{2,}(?:_[A-Z0-9]+)+\b/);
    }
  });
});

describe('brand + public-document review (executable)', () => {
  const DOCS = join(__dirname, '..', '..', '..', 'brand-public-legal');
  const ROOTS = join(__dirname, '..', '..', '..', 'roots', 'MLY-DEFINITION.md');
  it('public docs carry no misleading MLY claims', () => {
    const files = readdirSync(DOCS).filter((f) => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(5);
    for (const f of files) {
      expect(() => assertMlyWording(readFileSync(join(DOCS, f), 'utf8'))).not.toThrow();
    }
    expect(() => assertMlyWording(readFileSync(ROOTS, 'utf8'))).not.toThrow();
  });
  it('no affirmative public-launch-ready claims anywhere in docs', () => {
    const AFFIRMATIVE = /(is|are) (now )?launch-ready|launch is approved|approved for (public )?launch|ready for (public )?launch(?! decision)/i;
    const roots = [DOCS, join(__dirname, '..', '..', '..', 'roots'), join(__dirname, '..', '..', '..', 'build-readiness')];
    for (const dir of roots) {
      for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
        const text = readFileSync(join(dir, f), 'utf8');
        // Allowed only as an explicit negation about what approval does NOT mean.
        const hits = text.split('\n').filter((line) => AFFIRMATIVE.test(line) && !/not |NOT |never |remains open|pending|no launch|NOT a launch/i.test(line));
        expect(hits).toEqual([]);
      }
    }
  });
});
