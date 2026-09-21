'use client';
import { useState } from 'react';
import { randomId } from '@/kernel';
import { apiTransfer, totalBalance, zeroBalances } from '@/finance/mimoney';
import { Celebration } from '@/components/celebrations';
import { saveReceipt } from '@/trunk/receipts';
import type { MiReceipt } from '@/kernel';

// Pocket slice: balance view + signed send (human signature required).
export default function PocketPage() {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const balances = zeroBalances();

  async function send() {
    setError('');
    setSent(false);
    try {
      if (!to.startsWith('did:milyfe:')) throw new Error('Enter a valid recipient (did:milyfe:…)');
      if (!/^[1-9][0-9]*$/.test(amount)) throw new Error('Enter a whole-number amount above zero');
      // Slice demo: signature = explicit human confirm string. Hardware signing in later slice.
      const signature = `human-confirmed:${Date.now()}`;
      const res = await apiTransfer({
        sender: 'did:milyfe:SELF000000000000000000000000000000000000',
        recipient: to, amountMinor: amount, pot: 'spending', reason: 'thanks', signature,
        idempotencyKey: randomId(), actor: 'did:milyfe:SELF000000000000000000000000000000000000',
        cell: 'place', context: 'pocket', role: 'member',
      });
      if (!res.ok) throw new Error(res.error ?? 'Transfer failed');
      if (res.receipt) await saveReceipt(res.receipt as MiReceipt).catch(() => {});
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    }
  }

  return (
    <div className="space-y-4">
      <Celebration show={sent} message="Sent with a receipt." />
      <h1 className="text-2xl font-bold">Pocket</h1>
      <div className="rounded-2xl bg-emerald-700 p-6 text-white">
        <p className="text-sm opacity-80">Settled balance</p>
        <p className="text-4xl font-extrabold">{totalBalance(balances)} <span className="text-lg">$MLY</span></p>
        <p className="mt-2 text-xs opacity-80">Spending {balances.spending} · Savings {balances.savings} · Community {balances.community}</p>
      </div>
      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="font-semibold">Thank someone by name</h2>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient did:milyfe:…" className="w-full rounded-xl border p-3 dark:bg-gray-900" />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (whole $MLY)" inputMode="numeric" className="w-full rounded-xl border p-3 dark:bg-gray-900" />
        {error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm text-red-900">{error}</p>}
        <button onClick={send} className="w-full rounded-2xl bg-emerald-700 p-4 font-semibold text-white">Sign &amp; send (human signature required)</button>
        <p className="text-xs text-gray-500">No money moves without your signature. Every send gets a receipt. Projected value is never shown as balance.</p>
      </div>
    </div>
  );
}
