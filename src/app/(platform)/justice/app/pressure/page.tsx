'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Megaphone, Check, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LegalDisclaimer } from '@/components/justice/legal-disclaimer';
import { justiceBrowserDb } from '@/lib/justice/db';
import { LEGISLATIVE_DEMANDS } from '@/lib/justice/data';
import type { JusticePetition } from '@/lib/justice/types';

export default function PressurePage() {
  const [petitions, setPetitions] = useState<JusticePetition[]>([]);
  const [signed, setSigned] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = justiceBrowserDb();
      const { data: pets } = await db.from('justice_petitions').select('*').order('created_at', { ascending: true });
      const list = (pets ?? []) as JusticePetition[];
      setPetitions(list);

      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      const nextCounts: Record<string, number> = {};
      const mine = new Set<string>();
      for (const p of list) {
        const { count } = await db.from('justice_petition_signatures')
          .select('id', { count: 'exact', head: true }).eq('petition_id', p.id);
        nextCounts[p.id] = count ?? 0;
        if (uid) {
          const { data: sig } = await db.from('justice_petition_signatures')
            .select('id').eq('petition_id', p.id).eq('user_id', uid).maybeSingle();
          if (sig) mine.add(p.id);
        }
      }
      setCounts(nextCounts);
      setSigned(mine);
      setLoading(false);
    })();
  }, []);

  async function sign(petitionId: string) {
    const db = justiceBrowserDb();
    const { data: userData } = await db.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error('Please sign in to add your name.'); return; }
    const { error } = await db.from('justice_petition_signatures').insert({ petition_id: petitionId, user_id: uid });
    if (error) { toast.error('Could not sign right now.'); return; }
    setSigned((s) => new Set(s).add(petitionId));
    setCounts((c) => ({ ...c, [petitionId]: (c[petitionId] ?? 0) + 1 }));
    toast.success('Your name is added. Power to the people.');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/justice/app/home" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> MiJustice
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-harbor-800" />
          <h1 className="text-2xl font-bold text-harbor-800">Political Pressure Engine</h1>
        </div>
        <p className="text-gray-500">When the courts won&rsquo;t listen, the people make them listen.</p>
      </div>

      <LegalDisclaimer />

      {/* Petitions */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">Petitions</h2>
        {loading ? (
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <div className="mt-4 space-y-3">
            {petitions.map((p) => {
              const count = counts[p.id] ?? 0;
              const pct = Math.min(100, Math.round((count / p.goal) * 100));
              const isSigned = signed.has(p.id);
              return (
                <div key={p.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="font-bold text-harbor-800">{p.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{p.description}</p>
                  {p.target && <p className="mt-1 text-xs text-gray-500">To: {p.target}</p>}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {count.toLocaleString()} / {p.goal.toLocaleString()} signatures
                    </span>
                    {isSigned ? (
                      <Badge variant="success"><Check className="mr-1 h-3 w-3" /> Signed</Badge>
                    ) : (
                      <Button variant="mly" size="sm" onClick={() => sign(p.id)}>
                        <PenLine className="mr-1.5 h-3.5 w-3.5" /> Add my name
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Legislative demands */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">The 18 Legislative Demands</h2>
        <div className="mt-4 space-y-2">
          {LEGISLATIVE_DEMANDS.map((d, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mly-100 text-xs font-bold text-mly-800">
                {i + 1}
              </div>
              <p className="text-sm text-harbor-800">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-harbor-800">
        These demands and petitions connect to MiLyfe&rsquo;s{' '}
        <Link href="/governance" className="font-medium text-teal-700 hover:underline">Voice / Governance</Link>{' '}
        so the people can act together.
      </div>
    </div>
  );
}
