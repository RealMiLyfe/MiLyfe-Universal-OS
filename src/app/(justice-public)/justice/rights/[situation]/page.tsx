import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { RIGHTS_GUIDES, getRightsGuide } from '@/lib/justice/content';

export function generateStaticParams() {
  return RIGHTS_GUIDES.map((g) => ({ situation: g.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ situation: string }> }
): Promise<Metadata> {
  const { situation } = await params;
  const guide = getRightsGuide(situation);
  if (!guide) return { title: 'Know Your Rights — MiJustice' };
  return {
    title: `${guide.situation} — Know Your Rights`,
    description: guide.summary,
  };
}

export default async function RightsSituationPage(
  { params }: { params: Promise<{ situation: string }> }
) {
  const { situation } = await params;
  const guide = getRightsGuide(situation);
  if (!guide) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/justice/rights" className="mb-6 inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All rights guides
      </Link>

      <h1 className="text-2xl font-bold text-harbor-800">{guide.situation}</h1>
      <p className="mt-2 text-gray-600">{guide.summary}</p>

      <LegalDisclaimer className="mt-4" />

      <ol className="mt-6 space-y-3">
        {guide.steps.map((step, i) => (
          <li key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            {step.say && (
              <p className="flex items-start gap-2 text-harbor-900">
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
                <span className="text-lg font-bold leading-snug">{step.say}</span>
              </p>
            )}
            {step.doThis && (
              <p className="flex items-start gap-2 text-harbor-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                <span>{step.doThis}</span>
              </p>
            )}
            {step.dont && (
              <p className="flex items-start gap-2 text-harbor-800">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
                <span>{step.dont}</span>
              </p>
            )}
            {step.note && (
              <p className="flex items-start gap-2 text-gray-600">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-harbor-400" aria-hidden="true" />
                <span className="text-sm">{step.note}</span>
              </p>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs text-gray-400">Source: {guide.source}</p>

      <div className="mt-8 rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
        <p className="text-sm font-medium text-harbor-800">
          Facing this right now? Open Encounter Mode for the fast, one-tap version.
        </p>
        <Link href="/login?next=/justice/app/encounter" className="mt-3 inline-block">
          <Button variant="harbor" size="lg">Open Encounter Mode</Button>
        </Link>
      </div>
    </main>
  );
}
