'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Star, Wallet, Bot, ShieldAlert, Scale, BookOpen, Landmark, GraduationCap,
  Users, ArrowRight, Sparkles, Phone,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

/**
 * RightRail — contextual "what's next" sidebar for lg+ screens.
 * Fills the previously-empty right side. Content adapts to the current section.
 * Sticky, scrolls independently. Light MiLyfe styling. Hidden below lg.
 */
export function RightRail() {
  const pathname = usePathname();
  const { user, wallet, standing } = useAppStore();

  const totalBalance = wallet
    ? (wallet.spending_balance ?? 0) + (wallet.savings_balance ?? 0) + (wallet.community_balance ?? 0)
    : 0;

  return (
    <aside
      className="hidden lg:flex fixed right-0 top-14 bottom-0 w-72 xl:w-80 flex-col gap-4 overflow-y-auto border-l border-gray-100 bg-white/60 p-4 backdrop-blur-sm"
      aria-label="Contextual sidebar"
    >
      {/* Your MiLyfe snapshot — always shown */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/wallet"
          className="rounded-xl border border-teal-200/50 bg-gradient-to-br from-teal-50/80 to-teal-100/40 p-3 text-center transition-transform hover:-translate-y-0.5"
        >
          <Wallet className="mx-auto mb-1 h-4 w-4 text-teal-600" aria-hidden="true" />
          <p className="text-lg font-bold tabular-nums text-harbor-800">{totalBalance.toFixed(0)}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-teal-700/70">$MLY</p>
        </Link>
        <Link
          href="/standing"
          className="rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-purple-100/40 p-3 text-center transition-transform hover:-translate-y-0.5"
        >
          <Star className="mx-auto mb-1 h-4 w-4 text-purple-600" aria-hidden="true" />
          <p className="text-lg font-bold tabular-nums text-harbor-800">{standing?.overall?.toFixed(1) ?? '0'}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-purple-700/70">Standing</p>
        </Link>
      </div>

      {/* Context-aware block */}
      <ContextBlock pathname={pathname} />

      {/* Ask Mi — always shown */}
      <Link
        href="/mi"
        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
          <Bot className="h-5 w-5 text-teal-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-harbor-800">Ask Mi</p>
          <p className="truncate text-xs text-gray-500">Questions, help, anything.</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
      </Link>

      <p className="mt-auto px-1 text-[10px] text-gray-400">
        {user ? `Signed in as @${user.username}` : 'MiLyfe'} · owned by the people
      </p>
    </aside>
  );
}

function ContextBlock({ pathname }: { pathname: string }) {
  // MiJustice — the panic-safe, case-first rail.
  if (pathname.startsWith('/justice')) {
    return (
      <RailCard title="Justice">
        <RailAction href="/justice/app/encounter" icon={ShieldAlert} label="Encounter Mode"
          sub="Your rights, right now" urgent />
        <RailAction href="/justice/app/defender" icon={Scale} label="Defend a case"
          sub="Scan the Constitution" />
        <RailAction href="/justice/rights" icon={BookOpen} label="Know Your Rights"
          sub="By situation, offline" />
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">
          <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" aria-hidden="true" />
          <span>Free legal help in Duval: Public Defender (904-255-4673) &amp; Jacksonville Area Legal Aid.</span>
        </div>
      </RailCard>
    );
  }

  if (pathname.startsWith('/learn')) {
    return (
      <RailCard title="Keep learning">
        <RailAction href="/learn" icon={GraduationCap} label="Your paths" sub="Continue where you left off" />
        <RailAction href="/learn" icon={Sparkles} label="Suggested next" sub="Based on your interests" />
      </RailCard>
    );
  }

  if (pathname.startsWith('/governance')) {
    return (
      <RailCard title="Your voice">
        <RailAction href="/governance" icon={Landmark} label="Proposals closing soon" sub="Cast your vote" />
        <RailAction href="/governance" icon={Users} label="Community decisions" sub="What's on the table" />
      </RailCard>
    );
  }

  if (pathname.startsWith('/wallet')) {
    return (
      <RailCard title="Pocket">
        <RailAction href="/wallet?send=1" icon={Wallet} label="Send $MLY" sub="Thank a neighbor" />
        <RailAction href="/wallet" icon={ArrowRight} label="Recent activity" sub="Your transactions" />
      </RailCard>
    );
  }

  // Default — "up next" across the platform.
  return (
    <RailCard title="Up next">
      <RailAction href="/governance" icon={Landmark} label="Vote on a proposal" sub="Shape the community" />
      <RailAction href="/learn" icon={GraduationCap} label="Continue learning" sub="Pick up a path" />
      <RailAction href="/justice/app/home" icon={Scale} label="Know your rights" sub="MiJustice tools" />
    </RailCard>
  );
}

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-harbor-800">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function RailAction({
  href, icon: Icon, label, sub, urgent,
}: {
  href: string;
  icon: typeof Scale;
  label: string;
  sub: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${urgent ? 'bg-mly-50' : 'bg-teal-50'}`}>
        <Icon className={`h-4 w-4 ${urgent ? 'text-mly-600' : 'text-teal-600'}`} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-harbor-800">{label}</p>
        <p className="truncate text-xs text-gray-500">{sub}</p>
      </div>
    </Link>
  );
}
