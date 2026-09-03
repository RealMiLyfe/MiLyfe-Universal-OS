'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Code2, Plus, KeyRound, Smartphone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trustDb } from '@/lib/trust/db';

interface Client { id: string; name: string; client_id: string; scopes: string[]; active: boolean; }

const ENDPOINTS = [
  { path: '/api/search', desc: 'Unified search across people, media, courses, shops' },
  { path: '/api/wallet/transactions', desc: 'Wallet ledger (read)' },
  { path: '/api/wallet/transfer', desc: 'Send $MLY peer-to-peer' },
  { path: '/api/mi/chat', desc: 'Mi assistant (streaming)' },
  { path: '/api/justice/ai-health', desc: 'MiJustice AI fleet status' },
];

export default function DevelopersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const db = trustDb();
    const { data } = await db.from('api_clients').select('*').order('created_at', { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const db = trustDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const { error } = await db.from('api_clients').insert({ owner_id: uid, name: name.trim(), scopes: ['read'] });
      if (error) throw error;
      setName('');
      toast.success('API client created.');
      load();
    } catch { toast.error('Could not create client.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Code2 className="h-6 w-6 text-teal-600" /> Developers</h1>
      <p className="text-gray-500">Build on MiLyfe. Open API, native-app ready. No payment or ad endpoints — money is $MLY-internal only.</p>

      {/* Native app note */}
      <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 p-4">
        <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
        <p className="text-sm text-harbor-800">
          MiLyfe is an installable PWA today (add to home screen, offline-capable). Native
          apps (React Native/Expo) consume this same API contract, with background media
          playback for the Vibe Bar.
        </p>
      </div>

      {/* Endpoints */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">API endpoints</h2>
        <div className="space-y-2">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="rounded-xl border border-gray-100 bg-white p-3">
              <code className="rounded bg-teal-50 px-1.5 py-0.5 font-mono text-xs text-teal-700">{e.path}</code>
              <p className="mt-1 text-sm text-gray-600">{e.desc}</p>
            </div>
          ))}
          <p className="text-xs text-gray-400">Excluded by design: any payment or advertising endpoint.</p>
        </div>
      </section>

      {/* API clients */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-harbor-800"><KeyRound className="h-4 w-4 text-teal-600" /> Your API clients</h2>
        <div className="mb-3 flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="App name" />
          <Button variant="default" onClick={create} disabled={saving}><Plus className="mr-1 h-4 w-4" /> Create</Button>
        </div>
        {loading ? <div className="h-16 animate-pulse rounded-xl bg-gray-100" /> :
          clients.length === 0 ? <p className="text-sm text-gray-500">No API clients yet.</p> : (
          <div className="space-y-2">
            {clients.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="font-medium text-harbor-800">{c.name}</p>
                <code className="font-mono text-xs text-gray-500">{c.client_id}</code>
                <p className="mt-1 text-xs text-gray-400">Scopes: {c.scopes.join(', ')}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
        <Globe className="mt-0.5 h-4 w-4 shrink-0 text-harbor-400" aria-hidden="true" />
        <p>
          MiLyfe is federation-aware: forks can interoperate (messaging, profile moves) with
          version-checked peers. See <Link href="/transparency" className="text-teal-600 hover:underline">Transparency</Link> for
          federation and place-recovery status.
        </p>
      </div>
    </div>
  );
}
