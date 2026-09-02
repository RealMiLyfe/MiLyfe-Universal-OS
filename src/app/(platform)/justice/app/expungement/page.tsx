import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Eraser, FileText, CheckCircle2, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';

export const metadata: Metadata = { title: 'Clear Your Record — MiJustice' };

const STEPS = [
  { n: 1, title: 'Check eligibility', desc: 'Florida allows one sealing or expunction in a lifetime, and only for eligible offenses. Certain charges are excluded.' },
  { n: 2, title: 'Get a Certificate of Eligibility (FDLE)', desc: 'Apply to the Florida Department of Law Enforcement. This is the required first step before a court can order sealing or expunction.' },
  { n: 3, title: 'Get a certified disposition', desc: 'Request a certified disposition for each charge from the Duval County Clerk of Courts.' },
  { n: 4, title: 'File the petition', desc: 'File a petition and proposed order with the Fourth Judicial Circuit Court, in the correct division and format.' },
];

export default function ExpungementPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Eraser className="h-6 w-6 text-harbor-800" />
          <h1 className="text-2xl font-bold text-harbor-800">Clear Your Record</h1>
          <Badge variant="mly">Florida / Duval</Badge>
        </div>
        <p className="text-gray-500">Florida sealing &amp; expungement, step by step.</p>
      </div>

      <LegalDisclaimer />

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-harbor-800">Statutes that govern this</h2>
        <ul className="mt-3 space-y-2 text-sm text-harbor-800">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span><strong>Fla. Stat. 943.0585</strong> &mdash; court-ordered expunction (destroys the record).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            <span><strong>Fla. Stat. 943.059</strong> &mdash; court-ordered sealing (hides from public view).</span>
          </li>
        </ul>
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">The four steps</h2>
        <div className="mt-4 space-y-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-harbor-700 to-teal-500 text-sm font-bold text-white">
                {s.n}
              </div>
              <div>
                <p className="font-bold text-harbor-800">{s.title}</p>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="font-bold text-harbor-800">Official resources</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="https://www.fdle.state.fl.us/Seal-and-Expunge-Process.aspx" target="_blank" rel="noopener noreferrer">
            <Button variant="default" size="sm">FDLE Seal &amp; Expunge</Button>
          </a>
          <a href="https://www.duvalclerk.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Duval Clerk of Courts</Button>
          </a>
          <a href="https://www.jaxlegalaid.org" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Jacksonville Legal Aid</Button>
          </a>
        </div>
      </div>

      {/* Gated document generation */}
      <div className="flex items-start gap-2 rounded-xl border border-mly-200 bg-mly-50 p-4 text-sm text-harbor-800">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-mly-600" aria-hidden="true" />
        <div>
          <p className="font-medium">Auto-filled petition packet: coming after attorney review.</p>
          <p className="mt-1 text-gray-600">
            The petition generator will fill your details into the correct 4th
            Circuit forms, but it only turns on once a licensed Florida attorney
            reviews the template &mdash; so you never file something wrong. The steps
            above work today.
          </p>
        </div>
      </div>
    </div>
  );
}
