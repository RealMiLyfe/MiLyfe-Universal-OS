// Governance OS — delegations. "Vote for me on this topic until this date."
// Topic-specific, time-limited, instantly revocable, max 3 hops, and cycles
// are refused (A→B→A can never form).
export interface Delegation {
  from: string; // MiID giving the vote
  to: string; // MiID receiving it
  topic: string; // e.g. 'treasury', 'street-rules'
  expiresAt: string; // ISO — delegation always ends
  revokedAt?: string;
}

export function grantDelegation(book: Delegation[], from: string, to: string, topic: string, expiresAt: string): Delegation[] {
  if (from === to) throw new Error('SELF_DELEGATION');
  return [...book, { from, to, topic, expiresAt }];
}

export function revokeDelegation(book: Delegation[], from: string, to: string, topic: string, nowIso: string): Delegation[] {
  return book.map((d) =>
    d.from === from && d.to === to && d.topic === topic && !d.revokedAt ? { ...d, revokedAt: nowIso } : d,
  );
}

function live(book: Delegation[], topic: string, nowIso: string): Delegation[] {
  return book.filter((d) => d.topic === topic && !d.revokedAt && d.expiresAt > nowIso);
}

/** Follow the chain from a voter. Refuses cycles; stops after 3 hops. */
export function resolveDelegate(book: Delegation[], voter: string, topic: string, nowIso: string): string {
  const edges = live(book, topic, nowIso);
  const seen = new Set<string>([voter]);
  let current = voter;
  for (let hop = 0; hop < 3; hop++) {
    const next = edges.find((d) => d.from === current);
    if (!next) return current;
    if (seen.has(next.to)) throw new Error('DELEGATION_CYCLE');
    seen.add(next.to);
    current = next.to;
  }
  return current;
}
