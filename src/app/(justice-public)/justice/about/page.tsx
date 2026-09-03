import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { LAUNCH_COVERAGE } from '@/lib/justice/content';

export const metadata: Metadata = {
  title: 'About MiJustice',
  description: 'MiJustice is a free, open-source constitutional justice OS and part of MiLyfe.',
};

export default function JusticeAboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/justice" className="mb-6 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to MiJustice
      </Link>

      <div className="mb-4 flex items-center gap-2">
        <Scale className="h-7 w-7 text-harbor-800" />
        <h1 className="text-2xl font-bold text-harbor-800">About MiJustice</h1>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700">
        <p>
          MiJustice is a free, open-source, constitutional justice operating
          system. It is not a separate company or nonprofit &mdash; it is part of{' '}
          <strong>MiLyfe</strong>, the people-owned platform. One MiLyfe account
          opens it.
        </p>
        <p>
          The mission is simple: give people back the memory that they are the
          power. MiJustice puts constitutional knowledge, self-help tools, and
          connections to free legal help in one place &mdash; in plain language,
          in multiple languages, and working even offline when it matters most.
        </p>
        <p>{LAUNCH_COVERAGE}</p>
        <p>
          Everything is 100% free and open source under AGPL-3.0. There are no
          founder keys. The code belongs to everybody.
        </p>
      </div>

      <LegalDisclaimer className="mt-6" />

      <div className="mt-6">
        <Link href="/signup?next=/justice/app/home">
          <Button variant="default" size="lg">Create a free account</Button>
        </Link>
      </div>
    </main>
  );
}
