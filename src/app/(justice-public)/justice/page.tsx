import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Scale, Shield, BookOpen, Gift, Lock, Globe, ArrowRight, Check, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JUSTICE_MODULES, LAUNCH_COVERAGE } from '@/lib/justice/content';

export const metadata: Metadata = {
  title: 'MiJustice — The People\u2019s Constitutional War Room',
  description:
    'A free, open-source, AI-powered constitutional justice OS. Know your rights, defend your case, and connect to free legal help. Part of MiLyfe. 100% free.',
};

const LAWSUITS = [
  { n: 1, name: 'Victimless-Crime Mass Incarceration', basis: '8th, 9th, 14th' },
  { n: 3, name: 'Cash Bail as Wealth Discrimination', basis: '8th, 14th' },
  { n: 5, name: 'Prison-Labor Exploitation', basis: '13th' },
  { n: 7, name: 'ICE Warrantless Home Entries', basis: '4th' },
  { n: 13, name: 'Civil Asset Forfeiture', basis: '4th, 5th, 8th, 14th' },
  { n: 15, name: 'Modern Debtors\u2019 Prisons', basis: '8th, 14th' },
];

const STATS = [
  { n: '750K', l: 'incarcerated for victimless crimes' },
  { n: '20%', l: 'of the world\u2019s prisoners' },
  { n: '180K+', l: 'veterans behind bars' },
  { n: '100%', l: 'free & open source' },
];

const STEPS = [
  { n: 1, t: 'Tell your story', d: 'Answer a few plain-language questions about your situation.' },
  { n: 2, t: 'We scan the Constitution', d: 'Every relevant amendment is checked against what happened.' },
  { n: 3, t: 'Get your next moves', d: 'A plain-English report plus a match to free legal help.' },
];

