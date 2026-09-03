'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart, HeartPulse, Hammer, GraduationCap, ShieldCheck, Landmark, Store, Zap,
  Music, Scale, Languages, Flame, ArrowRight, TrendingDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FACETS, WAYS_TO_CONTRIBUTE, type Facet } from '@/lib/economy/data';
import { trustDb } from '@/lib/trust/db';

const ICONS: Record<string, LucideIcon> = {
  Heart, HeartPulse, Hammer, GraduationCap, ShieldCheck, Landmark, Store, Zap, Music, Scale, Languages,
};

interface Props {
  standing: Record<Facet, number> | null;
  streak: { current_weeks: number; multiplier: number } | null;
}

interface Contribution {
  id: string; title: string; facet: string; mly_reward: number;
  status: string; surface: string; created_at: string;
}

export function ContributionsView({ standing, streak }: Props) {
  const [feed, setFeed] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = trustDb();
      const { data } = await db.from('contributions').select('*').order('created_at', { ascending: false }).limit(20);
      setFeed(data ?? []);
      setLoading(false);
    })();
  }, []);

  const totalEarned = feed.filter((c) => c.status === 'paid').reduce((s, c) => s + Number(c.mly_reward), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-harbor-800">Your Impact ✊</h1>
        <p className="text-gray-500">What you give, what it earns, and what to do next.</p>
      </div>

      {/* Impact + streak row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-teal-200/50 bg-gradient-to-br from-teal-50/80 to-teal-100/40 p-4 text-center backdrop-blur-sm">
          <p className="text-2xl font-bold tabular-nums text-harbor-800">{totalEarned.toFixed(0)}</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-teal-700/70">$MLY earned giving</p>
        </div>
        <div className="rounded-xl border border-mly-200/50 bg-gradient-to-br from-mly-50/80 to-mly-100/40 p-4 text-center backdrop-blur-sm">
          <p className="flex items-center justify-center gap-1 text-2xl font-bold tabular-nums text-harbor-800">
            <Flame className="h-5 w-5 text-mly-600" /> {streak?.current_weeks ?? 0}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-mly-700/70">Week streak</p>
        </div>
        <div className="rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-purple-100/40 p-4 text-center backdrop-blur-sm">
          <p className="text-2xl font-bold tabular-nums text-harbor-800">{(streak?.multiplier ?? 1).toFixed(1)}×</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-purple-700/70">Consistency bonus</p>
        </div>
      </div>

      {/* Standing facets — actionable */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">Your standing</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FACETS.map((f) => {
            const Icon = ICONS[f.icon] ?? Heart;
            const val = standing?.[f.key] ?? 0;
            const low = val < 2;
            return (
              <div key={f.key} className={`rounded-xl border bg-gradient-to-br ${f.tint} p-3 text-center backdrop-blur-sm`}>
                <Icon className={`mx-auto mb-1 h-5 w-5 ${f.ic}`} aria-hidden="true" />
                <p className="text-lg font-bold tabular-nums text-harbor-800">{val.toFixed(1)}</p>
                <p className="text-[11px] font-medium text-harbor-700/70">{f.label}</p>
                {low && (
                  <p className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-orange-500">
                    <TrendingDown className="h-3 w-3" /> {f.keepItUp}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Ways to contribute / earn */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">Ways to contribute</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {WAYS_TO_CONTRIBUTE.map((w) => {
            const Icon = ICONS[w.icon] ?? Zap;
            return (
              <Link key={w.title} href={w.href}
                className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                  <Icon className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-harbor-800">{w.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{w.facet} · +{w.mly} $MLY</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Contribution feed */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">Recent contributions</h2>
        {loading ? (
          <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
        ) : feed.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
            Nothing yet. Pick something above and start giving — it all comes back.
          </div>
        ) : (
          <div className="space-y-2">
            {feed.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-harbor-800">{c.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{c.facet} · {c.surface} · {c.status}</p>
                </div>
                <span className="text-sm font-bold tabular-nums text-green-600">+{c.mly_reward} $MLY</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
