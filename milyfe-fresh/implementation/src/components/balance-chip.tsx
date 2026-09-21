'use client';
import { useEffect, useState } from 'react';
import { getDoc } from '@/kernel';

export function BalanceChip() {
  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    getDoc<{ total: string }>('pocket', 'balance')
      .then((b) => setBalance(b?.total ?? '0'))
      .catch(() => setBalance('0'));
  }, []);
  return (
    <span role="status" aria-label="MLY balance" className="breathe rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white">
      {balance === null ? '… $MLY' : `${balance} $MLY`}
    </span>
  );
}
