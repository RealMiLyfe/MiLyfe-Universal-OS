import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sword, AlertOctagon, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { WEAPONS, MANIPULATIONS } from '@/lib/justice/data';

export const metadata: Metadata = { title: "The People's Knowledge Base — MiJustice" };

export default function KnowledgePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-harbor-800" />
          <h1 className="text-2xl font-bold text-harbor-800">The People&rsquo;s Knowledge Base</h1>
        </div>
        <p className="text-gray-500">You are the power. Here&rsquo;s the proof, and the tools.</p>
      </div>

      <LegalDisclaimer />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/justice/rights" className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md">
          <BookOpen className="mb-2 h-6 w-6 text-teal-600" />
          <p className="font-bold text-harbor-800">Know Your Rights</p>
          <p className="text-sm text-gray-500">By situation, plain language, offline.</p>
        </Link>
        <Link href="/justice/rights/constitution" className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md">
          <BookOpen className="mb-2 h-6 w-6 text-teal-600" />
          <p className="font-bold text-harbor-800">The Constitution, Decoded</p>
          <p className="text-sm text-gray-500">The Bill of Rights in plain English.</p>
        </Link>
      </div>

      {/* Legal weapons */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800 flex items-center gap-2">
          <Sword className="h-4 w-4" /> Your Legal Weapons
        </h2>
        <div className="mt-4 space-y-2">
          {WEAPONS.map((w) => (
            <div key={w.name} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="font-bold text-harbor-800">{w.name}</p>
              <p className="text-sm text-gray-600">{w.what}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manipulations */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800 flex items-center gap-2">
          <AlertOctagon className="h-4 w-4" /> How the System Traps People
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MANIPULATIONS.map((m) => (
            <div key={m.title} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="destructive" className="text-[10px]">{m.basis}</Badge>
              </div>
              <p className="font-bold text-harbor-800">{m.title}</p>
              <p className="text-sm text-gray-600">{m.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-harbor-800">
        Jury nullification, the violation-pattern database, and the people&rsquo;s
        history feed the{' '}
        <Link href="/justice/app/tracker" className="font-medium text-teal-700 hover:underline">public tracker</Link>{' '}
        and the class actions.
      </div>
    </div>
  );
}
