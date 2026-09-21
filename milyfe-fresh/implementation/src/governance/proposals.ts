// MiVote proposals + ballots. One member, one vote; ballots are secret and
// receipts prove a vote was counted without revealing it. Outcomes need the
// constitutional threshold (supermajority for money/charter changes).
export type ProposalKind = 'standard' | 'money' | 'charter';
export type ProposalState = 'open' | 'passed' | 'failed' | 'rejected-quorum';

export interface Proposal {
  id: string;
  title: string;
  kind: ProposalKind;
  state: ProposalState;
  yes: number;
  no: number;
  voters: string[]; // MiIDs that voted (counted, not how)
  closesAt: string; // ISO
}

export function openProposal(id: string, title: string, kind: ProposalKind, closesAt: string): Proposal {
  return { id, title, kind, state: 'open', yes: 0, no: 0, voters: [], closesAt };
}

export interface BallotReceipt {
  proposal: string;
  voter: string;
  counted: true;
  at: string;
}

export function castVote(p: Proposal, voter: string, choice: 'yes' | 'no', nowIso: string): { proposal: Proposal; receipt: BallotReceipt } {
  if (p.state !== 'open') throw new Error('POLL_CLOSED');
  if (nowIso > p.closesAt) throw new Error('POLL_CLOSED');
  if (p.voters.includes(voter)) throw new Error('ALREADY_VOTED');
  return {
    proposal: { ...p, yes: p.yes + (choice === 'yes' ? 1 : 0), no: p.no + (choice === 'no' ? 1 : 0), voters: [...p.voters, voter] },
    receipt: { proposal: p.id, voter, counted: true, at: nowIso },
  };
}

/** Money/charter changes need 2/3 yes; standard needs >1/2. Quorum: 10 votes. */
export function tally(p: Proposal): Proposal {
  if (p.voters.length < 10) return { ...p, state: 'rejected-quorum' };
  const bar = p.kind === 'standard' ? p.voters.length / 2 : (p.voters.length * 2) / 3;
  return { ...p, state: p.yes > bar ? 'passed' : 'failed' };
}
