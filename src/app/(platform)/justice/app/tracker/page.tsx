'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Users, FileText, ShieldAlert, Unlock } from 'lucide-react';
import { justiceBrowserDb } from '@/lib/justice/db';
import type { JusticeImpactStats } from '@/lib/justice/types';

const EMPTY: JusticeImpactStats = {
  total_cases: 0, total_violations: 0, total_filings: 0, total_matches: 0,
  total_released: 0, total_dismissed: 0, total_sealed: 0,
};

export default function TrackerPage() {
  const [stats, setStats] = useState<JusticeImpactStats>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const db = justiceBrowserDb();
        const { data } = await db.from('justice_impact_stats').select('*').single();
        if (data) setStats(data as JusticeImpactStats);
      } catch { /* view may be empty pre-launch */ }
      setLoading(false);
    })();
  }, []);

  const CARDS = [
    { icon: ShieldAlert, label: 'Cases defended', value: stats.total_cases },
    { icon: BarChart3, label: 'Issues surfaced', value: stats.total_violations },
    { icon: FileText, label: 'Filings started', value: stats.total_filings },
    { icon: Users, label: 'Matched to help', value: stats.total_matches },
    { icon: Unlock, label: 'People freed', value: stats.total_released },
    { icon: FileText, label: 'Cases dismissed', value: stats.total_dismissed },
    { icon: BarChart3, label: 'Records cleared', value: stats.total_sealed },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-harbor-800" />
          <h1 className="text-2xl font-bold text-harbor-800">Justice Tracker</h1>
        </div>
        <p className="text-gray-500">Live impact. No personal information &mdash; aggregates only.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
              <Icon className="mx-auto mb-2 h-5 w-5 text-teal-600" aria-hidden="true" />
              <p className="text-2xl font-bold tabular-nums text-harbor-800">{loading ? '\u2014' : c.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
        <p>
          Every number here comes from aggregate, de-identified data. Individual
          case details are never shown publicly. Pattern data that names public
          officials is published only from public records, with sources cited.
        </p>
      </div>

      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-harbor-800">
        Want to add to these numbers? Start with the{' '}
        <Link href="/justice/app/defender" className="font-medium text-teal-700 hover:underline">Constitutional Defender</Link>.
      </div>
    </div>
  );
}
