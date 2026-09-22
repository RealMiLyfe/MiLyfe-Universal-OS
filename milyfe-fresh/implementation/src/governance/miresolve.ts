// MiResolve — community fix-it rooms. Notice, fair hearing, fix, appeal.
// Good-faith complaints are protected: retaliation is itself a violation.
// Criminal/court/incarceration matters route out to MiJustice/MiLegal/courts.

export type CaseState = 'open' | 'notice-sent' | 'hearing' | 'decided' | 'remedy' | 'appealed' | 'escalated' | 'closed';
export type RemedyKind = 'refund' | 'repair' | 'amends' | 'service-credit' | 'standing-note';

export interface Case {
  id: string;
  kind: 'marketplace' | 'service' | 'ban-appeal' | 'correction' | 'restorative';
  complainant: string;
  respondent: string;
  claim: string;
  state: CaseState;
  remedy?: { kind: RemedyKind; detail: string };
  retaliationGuard: true; // protection on from the moment a case opens
  openedAt: string;
  history: { at: string; event: string }[];
}

export function openCase(id: string, kind: Case['kind'], complainant: string, respondent: string, claim: string, nowIso: string): Case {
  return {
    id, kind, complainant, respondent, claim, state: 'open',
    retaliationGuard: true, openedAt: nowIso, history: [{ at: nowIso, event: 'opened' }],
  };
}

const MOVES: Record<CaseState, CaseState[]> = {
  open: ['notice-sent', 'escalated'],
  'notice-sent': ['hearing', 'escalated'],
  hearing: ['decided', 'escalated'],
  decided: ['remedy', 'appealed', 'closed'],
  remedy: ['closed', 'appealed'],
  appealed: ['hearing', 'closed', 'escalated'],
  escalated: ['closed'],
  closed: [],
};

export function moveCase(c: Case, to: CaseState, note: string, nowIso: string): Case {
  if (!MOVES[c.state].includes(to)) throw new Error(`ILLEGAL_CASE_MOVE_${c.state}_TO_${to}`.toUpperCase().replace(/-/g, '_'));
  return { ...c, state: to, history: [...c.history, { at: nowIso, event: `${c.state}→${to}: ${note}` }] };
}

export function orderRemedy(c: Case, kind: RemedyKind, detail: string, nowIso: string): Case {
  if (c.state !== 'decided') throw new Error('REMEDY_NEEDS_DECISION');
  const withRemedy: Case = { ...c, remedy: { kind, detail } };
  return moveCase(withRemedy, 'remedy', `${kind}: ${detail}`, nowIso);
}

/** Full case file, exportable by either party at any time — even mid-case. */
export function exportCaseFile(c: Case): Case {
  return JSON.parse(JSON.stringify(c)) as Case;
}
