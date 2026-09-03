import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { BILL_OF_RIGHTS } from '@/lib/justice/content';

export const metadata: Metadata = {
  title: 'The Constitution, Decoded — MiJustice',
  description: 'The Bill of Rights in plain English. Free educational content.',
};

export default function ConstitutionPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/justice/rights" className="mb-6 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All rights guides
      </Link>

      <h1 className="text-2xl font-bold text-harbor-800">The Bill of Rights, Decoded</h1>
      <p className="mt-2 text-gray-600">
        The first ten amendments &mdash; the promises the government made to the
        people &mdash; in plain English.
      </p>

      <LegalDisclaimer className="mt-4" />

      <div className="mt-6 space-y-3">
        {BILL_OF_RIGHTS.map((a) => (
          <div key={a.number} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-1.5 flex items-center gap-2">
              <Badge variant="harbor">{a.number}</Badge>
              <p className="font-bold text-harbor-800">{a.title}</p>
            </div>
            <p className="text-sm text-gray-600">{a.plainEnglish}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Educational summary of the U.S. Bill of Rights (ratified 1791).
      </p>
    </main>
  );
}