export default function JusticeLandingPage() {
  return (
    <main className="animate-fade-in">
      {/* Hero — light, airy, MiLyfe style */}
      <header className="relative overflow-hidden bg-gradient-to-br from-teal-50/80 via-white to-mly-50/50 px-4 py-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,193,174,0.06)_1px,transparent_0)] bg-[size:24px_24px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20">
            <Scale className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
          <span className="inline-block rounded-full border border-teal-200/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 backdrop-blur-sm">
            The People&rsquo;s Constitutional War Room &middot; Free Forever
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-tight text-harbor-800 md:text-5xl">
            The System Isn&rsquo;t Broken.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-mly-500">It Was Built This Way.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
            MiJustice is a free, AI-powered constitutional justice OS. Know your
            rights, scan your case against the Constitution, and get matched to
            free legal help. Part of MiLyfe &mdash; owned by the people.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login?next=/justice/app/home">
              <Button variant="harbor" size="lg" className="w-full sm:w-auto">Enter the War Room</Button>
            </Link>
            <Link href="/signup?next=/justice/app/home">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Create a Free Account</Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-500">{LAUNCH_COVERAGE}</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-14">
        {/* Benefit strip — glass cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Gift, t: 'Free Forever', d: 'No paywall, no premium tier, no catch.', tint: 'from-green-50/80 to-emerald-100/40 border-green-200/50', ic: 'text-green-600' },
            { icon: Lock, t: 'Privacy First', d: 'Your case data is yours. Encrypted, owner-only.', tint: 'from-teal-50/80 to-teal-100/40 border-teal-200/50', ic: 'text-teal-600' },
            { icon: Globe, t: 'Open Source', d: 'AGPL-3.0. The code belongs to everybody.', tint: 'from-harbor-50/80 to-harbor-100/40 border-harbor-200/50', ic: 'text-harbor-600' },
          ].map(({ icon: Icon, t, d, tint, ic }) => (
            <div key={t} className={`rounded-xl border bg-gradient-to-br ${tint} p-5 text-center backdrop-blur-sm`}>
              <Icon className={`mx-auto mb-2 h-7 w-7 ${ic}`} aria-hidden="true" />
              <p className="font-bold text-harbor-800">{t}</p>
              <p className="mt-0.5 text-sm text-gray-600">{d}</p>
            </div>
          ))}
        </section>

        {/* What is it */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-harbor-800 md:text-3xl">What Is MiJustice?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            A constitutional justice operating system with tools that fight back
            at every point where power gets abused &mdash; from a traffic stop to a
            wrongful conviction. It reminds you of a simple truth the system works
            hard to make you forget: <strong className="text-harbor-800">you are the power.</strong>
          </p>
          <Link href="/justice/rights" className="mt-6 inline-block">
            <Button variant="default" size="lg">
              Start with Know Your Rights <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Modules grid — glass hover-lift cards */}
        <section>
          <h2 className="mb-5 text-xl font-bold text-harbor-800">The Tools</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {JUSTICE_MODULES.map((m) => (
              <div
                key={m.slug}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                    <Shield className="h-5 w-5 text-teal-600" aria-hidden="true" />
                  </div>
                  {m.phase === 'coming_soon' && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">Soon</span>
                  )}
                </div>
                <p className="text-sm font-bold text-harbor-800">{m.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{m.tagline}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Lawsuits */}
        <section>
          <h2 className="mb-2 text-xl font-bold text-harbor-800">The People vs. The United States</h2>
          <p className="mb-5 text-sm text-gray-500">20 class actions in the vision. A sample below.</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {LAWSUITS.map((l) => (
              <div key={l.n} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-harbor-500/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-harbor-50 text-sm font-bold text-harbor-700">#{l.n}</div>
                <div>
                  <p className="text-sm font-bold text-harbor-800">{l.name}</p>
                  <p className="text-xs text-gray-500">Basis: {l.basis} Amendment(s)</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="mb-5 text-xl font-bold text-harbor-800">How It Works</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-harbor-700 to-teal-500 text-sm font-bold text-white">{s.n}</div>
                <p className="font-bold text-harbor-800">{s.t}</p>
                <p className="mt-1 text-sm text-gray-600">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats — light glass pulse card */}
        <section className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-r from-harbor-50/80 via-teal-50/30 to-mly-50/50 p-6 backdrop-blur-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,193,174,0.05)_1px,transparent_0)] bg-[size:24px_24px]" aria-hidden="true" />
          <div className="relative grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.l}>
                <span className="block text-2xl font-bold tabular-nums text-harbor-800">{s.n}</span>
                <span className="text-xs text-gray-500">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA — light */}
        <section className="rounded-xl border border-teal-200/50 bg-gradient-to-br from-teal-50/80 to-teal-100/40 p-8 text-center backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-harbor-800">Ready to Remember Who You Are?</h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-600">
            One MiLyfe login opens the whole war room. No cost. No gatekeeping.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup?next=/justice/app/home"><Button variant="harbor" size="lg" className="w-full sm:w-auto">Get Started Free</Button></Link>
            <Link href="/justice/rights"><Button variant="outline" size="lg" className="w-full sm:w-auto">Browse Your Rights</Button></Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-teal-600" /> 100% free</span>
            <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-teal-600" /> Open source</span>
            <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5 text-teal-600" /> Community-owned</span>
          </div>
        </section>
      </div>

      {/* Footer — light */}
      <footer className="border-t border-gray-100 bg-white px-4 py-10 text-center text-xs text-gray-500">
        <p className="mb-1 inline-flex items-center gap-1.5 font-bold text-harbor-800">
          <Scale className="h-4 w-4 text-teal-600" /> MiJustice
        </p>
        <p>Part of MiLyfe. Owned by the people. No founder keys.</p>
        <p className="mt-3">
          <Link href="/justice/rights" className="text-teal-600 hover:underline">Know Your Rights</Link>
          {' \u00b7 '}
          <Link href="/justice/about" className="text-teal-600 hover:underline">About</Link>
          {' \u00b7 '}
          <Link href="/login?next=/justice/app/home" className="text-teal-600 hover:underline">Sign In</Link>
        </p>
        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          MiJustice provides legal information and self-help tools, not legal
          advice. It does not replace a licensed attorney.
        </p>
      </footer>
    </main>
  );
}
