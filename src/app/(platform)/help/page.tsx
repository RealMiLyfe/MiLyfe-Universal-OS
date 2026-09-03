'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LifeBuoy, Scale, HeartPulse, Shield, Home, Briefcase, HandHeart, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trustDb } from '@/lib/trust/db';

const CATEGORIES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: 'legal', label: 'Legal', icon: Scale },
  { key: 'medical', label: 'Medical', icon: HeartPulse },
  { key: 'safety', label: 'Safety', icon: Shield },
  { key: 'housing', label: 'Housing', icon: Home },
  { key: 'employment', label: 'Work', icon: Briefcase },
  { key: 'financial', label: 'Money', icon: Wallet },
  { key: 'emotional', label: 'Emotional', icon: HandHeart },
];
const URGENCY = ['routine', 'soon', 'urgent', 'emergency'];

interface Handoff { id: string; category: string; urgency: string; status: string; created_at: string; }

export default function HelpPage() {
  const [category, setCategory] = useState('legal');
  const [urgency, setUrgency] = useState('routine');
  const [context, setContext] = useState('');
  const [saving, setSaving] = useState(false);
  const [requests, setRequests] = useState<Handoff[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const db = trustDb();
    const { data } = await db.from('mi_handoffs').select('*').order('created_at', { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function request() {
    setSaving(true);
    try {
      const db = trustDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const { error } = await db.from('mi_handoffs').insert({ requester_id: uid, category, urgency, min_context: context.trim() || null });
      if (error) throw error;
      setContext('');
      toast.success('Request sent. A real person will reach out.');
      load();
    } catch { toast.error('Could not send request.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><LifeBuoy className="h-6 w-6 text-teal-600" /> Talk to a Person</h1>
      <p className="text-gray-500">Mi can help with a lot, but sometimes you need a human. We&rsquo;ll route you to the right one — only sharing what you allow.</p>

      {urgency === 'emergency' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          If you&rsquo;re in immediate danger, call <strong>911</strong>. For crisis support, call or text <strong>988</strong>.
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-harbor-800">What do you need help with?</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setCategory(key)}
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium ${category === key ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-harbor-800">How urgent?</label>
          <div className="flex flex-wrap gap-2">
            {URGENCY.map((u) => (
              <button key={u} onClick={() => setUrgency(u)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium capitalize ${urgency === u ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>{u}</button>
            ))}
          </div>
        </div>
        <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={3} placeholder="Share only what you're comfortable with (optional)"
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-teal-500" />
        <Button variant="harbor" size="lg" className="w-full" onClick={request} disabled={saving}>{saving ? 'Sending…' : 'Connect me with a person'}</Button>
      </div>

      {!loading && requests.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-harbor-800">Your requests</h2>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
                <span className="text-sm capitalize text-harbor-800">{r.category} · {r.urgency}</span>
                <span className="text-xs capitalize text-gray-500">{r.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
