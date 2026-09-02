'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, ShieldAlert, Bell, FileSearch, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';

type Answer = 'yes' | 'no' | null;

const CHECKS = [
  { key: 'judge', q: 'Is it signed by a JUDGE (not just an ICE officer or "authorized immigration officer")?' },
  { key: 'court', q: 'Does it say a court at the top (e.g. "U.S. District Court")?' },
  { key: 'address', q: 'Does it list YOUR specific name or address to be searched?' },
  { key: 'form', q: 'Is the form something OTHER than an I-200 or I-205 (those are administrative, not judicial)?' },
];

export default function IceShieldPage() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [checked, setChecked] = useState(false);

  const allYes = CHECKS.every((c) => answers[c.key] === 'yes');
  const anyNo = CHECKS.some((c) => answers[c.key] === 'no');
  const complete = CHECKS.every((c) => answers[c.key] != null);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Home className="h-6 w-6 text-harbor-800" />
          <h1 className="text-2xl font-bold text-harbor-800">ICE Defense Shield</h1>
          <Badge variant="mly">Preview</Badge>
        </div>
        <p className="text-gray-500">Nobody gets disappeared. Check the warrant. Know your rights.</p>
      </div>

      <LegalDisclaimer />

      {/* Quick rights */}
      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
        <h2 className="font-bold text-harbor-800">At the door — the basics</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-harbor-800">
          <li className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" /> Do not open the door.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> Ask them to slide any warrant under the door.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> Say: &ldquo;I do not consent. I want to speak to a lawyer.&rdquo;</li>
        </ul>
        <Link href="/justice/rights/ice-at-your-door" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
          Full ICE-at-your-door guide &rarr;
        </Link>
      </div>

      {/* Warrant checker */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-teal-600" />
          <h2 className="font-bold text-harbor-800">Warrant Checker</h2>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          A real judicial warrant is signed by a judge. An ICE administrative form
          (like an I-200 or I-205) does <strong>not</strong> give them the right to enter
          your home. Answer these about the document they showed you:
        </p>

        <div className="space-y-3">
          {CHECKS.map((c) => (
            <div key={c.key} className="rounded-xl border border-gray-100 p-3">
              <p className="text-sm font-medium text-harbor-800">{c.q}</p>
              <div className="mt-2 flex gap-2">
                {(['yes', 'no'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => { setAnswers((a) => ({ ...a, [c.key]: v })); setChecked(false); }}
                    className={
                      'min-h-[40px] flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium ' +
                      (answers[c.key] === v
                        ? 'border-teal-500 bg-teal-50 text-harbor-900'
                        : 'border-gray-200 bg-white text-gray-600')
                    }
                  >
                    {v === 'yes' ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button variant="harbor" className="mt-4 w-full" disabled={!complete} onClick={() => setChecked(true)}>
          Check the warrant
        </Button>

        {checked && (
          <div className={'mt-4 rounded-xl border p-4 ' + (allYes ? 'border-mly-300 bg-mly-50' : 'border-teal-200 bg-teal-50')}>
            {allYes ? (
              <p className="text-sm text-harbor-900">
                <strong>This may be a judicial warrant.</strong> If it is signed by a
                judge and names you/your address, it may authorize entry. Stay calm,
                do not resist, say you want a lawyer, and do not answer questions.
              </p>
            ) : anyNo ? (
              <p className="text-sm text-harbor-900">
                <strong>This looks like it may NOT be a valid judicial warrant.</strong>{' '}
                An administrative form does not require you to open the door. You can
                say you do not consent and ask to speak to a lawyer. Do not sign anything.
              </p>
            ) : null}
            <p className="mt-2 text-xs text-gray-500">
              This is informational only, not legal advice. Contact an immigration attorney right away.
            </p>
          </div>
        )}
      </div>

      {/* Rapid response */}
      <div className="flex flex-wrap gap-2">
        <Link href="/justice/app/encounter"><Button variant="destructive"><ShieldAlert className="mr-2 h-4 w-4" /> Encounter Mode</Button></Link>
        <Link href="/justice/app/contacts"><Button variant="outline"><Bell className="mr-2 h-4 w-4" /> Rapid-Response Contacts</Button></Link>
      </div>
    </div>
  );
}
