'use client';
import { useEffect, useState } from 'react';
import { pendingOutbox, syncOutbox } from '@/kernel';
import { classify } from '@/trunk/miwalk';

// SyncPanel: honest offline queue — what is waiting, what it means, one-tap retry.
export function SyncPanel() {
  const [pending, setPending] = useState<{ key: string; op: string }[]>([]);
  const [msg, setMsg] = useState('');

  async function refresh() {
    const items = await pendingOutbox().catch(() => []);
    setPending(items.map((i) => ({ key: i.key, op: i.op })));
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  async function syncNow() {
    setMsg('Syncing…');
    const res = await syncOutbox(async (item) => {
      const r = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(item.params),
      });
      if (!r.ok) throw new Error(`SYNC_${r.status}`);
    }).catch(() => ({ acked: 0, failed: pending.length }));
    await refresh();
    setMsg(res.failed > 0
      ? `${res.acked} sent, ${res.failed} still waiting (sign-in or connection needed). Nothing was lost.`
      : `${res.acked} sent. Queue clear.`);
  }

  if (pending.length === 0) return null;

  return (
    <div role="status" className="space-y-2 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
      <p className="font-semibold">{pending.length} change{pending.length === 1 ? '' : 's'} waiting to send</p>
      <ul className="text-sm">
        {pending.slice(0, 5).map((p) => (
          <li key={p.key}>• {p.op} — {classify({ op: p.op, family: p.op.startsWith('money') ? 'money' : 'data' })}</li>
        ))}
      </ul>
      <button onClick={syncNow} className="w-full rounded-2xl bg-amber-500 p-3 font-semibold text-black">Try sending now</button>
      {msg && <p className="text-sm">{msg}</p>}
      <p className="text-xs text-gray-500">Money changes always wait for a human confirmation step. They never send themselves.</p>
    </div>
  );
}
