'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trustDb } from '@/lib/trust/db';
import { enablePush } from '@/lib/notifications/push';

const EVENT_TYPES = [
  { key: 'ubi', label: 'UBI & rewards' },
  { key: 'message', label: 'Messages' },
  { key: 'governance', label: 'Voice / proposals' },
  { key: 'media', label: 'Media & creators' },
  { key: 'justice', label: 'MiJustice' },
  { key: 'commerce', label: 'Orders & shop' },
  { key: 'social', label: 'Community' },
  { key: 'safety', label: 'Safety' },
];

interface Pref { event_type: string; in_app: boolean; push: boolean; email: boolean; neutral_preview: boolean; }

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Record<string, Pref>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = trustDb();
      const { data } = await db.from('notification_prefs').select('*');
      const map: Record<string, Pref> = {};
      (data ?? []).forEach((p: Pref) => { map[p.event_type] = p; });
      setPrefs(map);
      setLoading(false);
    })();
  }, []);

  async function toggle(eventType: string, field: 'in_app' | 'push' | 'email' | 'neutral_preview') {
    const db = trustDb();
    const { data: userData } = await db.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) { toast.error('Please sign in.'); return; }
    const current = prefs[eventType] ?? { event_type: eventType, in_app: true, push: true, email: false, neutral_preview: false };
    const next = { ...current, [field]: !current[field] };
    setPrefs((p) => ({ ...p, [eventType]: next }));
    await db.from('notification_prefs').upsert(
      { user_id: uid, event_type: eventType, in_app: next.in_app, push: next.push, email: next.email, neutral_preview: next.neutral_preview },
      { onConflict: 'user_id,event_type' }
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-harbor-800"><Bell className="h-6 w-6 text-teal-600" /> Notifications</h1>
      <p className="text-gray-500">Control what reaches you, and how. Neutral preview hides sensitive text on shared devices.</p>

      <div className="flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50 p-4">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-teal-600" />
          <span className="text-sm text-harbor-800">Get push notifications on this device</span>
        </div>
        <Button variant="default" size="sm" onClick={async () => {
          const r = await enablePush();
          if (r.ok) toast.success('Push enabled on this device.');
          else if (r.reason === 'denied') toast.error('Permission denied.');
          else if (r.reason === 'unsupported') toast.error('This browser does not support push.');
          else toast.error('Could not enable push.');
        }}>Enable</Button>
      </div>

      {loading ? <div className="h-40 animate-pulse rounded-xl bg-gray-100" /> : (
        <div className="space-y-2">
          {EVENT_TYPES.map((e) => {
            const p = prefs[e.key] ?? { in_app: true, push: true, email: false, neutral_preview: false };
            return (
              <div key={e.key} className="rounded-xl border border-gray-100 bg-white p-4">
                <p className="mb-2 font-semibold text-harbor-800">{e.label}</p>
                <div className="flex flex-wrap gap-2">
                  {(['in_app', 'push', 'email', 'neutral_preview'] as const).map((f) => (
                    <button key={f} onClick={() => toggle(e.key, f)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${(p as Pref)[f] ? 'border-teal-500 bg-teal-50 text-harbor-900' : 'border-gray-200 text-gray-500'}`}>
                      {f === 'in_app' ? 'In-app' : f === 'neutral_preview' ? 'Neutral preview' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
