'use client';
import { useState } from 'react';
import { Btn, Card, NOW, Out, human, tdid } from './kit';
import { castVote, openProposal, tally } from '@/governance/proposals';
import { checkEnable } from '@/governance/milegal';
import { moveCase, openCase, orderRemedy } from '@/governance/miresolve';
import { consentPeace, proposePeace, settlePeace } from '@/governance/mijustice';

export function VoteDemo() {
  const [p, setP] = useState(() => openProposal('p1', 'Fix the park', 'standard', '2026-07-01T00:00:00Z'));
  const [msg, setMsg] = useState('A proposal is open. Add votes, then tally.');
  const vote = (choice: 'yes' | 'no', n: number) => {
    try {
      let next = p;
      for (let i = 0; i < n; i++) {
        const vid = tdid(`jv${choice}${next.voters.length}`);
        next = castVote(next, vid, choice, NOW).proposal;
      }
      setP(next);
      setMsg(`${next.voters.length} votes in: ${next.yes} yes, ${next.no} no.`);
    } catch (e) {
      setMsg(`Blocked: ${(e as Error).message}`);
    }
  };
  return (
    <Card os="Governance OS" title="Vote on a proposal">
      <p>{msg}</p>
      <div><Btn onClick={() => vote('yes', 9)}>Add 9 yes</Btn><Btn onClick={() => vote('no', 3)}>Add 3 no</Btn>
        <Btn onClick={() => setP(tally(p))}>Tally</Btn></div>
      <Out>{`state: ${p.state} (needs 10+ votes to count)`}</Out>
    </Card>
  );
}

export function LegalDemo() {
  const [consent, setConsent] = useState(true);
  const [risk, setRisk] = useState(1);
  const profiles = [{ jurisdiction: 'US-FL', capability: 'mimarket-sell', allowed: true, ceiling: 2, freshAsOf: '2026-05-01T00:00:00Z' }];
  const r = checkEnable(profiles, 'mimarket-sell', risk, consent, NOW);
  return (
    <Card os="MiLegal" title="Can this shop sell here?">
      <label className="mr-4"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> shop consents</label>
      <label>Risk class: <select value={risk} onChange={(e) => setRisk(Number(e.target.value))} className="rounded border px-1 dark:bg-gray-800"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></label>
      <Out>{r.allowed ? 'ALLOWED — all profiles say yes' : `DENIED — ${r.reason}`}</Out>
    </Card>
  );
}

export function ResolveDemo() {
  const [c, setC] = useState(() => openCase('case-1', 'marketplace', tdid('buyer'), tdid('shop'), 'never arrived', NOW));
  const step = () => {
    try {
      if (c.state === 'decided') setC(orderRemedy(c, 'refund', '250 MLY to buyer', NOW));
      else if (c.state === 'open') setC(moveCase(c, 'notice-sent', 'seller notified', NOW));
      else if (c.state === 'notice-sent') setC(moveCase(c, 'hearing', 'panel seated', NOW));
      else if (c.state === 'hearing') setC(moveCase(c, 'decided', 'refund owed', NOW));
      else if (c.state === 'remedy') setC(moveCase(c, 'closed', 'refund posted', NOW));
    } catch { /* terminal */ }
  };
  return (
    <Card os="MiResolve" title="Walk a fix-it case">
      <Btn onClick={step} disabled={c.state === 'closed'}>Next step</Btn>
      <Out>{`state: ${c.state}${c.remedy ? `\nremedy: ${c.remedy.kind} — ${c.remedy.detail}` : ''}\nretaliation guard: ON`}</Out>
    </Card>
  );
}

export function JusticeDemo() {
  const [t, setT] = useState(() => proposePeace('pt-1', 'neighbor-a', 'neighbor-b', '500'));
  const [msg, setMsg] = useState('A 30-day truce is proposed. Both sides must agree.');
  return (
    <Card os="MiJustice" title="Make a peace term">
      <p>{msg}</p>
      <div>
        <Btn onClick={() => { setT(consentPeace(t, 'neighbor-a', NOW)); setMsg('A agreed. Waiting on B.'); }} disabled={t.consentedBy.includes('neighbor-a') || t.state !== 'proposed'}>A agrees</Btn>
        <Btn onClick={() => { setT(consentPeace(t, 'neighbor-b', NOW)); setMsg('Both agreed — truce holding, escrow locked.'); }} disabled={t.consentedBy.includes('neighbor-b') || t.state !== 'proposed'}>B agrees</Btn>
        <Btn onClick={() => { setT(settlePeace(t, true)); setMsg('Truce kept — escrow returns.'); }} disabled={t.state !== 'holding'}>Kept</Btn>
        <Btn onClick={() => { setT(settlePeace(t, false)); setMsg('Truce broken — escrow goes to the community pot.'); }} disabled={t.state !== 'holding'}>Broken</Btn>
      </div>
      <Out>{`state: ${t.state} · escrow: ${t.escrowMinor} MLY`}</Out>
    </Card>
  );
}
