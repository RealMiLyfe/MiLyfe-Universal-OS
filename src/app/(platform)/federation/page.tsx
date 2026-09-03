'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, ShieldCheck, LifeBuoy } from 'lucide-react';
import { trustDb } from '@/lib/trust/db';

interface Peer { id: string; name: string; base_url: string; protocol: string; status: string; allows_messaging: boolean; allows_profile_move: boolean; }
interface Recovery { id: string; place: string; scenario: string; status: string; quorum_required: number | null; last_drill_at: string | null; }

export default function FederationPage() {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [recovery, setRecovery] = useState<Recovery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = trustDb();
      const [{ data: p }, { data: r }] = await Promise.all([
        db.from('federation_peers').select('*').order('name'),
        db.from('place_recovery').select('*').order('place'),
      ]);
      setPeers(p ?? []);
      setRecovery(r ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/transparency" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Transparency
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Globe className="h-6 w-6 text-teal-600" /> Federation &amp; Continuity</h1>
      <p className="text-gray-500">MiLyfe can interoperate with forks and survive place-level failures. This is public so anyone can verify it.</p>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800"><ShieldCheck className="h-4 w-4 text-teal-600" /> Federation peers</h2>
        {loading ? <div className="h-16 animate-pulse rounded-xl bg-gray-100" /> :
          peers.length === 0 ? <p className="text-sm text-gray-500">No peers configured yet. MiLyfe runs standalone; forks can be trusted here when they exist.</p> : (
          <div className="space-y-2">
            {peers.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-100 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-harbor-800">{p.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.status === 'trusted' ? 'bg-green-100 text-green-700' : p.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-500">{p.protocol} · {p.allows_messaging ? 'messaging' : 'no messaging'} · {p.allows_profile_move ? 'profile moves' : 'no moves'}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800"><LifeBuoy className="h-4 w-4 text-teal-600" /> Place recovery</h2>
        {loading ? <div className="h-16 animate-pulse rounded-xl bg-gray-100" /> :
          recovery.length === 0 ? <p className="text-sm text-gray-500">Recovery plans are drilled per place (instance loss, key loss, keeper collusion). None recorded here yet.</p> : (
          <div className="space-y-2">
            {recovery.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-harbor-800">{r.place}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{r.status}</span>
                </div>
                <p className="text-xs text-gray-500 capitalize">{r.scenario.replace(/_/g, ' ')}{r.quorum_required ? ` · quorum ${r.quorum_required}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
