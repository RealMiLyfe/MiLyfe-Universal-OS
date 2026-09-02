import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Scale, ShieldAlert, BookOpen, Unlock, Home as HomeIcon, Users, Eraser,
  Megaphone, Mountain, Handshake, Banknote, GraduationCap, Coins, DoorClosed,
  Eye, Baby, HeartPulse, Medal, Users2, Rainbow, Stethoscope, ClipboardCheck,
  Landmark, Siren, Globe, ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { StatusBadge } from '@/components/justice/module-scaffold';
import { MODULES, type ModuleDef } from '@/lib/justice/data';

export const metadata: Metadata = {
  title: 'MiJustice',
  description: 'The People\u2019s Constitutional War Room.',
};

const ICONS: Record<string, LucideIcon> = {
  Scale, ShieldAlert, BookOpen, Unlock, Home: HomeIcon, Users, Eraser, Megaphone,
  Mountain, Handshake, Banknote, GraduationCap, Coins, DoorClosed, Eye, Baby,
  HeartPulse, Medal, Users2, Rainbow, Stethoscope, ClipboardCheck, Landmark,
  Siren, Globe,
};

const GROUPS: { key: ModuleDef['group']; label: string }[] = [
  { key: 'defense', label: 'Defense' },
  { key: 'liberation', label: 'Liberation' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'pressure', label: 'Pressure' },
  { key: 'network', label: 'Network' },
];

function moduleHref(m: ModuleDef): string {
  if (m.slug === 'knowledge') return '/justice/rights';
  return `/justice/app/${m.slug}`;
}

export default function JusticeHomePage() {
  return (
    <div className="space-y-6">
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
        <QuickAction href="/justice/app/defender" icon={Scale} label="Defend a Case" />
        <QuickAction href="/justice/rights" icon={BookOpen} label="Know Your Rights" />
        <QuickAction href="/justice/app/tracker" icon={Users} label="Impact Tracker" />
      </div>

      {/* All tools, grouped */}
      {GROUPS.map(({ key, label }) => {
        const mods = MODULES.filter((m) => m.group === key);
        if (mods.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="section-header border-b-2 border-mly-500 pb-1">{label}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {mods.map((m) => {
                const Icon = ICONS[m.icon] ?? Scale;
                return (
                  <Link
                    key={m.slug}
                    href={moduleHref(m)}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50">
                      <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-harbor-800">{m.title}</p>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="text-sm text-gray-500">{m.tagline}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 self-center text-gray-300" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
        <p className="text-sm text-harbor-800">
          MiJustice is part of MiLyfe &mdash; owned by the people. 100% free, open source.
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  href, icon: Icon, label, urgent,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  urgent?: boolean;
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
    </Link>
  );
}
