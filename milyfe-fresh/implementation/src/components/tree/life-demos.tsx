'use client';
import { useState } from 'react';
import { Btn, Card, LATER, NOW, Out, approval, human, tdid } from './kit';
import { addHelper, approvePlan, bookRespite, draftPlan, markBooking } from '@/lifestyle/micare';
import { grantSlice, openHealthConsent, readSlices, revokeSlice } from '@/lifestyle/mihealth';
import { addResource, sweepStale } from '@/lifestyle/miplace';
import { enroll, draftPath, issueCredential, publishPath, verifyCredential } from '@/lifestyle/mieducation';

export function CareDemo() {
  const me = human('coord');
  const receiver = tdid('elder');
  const grants = [{ id: 'g1', issuer: receiver, subject: me.did, target: 'care:plan', purpose: 'care', scope: ['plan-draft', 'helper-add'], expires: LATER, approval: 'receiver-ok' }];
  const [step, setStep] = useState(0);
  const plan = approvePlan(draftPlan(grants, me, 'plan-1', receiver, ['meals'], 'mornings', NOW), me, approval(me.did, 'family agreed'));
  const withHelper = addHelper(plan, grants, me, tdid('aide'), 'aide', NOW);
  const booking = markBooking(bookRespite('b1', me, withHelper, tdid('aide'), 'saturday', 4), 'done');
  const stages = [
    `drafted with receiver consent (ref ${plan.consentRef})`,
    `approved by a human → ${plan.state}`,
    `helper added → ${withHelper.helpers.length} on plan`,
    `respite booked + done → ${booking.hours} hours, state ${booking.state}`,
  ];
  return (
    <Card os="MiCare" title="Set up care for an elder">
      <Btn onClick={() => setStep((s) => Math.min(s + 1, 3))} disabled={step >= 3}>Next step</Btn>
      <Out>{stages.slice(0, step + 1).join('\n')}</Out>
    </Card>
  );
}

export function HealthDemo() {
  const me = human('member');
  const records = { allergies: 'peanuts', meds: 'inhaler' };
  const granted = grantSlice(openHealthConsent(me.did), me.did, 'clinic-a', ['allergies', 'meds'], LATER);
  const [revoked, setRevoked] = useState(false);
  const book = revoked ? revokeSlice(granted, me.did, 'clinic-a', ['meds']) : granted;
  const seen = readSlices(book, 'clinic-a', records, 'g1', NOW);
  return (
    <Card os="MiHealth" title="Share health slices, then take one back">
      <Btn onClick={() => setRevoked(true)} disabled={revoked}>Revoke the meds slice</Btn>
      <Out>{`clinic sees: ${JSON.stringify(seen.slices)}\n(read logged at ${seen.access.at})`}</Out>
    </Card>
  );
}

export function PlaceDemo() {
  const me = human('keeper');
  const [done, setDone] = useState(false);
  const resources = [
    addResource('r1', me, 'place-1', 'food', 'Pantry', '555-0100', NOW),
    { ...addResource('r2', me, 'place-1', 'food', 'Old pantry', '555-0101', NOW), freshAsOf: '2026-02-01T00:00:00Z' },
    { ...addResource('r3', me, 'place-1', 'food', 'Gone pantry', '555-0102', NOW), freshAsOf: '2024-01-01T00:00:00Z' },
  ];
  const swept = sweepStale(resources, NOW, 90);
  return (
    <Card os="MiPlace" title="Sweep stale listings">
      <Btn onClick={() => setDone(true)} disabled={done}>Run freshness sweep</Btn>
      <Out>{(done ? swept.resources : resources).map((r) => `${r.name}: ${r.state}`).join('\n')}</Out>
    </Card>
  );
}

export function EduDemo() {
  const me = human('teacher');
  const learner = tdid('learner');
  const path = publishPath(draftPath('path-1', me, 'First aid', ['basics']), me, approval(me.did, 'reviewed'));
  enroll('e1', me, path, learner, false);
  const authority = { issuer: 'street-school', authorizedBy: me.did, scopes: ['first-aid'], at: NOW };
  const { credential } = issueCredential('c1', me, learner, 'first-aid', 'ev-1', authority, 'sig-1');
  const [mode, setMode] = useState<'good' | 'unknown' | 'revoked'>('good');
  const result = verifyCredential(credential, mode === 'revoked' ? ['c1'] : [], mode === 'unknown' ? ['other-school'] : ['street-school']);
  return (
    <Card os="MiEducation" title="Issue and check a credential">
      <div>
        <Btn onClick={() => setMode('good')}>Real school</Btn>
        <Btn onClick={() => setMode('unknown')}>Unknown school</Btn>
        <Btn onClick={() => setMode('revoked')}>Revoked list</Btn>
      </div>
      <Out>{JSON.stringify(result)}</Out>
    </Card>
  );
}
