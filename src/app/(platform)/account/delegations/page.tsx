'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Landmark, UserCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trustDb } from '@/lib/trust/db';

interface Delegation { id: string; delegate_id: string; topic: string; expires_at: string | null; }
const TOPICS = ['all', 'economy', 'safety', 'housing', 'education', 'justice', 'health'];

export default function DelegationsPage() {
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [topic, setTopic] = useState('all');
  const [saving, setSaving] = useState(false);

  async function load() {
    const db = trustDb();
    const { data } = await db.from('mi_delegations').select('*').eq('revoked', false).order('created_at', { ascending: false });
    setDelegations(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function delegate() {
    if (!username.trim()) return;
    setSaving(true);
    try {
      const db = trustDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const { data: target } = await db.from('profiles').select('id').eq('username', username.trim().replace('@', '')).maybeSingle();
      if (!target) { toast.error('Person not found.'); return; }
      const { error } = await db.from('mi_delegations').insert({ delegator_id: uid, delegate_id: target.id, topic });
      if (error) throw error;
      setUsername('');
      toast.success('Vote delegated. Revocable anytime.');
      load();
    } catch { toast.error('Could not delegate.'); }
    finally { setSaving(false); }
  }

  async function revoke(id: string) {
    const db = trustDb();
    await db.from('mi_delegations').update({ revoked: true }).eq('id', id);
    setDelegations((d) => d.filter((x) => x.id !== id));
    toast.success('Delegation revoked.');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/governance" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Voice
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Landmark className="h-6 w-6 text-purple-600" /> Delegate your voice</h1>
      <p className="text-gray-500">Let someone you trust vote on your behalf — by topic, revocable anytime, never silently re-delegated.</p>

      <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username to delegate to" />
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button key={t} onClick={() => setTopic(t)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${topic === t ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>{t}</button>
          ))}
        </div>
        <Button variant="harbor" onClick={delegate} disabled={saving} className="w-full">
          <UserCheck className="mr-2 h-4 w-4" /> Delegate ({topic})
        </Button>
      </div>

      {loading ? <div className="h-20 animate-pulse rounded-xl bg-gray-100" /> :
        delegations.length === 0 ? <p className="text-sm text-gray-500">No active delegations. You vote for yourself.</p> : (
        <div className="space-y-2">
          {delegations.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
              <span className="text-sm text-harbor-800">Delegated <span className="font-medium capitalize">{d.topic}</span> topics</span>
              <button onClick={() => revoke(d.id)} className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline">
                <X className="h-3.5 w-3.5" /> Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
