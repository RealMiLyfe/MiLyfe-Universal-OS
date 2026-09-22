'use client';
import type { ReactNode } from 'react';

export const tdid = (n: string) => `did:milyfe:${(n + '0'.repeat(40)).slice(0, 40)}`;
export const human = (n: string) => ({ did: tdid(n), kind: 'human' as const });
export const NOW = '2026-06-01T00:00:00Z';
export const LATER = '2027-01-01T00:00:00Z';
export const approval = (by: string, reason: string) => ({ by, at: NOW, reason });

export function Card({ os, title, children }: { os: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{os}</p>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </section>
  );
}

export function Btn({ onClick, children, disabled }: { onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mr-2 rounded-xl bg-emerald-700 px-3 py-1.5 font-semibold text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function Out({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-gray-100 p-2 text-xs dark:bg-gray-800">{children}</pre>
  );
}
