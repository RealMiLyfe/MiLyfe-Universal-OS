'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ReceiptText, ArrowLeft } from 'lucide-react';
import { ReceiptCard } from '@/components/trust/receipt-card';
import { trustDb } from '@/lib/trust/db';
import { LEVEL_RANK, type MiReceipt, type VerificationLevel } from '@/lib/trust/types';

const LEVEL_LABEL: Record<VerificationLevel, string> = {
  none: 'Not verified',
  auto: 'Verified (email/phone)',
  peer_attested: 'Peer-attested',
  steward_reviewed: 'Steward-reviewed',
};

export default function ActivityReceiptsPage() {
  const [receipts, setReceipts] = useState<MiReceipt[]>([]);
  const [level, setLevel] = useState<VerificationLevel>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const db = trustDb();
      const { data: userData } = await db.auth.getUser();
      const uid = userData.user?.id;
      const [{ data: recs }, { data: vers }] = await Promise.all([
        db.from('mi_receipts').select('*').order('created_at', { ascending: false }).limit(50),
        uid ? db.from('mi_verifications').select('level').eq('user_id', uid).eq('status', 'active') : Promise.resolve({ data: [] }),
      ]);
      setReceipts(recs ?? []);
      // Highest active level wins.
      const levels: VerificationLevel[] = ((vers ?? []) as { level: VerificationLevel }[]).map((v) => v.level);
      const best: VerificationLevel = levels.sort((a, b) => LEVEL_RANK[b] - LEVEL_RANK[a])[0] ?? 'none';
      setLevel(best);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-teal-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-harbor-800">Activity &amp; Receipts</h1>
        <p className="text-gray-500">A plain-English record of everything that happened, and who can see it.</p>
      </div>

      {/* Verification status */}
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
            <ShieldCheck className="h-5 w-5 text-teal-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-harbor-800">Verification: {LEVEL_LABEL[level]}</p>
            <p className="text-xs text-gray-500">
              Verification keeps the community economy fair. Higher levels unlock more trust
              (peer-attested by neighbors, steward-reviewed for higher-value actions).
            </p>
          </div>
        </div>
      </div>

      {/* Receipts */}
      <section>
        <h2 className="mb-3 font-semibold text-harbor-800">Your receipts</h2>
        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ) : receipts.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center">
            <ReceiptText className="mx-auto mb-2 h-8 w-8 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-500">No receipts yet. Consequential actions will show up here with full transparency.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((r) => <ReceiptCard key={r.id} receipt={r} />)}
          </div>
        )}
      </section>
    </div>
  );
}
