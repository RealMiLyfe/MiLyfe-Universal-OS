'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { justiceBrowserDb } from '@/lib/justice/db';
import type { JusticeClassAction } from '@/lib/justice/types';

const RULE23 = ['Numerosity', 'Commonality', 'Typicality', 'Adequacy'];

export default function ClassActionsPage() {
  const [rows, setRows] = useState<JusticeClassAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = justiceBrowserDb();
      const { data } = await db.from('justice_class_actions').select('*').order('number', { ascending: true });
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-harbor-800" />
          <h1 className="text-2xl font-bold text-harbor-800">Class Actions</h1>
        </div>
        <p className="text-gray-500">Not one lawsuit. A machine that files them all.</p>
      </div>

      <LegalDisclaimer />

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-harbor-800">How a class action gets certified</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RULE23.map((r) => (
            <div key={r} className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-sm font-bold text-harbor-800">{r}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">Rule 23 factors a class must satisfy.</p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">The People vs. The United States</h2>
        {loading ? (
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rows.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge variant="harbor">#{c.number}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{c.status}</Badge>
                </div>
                <p className="font-bold text-harbor-800">{c.name}</p>
                {c.description && <p className="mt-1 text-sm text-gray-600">{c.description}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">Defendants:</span> {c.defendants}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Basis:</span> {c.basis}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
        <div className="mb-1 flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600" />
          <h2 className="font-bold text-harbor-800">Think your case fits?</h2>
        </div>
        <p className="text-sm text-gray-600">
          Run the Constitutional Defender first. If your case matches one of these,
          it can be organized into an evidence package for the legal team.
        </p>
        <Link href="/justice/app/defender" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
          Start with the Defender &rarr;
        </Link>
      </div>
    </div>
  );
}
