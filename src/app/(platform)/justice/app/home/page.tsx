import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Scale, ShieldAlert, BookOpen, Unlock, Home as HomeIcon, Users, Eraser,
  Megaphone, Mountain, Handshake, Banknote, GraduationCap, Coins, DoorClosed,
  Eye, Baby, HeartPulse, Medal, Users2, Rainbow, Stethoscope, ClipboardCheck,
  Landmark, Siren, Globe,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { StatusBadge } from '@/components/justice/module-scaffold';
import { MODULES, type ModuleDef } from '@/lib/justice/data';

export const metadata: Metadata = {
  title: 'MiJustice',
  description: 'The People\u2019s Constitutional Defense.',
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
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-harbor-800">MiJustice ✊</h1>
        <p className="text-gray-500">Constitutional tools for the people. Duval County.</p>
      </div>

      <LegalDisclaimer />

      {/* Glass stat / quick-action row — matches dashboard */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction href="/justice/app/encounter" icon={ShieldAlert} label="Encounter Mode"
          tint="from-mly-50/80 to-mly-100/40 border-mly-200/50" ic="text-mly-600" />
        <QuickAction href="/justice/app/defender" icon={Scale} label="Defend a Case"
          tint="from-teal-50/80 to-teal-100/40 border-teal-200/50" ic="text-teal-600" />
        <QuickAction href="/justice/rights" icon={BookOpen} label="Know Your Rights"
          tint="from-harbor-50/80 to-harbor-100/40 border-harbor-200/50" ic="text-harbor-600" />
        <QuickAction href="/justice/app/tracker" icon={Users} label="Impact Tracker"
          tint="from-purple-50/80 to-purple-100/40 border-purple-200/50" ic="text-purple-600" />
      </div>

      {/* Modules, grouped as a bento grid */}
      {GROUPS.map(({ key, label }) => {
        const mods = MODULES.filter((m) => m.group === key);
        if (mods.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="mb-3 font-semibold text-harbor-800">{label}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {mods.map((m) => {
                const Icon = ICONS[m.icon] ?? Scale;
                return (
                  <Link
                    key={m.slug}
                    href={moduleHref(m)}
                    className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                      <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-harbor-800">{m.title}</p>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="text-sm text-gray-500">{m.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Community pulse card — matches dashboard */}
      <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-r from-harbor-50/80 via-teal-50/30 to-mly-50/50 p-5 text-center backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,193,174,0.05)_1px,transparent_0)] bg-[size:24px_24px]" aria-hidden="true" />
        <p className="relative text-sm text-harbor-800">
          MiJustice is part of MiLyfe &mdash; owned by the people. 100% free, open source.
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  href, icon: Icon, label, tint, ic,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  tint: string;
  ic: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${tint} p-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <Icon className={`mx-auto mb-1.5 h-5 w-5 ${ic}`} aria-hidden="true" />
      <span className="text-xs font-semibold text-harbor-800">{label}</span>
    </Link>
  );
}
