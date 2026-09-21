import type { Metadata, Viewport } from 'next';
import { BalanceChip } from '@/components/balance-chip';
import { Nav } from '@/components/nav';
import { OfflineChip } from '@/components/offline-chip';
import { VibeBar } from '@/components/vibe-bar';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiLyfe Tree V1',
  description: 'One signup, one profile, your whole life together — people-owned, offline-first.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = { themeColor: '#047857', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/95">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2">
            <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">MiLyfe</span>
            <div className="flex items-center gap-2">
              <OfflineChip />
              <BalanceChip />
            </div>
          </div>
          <div className="mx-auto max-w-2xl px-4">
            <VibeBar items={[{ label: 'Radios up', state: 'good' }, { label: 'Food pin 2 blocks', state: 'watch' }]} />
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">{children}</main>
        <Nav />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});}`,
          }}
        />
      </body>
    </html>
  );
}
