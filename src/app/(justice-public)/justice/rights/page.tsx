import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft, ArrowRight, Car, Home, Search, Gavel, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { RIGHTS_GUIDES, LAUNCH_COVERAGE } from '@/lib/justice/content';

export const metadata: Metadata = {
  title: 'Know Your Rights — MiJustice',
  description: 'Plain-language guides for what to do during a traffic stop, arrest, ICE encounter, and more. Free and works offline.',
};

const ICONS: Record<string, LucideIcon> = {
  car: Car, home: Home, search: Search, gavel: Gavel, handcuffs: Scale, scale: Scale,
};

export default function RightsHubPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/justice" className="mb-6 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div className="mb-2 flex items-center gap-2">
        <BookOpen className="h-7 w-7 text-harbor-800" />
        <h1 className="text-2xl font-bold text-harbor-800">Know Your Rights</h1>
      </div>
      <p className="text-sm text-gray-500">
        Tap your situation. These guides are free, plain-language, and designed
        to work even without signal.
      </p>

      <LegalDisclaimer className="mt-4" />

      <div className="mt-6 space-y-3">
        {RIGHTS_GUIDES.map((g) => {
          const Icon = ICONS[g.icon] ?? Scale;
          return (
            <Link
              key={g.slug}
              href={`/justice/rights/${g.slug}`}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50">
                <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-harbor-800">{g.situation}</p>
                <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{g.summary}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 self-center text-gray-300" aria-hidden="true" />
            </Link>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="harbor">Constitution</Badge>
        </div>
        <Link href="/justice/rights/constitution" className="flex items-center justify-between">
          <div>
            <p className="font-bold text-harbor-800">The Constitution, Decoded</p>
            <p className="text-sm text-gray-500">The Bill of Rights in plain English.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-6 text-xs text-gray-400">{LAUNCH_COVERAGE}</p>
    </main>
  );
}
