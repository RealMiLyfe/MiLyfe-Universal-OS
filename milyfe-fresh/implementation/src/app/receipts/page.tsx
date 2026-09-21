'use client';
import { useEffect, useState } from 'react';
import { listDocs, verifyReceipt, type MiReceipt } from '@/kernel';

// Receipts: every consequential action, verifiable on-device. Tap to verify.
export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<MiReceipt[]>([]);
  const [results, setResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    listDocs<MiReceipt>('receipts').then(setReceipts).catch(() => setReceipts([]));
  }, []);

  async function check(id: string) {
    const r = receipts.find((x) => x.id === id);
    if (!r) return;
    const valid = await verifyReceipt(r);
    setResults((prev) => ({ ...prev, [id]: valid }));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Receipts</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Proof of what happened, in plain words. Tap any receipt to check its signature on this device.
      </p>
      {receipts.length === 0 && (
        <div className="rounded-2xl border p-4 text-sm">No receipts yet. Send thanks in Pocket or finish onboarding to earn your first.</div>
      )}
      {receipts.map((r) => (
        <button key={r.id} onClick={() => check(r.id)} className="block w-full rounded-2xl border bg-white p-4 text-left dark:bg-gray-900">
          <p className="font-semibold">{r.purpose}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{r.explains}</p>
          <p className="mt-2 text-xs text-gray-500">
            {r.branch}/{r.os} · {r.status} · {new Date(r.at).toLocaleString()}
            {results[r.id] === true && ' · ✓ signature valid'}
            {results[r.id] === false && ' · ✗ INVALID — report this'}
          </p>
        </button>
      ))}
    </div>
  );
}
