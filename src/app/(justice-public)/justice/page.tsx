import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Scale, Shield, BookOpen, Gift, Lock, Globe,
  ArrowRight, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  { n: '20%', l: 'of the world\u2019s prisoners (5% of its people)' },
  { n: '180K+', l: 'veterans behind bars' },
  { n: '100%', l: 'free & open source' },
];

export default function JusticeLandingPage() {
  return (
    <main>
      {/* Attention bar */}
      <div className="bg-harbor-950 text-white text-center text-[11px] tracking-widest uppercase font-bold px-4 py-2.5">
        For every neighbor ever counted out, locked up, or shaken down
      </div>

      {/* Hero */}
      <header className="bg-gradient-to-r from-harbor-800 to-teal-600 text-white text-center px-4 py-14">
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl">
          <Scale className="h-14 w-14 text-harbor-800" aria-hidden="true" />
        </div>
        <Badge variant="harbor" className="bg-white/15 text-white border border-white/30">
          The People&rsquo;s Constitutional War Room &middot; Free Forever
        </Badge>
        <h1 className="mx-auto mt-5 max-w-3xl text-3xl md:text-5xl font-bold leading-tight text-balance">
          The System Isn&rsquo;t Broken.{' '}
          <span className="text-mly-400">It Was Built This Way.</span>{' '}
          Now We Fight Back.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg opacity-95">
          MiJustice is a free, open-source, AI-powered constitutional justice
          OS. Know your rights, scan your case against the Constitution, and get
          matched to free legal help. Part of MiLyfe &mdash; owned by the people.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/login?next=/justice/app/home">
            <Button variant="mly" size="lg" className="w-full sm:w-auto">
              Enter the War Room
            </Button>
          </Link>
          <Link href="/signup?next=/justice/app/home">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent text-white border-white/40 hover:bg-white/10">
              Create a Free Account
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-xs opacity-80">{LAUNCH_COVERAGE}</p>
      </header>

      {/* Benefit strip */}
      <section className="border-b border-gray-100 bg-white py-9">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 text-center sm:grid-cols-3">
          {[
            { icon: Gift, t: 'Free Forever', d: 'No paywall, no premium tier, no catch.' },
            { icon: Lock, t: 'Privacy First', d: 'Your case data is yours. Encrypted and owner-only.' },
            { icon: Globe, t: 'Open Source', d: 'AGPL-3.0. The code belongs to everybody.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t}>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
                <Icon className="h-7 w-7 text-teal-600" aria-hidden="true" />
              </div>
              <p className="font-bold text-harbor-800">{t}</p>
              <p className="text-sm text-gray-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What is it */}
      <section className="px-4 py-14 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="section-header inline-block border-b-2 border-mly-500 pb-1 text-2xl md:text-3xl">
            What Is MiJustice?
          </h2>
          <p className="mt-5 text-gray-600">
            A constitutional justice operating system with tools that fight back
            at every point where power gets abused &mdash; from a traffic stop to
            a wrongful conviction. It reminds you of a simple truth the system
            works hard to make you forget: <strong>you are the power.</strong>
          </p>
          <Link href="/justice/rights" className="mt-6 inline-block">
            <Button variant="default" size="lg">
              Start with Know Your Rights
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Modules grid */}
      <section className="bg-surface-light px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="section-header border-b-2 border-mly-500 pb-1 text-xl">The Tools</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {JUSTICE_MODULES.map((m) => (
              <div key={m.slug} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <Shield className="h-6 w-6 text-teal-600" aria-hidden="true" />
                  {m.phase === 'coming_soon' && (
                    <Badge variant="secondary" className="text-[10px]">Soon</Badge>
                  )}
                </div>
                <p className="text-sm font-bold text-harbor-800">{m.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{m.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lawsuits */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="section-header border-b-2 border-mly-500 pb-1 text-xl">
            The People vs. The United States
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            20 class actions in the vision. A sample below. See if your case fits
            once you sign in.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {LAWSUITS.map((l) => (
              <div key={l.n} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <Badge variant="harbor" className="shrink-0">#{l.n}</Badge>
                <div>
                  <p className="text-sm font-bold text-harbor-800">{l.name}</p>
                  <p className="text-xs text-gray-500">Basis: {l.basis} Amendment(s)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-harbor-950 px-4 py-14 text-white">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l}>
              <span className="block text-3xl font-bold tabular-nums text-mly-400">{s.n}</span>
              <span className="text-xs opacity-80">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gradient-to-r from-harbor-800 to-teal-600 px-4 py-14 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold">Ready to Remember Who You Are?</h2>
        <p className="mx-auto mt-3 max-w-xl opacity-95">
          One MiLyfe login opens the whole war room. No cost. No permission. No gatekeeping.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup?next=/justice/app/home">
            <Button variant="mly" size="lg" className="w-full sm:w-auto">Get Started Free</Button>
          </Link>
          <Link href="/justice/rights">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent text-white border-white/40 hover:bg-white/10">
              Browse Your Rights
            </Button>
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs opacity-90">
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> 100% free</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Open source</span>
          <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Community-owned</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-harbor-950 px-4 py-10 text-center text-xs text-gray-400">
        <p className="mb-1 inline-flex items-center gap-1.5 font-bold text-white">
          <Scale className="h-4 w-4" /> MiJustice
        </p>
        <p>Part of MiLyfe. Owned by the people. No founder keys.</p>
        <p className="mt-3">
          <Link href="/justice/rights" className="hover:text-white">Know Your Rights</Link>
          {' \u00b7 '}
          <Link href="/justice/about" className="hover:text-white">About</Link>
          {' \u00b7 '}
          <Link href="/login?next=/justice/app/home" className="hover:text-white">Sign In</Link>
        </p>
        <p className="mx-auto mt-4 max-w-xl opacity-70">
          MiJustice provides legal information and self-help tools, not legal
          advice. It does not replace a licensed attorney.
        </p>
      </footer>
    </main>
  );
}
