'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Scale, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import {
  runDefenderScan, overallConfidence,
  type DefenderIntake, type DetectedViolation,
} from '@/lib/justice/defender';
import { DefenderReport } from './report-view';

type YesNoUnsure = 'yes' | 'no' | 'unsure';

const STEPS = [
  'charges', 'jurisdiction', 'rights', 'warrant', 'search', 'counsel', 'bail', 'plea', 'consent',
] as const;

export default function DefenderPage() {
  const [step, setStep] = useState(0);
  const [intake, setIntake] = useState<DefenderIntake>({
    charges: '', jurisdiction: 'Duval County, FL',
    rightsRead: 'unsure', warrant: 'unsure', searched: 'unsure',
    counselProvided: 'unsure', bailAffordable: 'unsure', pleaPressured: 'unsure',
  });
  const [consented, setConsented] = useState(false);
  const [result, setResult] = useState<DetectedViolation[] | null>(null);

  const set = (patch: Partial<DefenderIntake>) => setIntake((s) => ({ ...s, ...patch }));
  const isLast = step === STEPS.length - 1;
  const canNext =
    (STEPS[step] === 'charges' && intake.charges.trim().length > 1) ||
    (STEPS[step] === 'consent' ? consented : true) ||
    !['charges', 'consent'].includes(STEPS[step]);

  function analyze() {
    setResult(runDefenderScan(intake));
  }

  if (result) {
    return (
      <DefenderReport
        intake={intake}
        violations={result}
        confidence={overallConfidence(result)}
        onRestart={() => { setResult(null); setStep(0); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-harbor-800" />
          <h1 className="page-title">Defend Your Rights</h1>
        </div>
        <p className="page-subtitle">Answer a few questions. We check every relevant amendment.</p>
      </div>

      <LegalDisclaimer />

      {/* Progress */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-teal-500 transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        {STEPS[step] === 'charges' && (
          <Field label="What are the charges?" help="In your own words is fine.">
            <Input value={intake.charges} onChange={(e) => set({ charges: e.target.value })}
              placeholder="e.g. possession, trespassing" autoFocus />
          </Field>
        )}
        {STEPS[step] === 'jurisdiction' && (
          <Field label="Where did this happen?" help="County and state.">
            <Input value={intake.jurisdiction} onChange={(e) => set({ jurisdiction: e.target.value })} />
          </Field>
        )}
        {STEPS[step] === 'rights' && (
          <Choice label="Were your rights read to you?" value={intake.rightsRead}
            onChange={(v) => set({ rightsRead: v as YesNoUnsure })} />
        )}
        {STEPS[step] === 'warrant' && (
          <Choice label="Was there a warrant signed by a judge?" value={intake.warrant}
            onChange={(v) => set({ warrant: v as YesNoUnsure })} />
        )}
        {STEPS[step] === 'search' && (
          <Choice label="Were you or your property searched?" value={intake.searched}
            onChange={(v) => set({ searched: v as YesNoUnsure })} />
        )}
        {STEPS[step] === 'counsel' && (
          <Choice label="Were you provided a lawyer?" value={intake.counselProvided}
            onChange={(v) => set({ counselProvided: v as YesNoUnsure })} />
        )}
        {STEPS[step] === 'bail' && (
          <Choice label="Was bail set at an amount you could afford?" value={intake.bailAffordable}
            onChange={(v) => set({ bailAffordable: v as DefenderIntake['bailAffordable'] })}
            extra={{ na: 'No bail set' }} />
        )}
        {STEPS[step] === 'plea' && (
          <Choice label="Were you pressured to take a plea deal?" value={intake.pleaPressured}
            onChange={(v) => set({ pleaPressured: v as YesNoUnsure })} />
        )}
        {STEPS[step] === 'consent' && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-bold text-harbor-800">Before we analyze</h2>
            </div>
            <p className="text-sm text-gray-600">
              This produces <strong>possible issues to raise with a lawyer</strong> &mdash;
              it is legal information, not legal advice, and not a prediction of any outcome.
            </p>
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 p-3 text-sm text-harbor-800">
              <input type="checkbox" checked={consented} onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-teal-600" />
              <span>I understand this is a self-help tool, not legal advice, and I should confirm anything with a licensed attorney.</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        {isLast ? (
          <Button variant="harbor" size="lg" disabled={!consented} onClick={analyze}>
            Analyze My Case <Scale className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="default" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-harbor-800">{label}</label>
      {help && <p className="mb-2 text-xs text-gray-500">{help}</p>}
      {children}
    </div>
  );
}

function Choice({
  label, value, onChange, extra,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  extra?: Record<string, string>;
}) {
  const options: [string, string][] = [
    ['yes', 'Yes'], ['no', 'No'],
    ...(extra ? Object.entries(extra) : []),
    ['unsure', 'Not sure'],
  ];
  return (
    <div>
      <p className="mb-3 text-base font-bold text-harbor-800">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={
              'min-h-[44px] rounded-xl border px-4 py-2 text-sm font-medium transition-all ' +
              (value === v
                ? 'border-teal-500 bg-teal-50 text-harbor-900'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')
            }
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
