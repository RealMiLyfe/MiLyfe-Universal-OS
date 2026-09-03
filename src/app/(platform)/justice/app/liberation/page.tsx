import type { Metadata } from 'next';
import Link from 'next/link';
import { Unlock, Search, FileText, BarChart3, Heart } from 'lucide-react';
import { ModuleScaffold } from '@/components/justice/module-scaffold';
import { getModule } from '@/lib/justice/data';

export const metadata: Metadata = { title: 'The Liberation Engine — MiJustice' };

const LAYERS = [
  { icon: Search, title: 'Constitutional Audit', desc: 'Scan active cases for victimless convictions, coerced pleas, Brady violations, illegal searches, denied counsel, and people held past release.' },
  { icon: FileText, title: 'Legal Filings', desc: 'Draft habeas, post-conviction, appeals, and compassionate-release motions \u2014 each reviewed by an attorney before it can be filed.' },
  { icon: BarChart3, title: 'Public Tracking', desc: 'Show who is held unconstitutionally, the most common violations, and the worst-offending jurisdictions.' },
  { icon: Heart, title: 'Reentry Support', desc: 'Housing, jobs, record expungement, benefits restoration, and voting-rights restoration after release.' },
];

export default function LiberationPage() {
  const m = getModule('liberation')!;
  return (
    <ModuleScaffold module={m}>
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">The four layers</h2>
        <div className="mt-4 space-y-3">
          {LAYERS.map((l) => {
            const Icon = l.icon;
            return (
              <div key={l.title} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50">
                  <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-harbor-800">{l.title}</p>
                  <p className="text-sm text-gray-600">{l.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-harbor-800">
        Start by documenting the case with the{' '}
        <Link href="/justice/app/defender" className="font-medium text-teal-700 hover:underline">Constitutional Defender</Link>.
        For someone who is incarcerated, a family member or advocate can act as a proxy on the case.
      </div>
    </ModuleScaffold>
  );
}
