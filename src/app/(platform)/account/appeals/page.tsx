'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Scale, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trustDb } from '@/lib/trust/db';

interface Appeal { id: string; decision_type: string; reason: string; status: string; created_at: string; }
const TYPES = ['moderation', 'standing', 'ban', 'shop_dispute', 'contribution_reject', 'role_removal'];

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filing, setFiling] = useState(false);
  const [type, setType] = useState('moderation');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const db = trustDb();
    const { data } = await db.from('mi_appeals').select('*').order('created_at', { ascending: false });
    setAppeals(data ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function file() {
    if (!reason.trim()) { toast.error('Add a reason.'); return; }
    setSaving(true);
    try {
      const db = trustDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { toast.error('Please sign in.'); return; }
      const { error } = await db.from('mi_appeals').insert({ appellant_id: uid, decision_type: type, reason: reason.trim(), evidence: evidence.trim() || null });
      if (error) throw error;
      setReason(''); setEvidence(''); setFiling(false);
      toast.success('Appeal filed. An independent reviewer will look at it.');
      load();
    } catch { toast.error('Could not file appeal.'); }
    finally { setSaving(false); }
  }

  const STATUS: Record<string, string> = { submitted: 'bg-gray-100 text-gray-600', under_review: 'bg-mly-100 text-mly-800', upheld: 'bg-red-100 text-red-700', overturned: 'bg-green-100 text-green-700', remedied: 'bg-green-100 text-green-700', escalated: 'bg-orange-100 text-orange-700' };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Scale className="h-6 w-6 text-teal-600" /> Appeals</h1>
        <Button variant="default" size="sm" onClick={() => setFiling((f) => !f)}><Plus className="mr-1 h-4 w-4" /> File appeal</Button>
      </div>
      <p className="text-gray-500">Challenge any decision — moderation, standing, a dispute. Independent review, with a fair process.</p>

      {filing && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${type === t ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-600'}`}>{t.replace('_', ' ')}</button>
            ))}
          </div>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you appealing?" />
          <textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} rows={3} placeholder="Any evidence or context (optional)"
            className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-teal-500" />
          <Button variant="harbor" onClick={file} disabled={saving} className="w-full">File appeal</Button>
        </div>
      )}

      {loading ? <div className="h-20 animate-pulse rounded-xl bg-gray-100" /> :
        appeals.length === 0 ? <p className="text-sm text-gray-500">No appeals filed.</p> : (
        <div className="space-y-2">
          {appeals.map((a) => (
            <div key={a.id} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-harbor-800 capitalize">{a.decision_type.replace('_', ' ')}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS[a.status] ?? STATUS.submitted}`}>{a.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-gray-600">{a.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
