'use client';
import { useState } from 'react';
import { db } from '@/kernel';
import { panicFreeze } from '@/trunk/misecurity';

// You slice: safety one tap away + one-tap export (works even during dispute).
export default function YouPage() {
  const [msg, setMsg] = useState('');

  async function leaveNow() {
    const entity = prompt('Confirm leave-now: type your profile name');
    if (!entity) return;
    await panicFreeze(entity);
    setMsg('Leave-now activated: sessions ended, location hidden, jar freeze requested. Help: call 911 if in danger.');
  }

  async function exportAll() {
    const [kv, docs, events, outbox] = await Promise.all([
      db.kv.toArray(), db.docs.toArray(), db.events.toArray(), db.outbox.toArray(),
    ]);
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), kv, docs, events, outbox }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'milyfe-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Export downloaded. It always works — even during a dispute.');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">You</h1>
      <button onClick={leaveNow} className="w-full rounded-2xl bg-red-600 p-4 font-bold text-white">Leave now (one tap)</button>
      <p className="text-sm text-gray-600 dark:text-gray-300">Freezes jars, hides location, ends sessions. Safety is not earned.</p>
      <button onClick={exportAll} className="w-full rounded-2xl border p-4 font-semibold">Export everything (one tap)</button>
      {msg && <p role="status" className="rounded-xl bg-emerald-100 p-3 text-sm text-emerald-900">{msg}</p>}
      <div className="rounded-2xl border p-4 text-sm">
        <p>Right now, sharing controls live here. Full privacy dashboard in the next slice.</p>
      </div>
    </div>
  );
}
