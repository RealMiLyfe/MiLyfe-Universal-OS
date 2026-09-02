import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Scale, ShieldAlert, BookOpen, Unlock, Home as HomeIcon, Users,
  Eraser, Megaphone, ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { JUSTICE_MODULES } from '@/lib/justice/content';

export const metadata: Metadata = {
  title: 'MiJustice',
  description: 'The People\u2019s Constitutional War Room.',
};

const ICONS: Record<string, LucideIcon> = {
  ShieldAlert, BookOpen, Scale, Unlock, Home: HomeIcon, Users, Eraser, Megaphone,
};

export default function JusticeHomePage() {
  const available = JUSTICE_MODULES.filter((m) => m.phase === 'available');
  const comingSoon = JUSTICE_MODULES.filter((m) => m.phase === 'coming_soon');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="page-title">MiJustice</h1>
          <Badge variant="live">Duval County</Badge>
        </div>
        <p className="page-subtitle">The People&rsquo;s Constitutional War Room</p>
      </div>

      <LegalDisclaimer />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction href="/justice/app/encounter" icon={ShieldAlert} label="Encounter Mode" urgent />
        <QuickAction href="/justice/rights" icon={BookOpen} label="Know Your Rights" />
        <QuickAction href="/justice/app/home" icon={Scale} label="Defend a Case" soon />
        <QuickAction href="/justice/app/home" icon={Eraser} label="Clear Record" soon />
      </div>

      {/* Available tools */}
      <section>
        <h2 className="section-header border-b-2 border-mly-500 pb-1">Available Now</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {available.map((m) => {
            const Icon = ICONS[m.icon] ?? Scale;
            const href = m.slug === 'rights' ? '/justice/rights' : `/justice/app/${m.slug}`;
            return (
              <Link
                key={m.slug}
                href={href}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50">
                  <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-harbor-800">{m.title}</p>
                  <p className="text-sm text-gray-500">{m.tagline}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 self-center text-gray-300" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Coming soon */}
      <section>
        <h2 className="section-header border-b-2 border-mly-500 pb-1">Coming Soon</h2>
        <p className="mt-2 text-xs text-gray-500">
          These tools generate or file legal documents, so they unlock only after
          a licensed attorney reviews each one for your jurisdiction.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {comingSoon.map((m) => {
            const Icon = ICONS[m.icon] ?? Scale;
            return (
              <div key={m.slug} className="rounded-xl border border-gray-100 bg-white p-4 opacity-70 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <Icon className="h-6 w-6 text-harbor-400" aria-hidden="true" />
                  <Badge variant="secondary" className="text-[10px]">Soon</Badge>
                </div>
                <p className="text-sm font-bold text-harbor-800">{m.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{m.tagline}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
        <p className="text-sm text-harbor-800">
          MiJustice is part of MiLyfe &mdash; owned by the people. 100% free, open source.
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  href, icon: Icon, label, urgent, soon,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  urgent?: boolean;
  soon?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        'flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center shadow-sm transition-all hover:shadow-md ' +
        (urgent
          ? 'border-mly-300 bg-mly-50 hover:bg-mly-100'
          : 'border-gray-100 bg-white hover:bg-gray-50')
      }
    >
      <Icon className={'h-6 w-6 ' + (urgent ? 'text-mly-600' : 'text-teal-600')} aria-hidden="true" />
      <span className="text-xs font-semibold text-harbor-800">{label}</span>
      {soon && <span className="text-[10px] text-gray-400">Soon</span>}
    </Link>
  );
}
