// MiWalk: offline action classifier. Decides what happens to actions taken offline.
// NEVER auto-resolves money, guardianship, or binding ballots — those always queue
// for the human/commit path. Source: MIDATA/MINET offline maps, TRUNK-MAPS.md §6.

export type OfflineClass = 'mergeable' | 'rejectable' | 'reservable' | 'expiring' | 'human-review';

export interface OfflineAction {
  op: string;
  family: 'money' | 'identity' | 'data' | 'governance' | 'message' | 'presence' | 'market' | 'work' | 'care' | 'learn' | 'system';
  sub?: string;
}

const HUMAN_ALWAYS: Array<{ family: OfflineAction['family']; sub?: string }> = [
  { family: 'money' }, // every money op
  { family: 'identity', sub: 'guardianship' },
  { family: 'governance', sub: 'binding-ballot' },
];

export function classify(a: OfflineAction): OfflineClass {
  if (HUMAN_ALWAYS.some((h) => h.family === a.family && (!h.sub || h.sub === a.sub))) return 'human-review';
  switch (a.family) {
    case 'message':
    case 'presence':
      return 'mergeable';
    case 'data':
    case 'learn':
      return a.sub === 'delete' ? 'human-review' : 'mergeable';
    case 'market':
      return a.sub === 'order' ? 'reservable' : 'mergeable';
    case 'work':
      return a.sub === 'hours' ? 'mergeable' : 'human-review';
    case 'care':
      return a.sub === 'booking' ? 'reservable' : 'human-review';
    case 'identity':
      return a.sub === 'proof' ? 'expiring' : 'human-review';
    case 'governance':
      return 'rejectable'; // non-binding gov actions taken offline must be re-done online
    case 'system':
      return 'rejectable';
    default:
      return 'human-review'; // fail-closed: unknown families queue for humans
  }
}
