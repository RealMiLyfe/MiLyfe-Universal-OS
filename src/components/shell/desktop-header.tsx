'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, Plus, Bot, Wallet, ChevronRight, Scale, Send, Store, PenSquare, ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { NotificationBell } from './notification-bell';
import { cn } from '@/lib/utils/cn';

/**
 * DesktopHeader — sticky top bar for md+ screens.
 * Fills the previously-empty desktop header strip. Left: breadcrumb context.
 * Center: visible search pill (opens the global Cmd+K search). Right: $MLY
 * balance chip, quick-create menu, Mi, notifications, avatar.
 * Light MiLyfe styling. Hidden on mobile (the mobile TopBar covers that).
 */

// Map top-level route segments to friendly labels for the breadcrumb.
const SECTION_LABELS: Record<string, string> = {
  home: 'Home', wallet: 'Pocket', learn: 'Learn', street: 'Street',
  governance: 'Voice', mi: 'Mi', connect: 'Connect', rewards: 'Rewards',
  standing: 'Standing', news: 'News', forum: 'Forum', health: 'Health',
  safety: 'Safety', justice: 'Justice', treasury: 'Treasury',
  transparency: 'Transparency', wiki: 'Wiki', profile: 'Profile',
  bounties: 'Bounties', apps: 'Apps',
};

const CREATE_ACTIONS = [
  { href: '/street?new=quest', label: 'New quest', icon: Store },
  { href: '/wallet?send=1', label: 'Send $MLY', icon: Send },
  { href: '/forum?new=1', label: 'New post', icon: PenSquare },
  { href: '/justice/app/defender', label: 'Defend a case', icon: Scale },
  { href: '/justice/app/encounter', label: 'Encounter Mode', icon: ShieldAlert },
];

export function DesktopHeader() {
  const pathname = usePathname();
  const { user, wallet, toggleSearch } = useAppStore();
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateOpen(false);
    }
    if (createOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [createOpen]);

  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0] ? SECTION_LABELS[segments[0]] ?? segments[0] : 'Home';
  // For /justice/app/<mod>, show the module as the second crumb.
  const sub = segments[0] === 'justice' && segments[2] ? prettify(segments[2]) : null;

  const totalBalance = wallet
    ? (wallet.spending_balance ?? 0) + (wallet.savings_balance ?? 0) + (wallet.community_balance ?? 0)
    : 0;

  const initials = user?.display_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'MI';

  return (
    <header className="hidden md:flex fixed top-0 right-0 left-56 lg:left-60 z-20 h-14 items-center gap-3 border-b border-gray-100 bg-white/85 px-4 backdrop-blur-xl">
      {/* Breadcrumb / context */}
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <span className="font-semibold text-harbor-800">{section}</span>
        {sub && (
          <>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
            <span className="truncate text-gray-500">{sub}</span>
          </>
        )}
      </div>

      {/* Search pill (center, flexible) */}
      <button
        onClick={toggleSearch}
        className="mx-auto flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 transition-colors hover:bg-gray-100"
        aria-label="Search"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="flex-1 text-left">Search people, resources, cases…</span>
        <kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400 lg:inline">⌘K</kbd>
      </button>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-1.5">
        {/* $MLY balance chip */}
        <Link
          href="/wallet"
          className="hidden items-center gap-1.5 rounded-full border border-teal-200/60 bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-700 transition-colors hover:bg-teal-100 lg:flex"
        >
          <Wallet className="h-4 w-4" aria-hidden="true" />
          <span className="tabular-nums">{totalBalance.toFixed(0)}</span>
          <span className="text-[11px] font-medium text-teal-600/70">$MLY</span>
        </Link>

        {/* Quick create */}
        <div className="relative" ref={createRef}>
          <button
            onClick={() => setCreateOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-harbor-800 text-white transition-colors hover:bg-harbor-900"
            aria-label="Create"
            aria-expanded={createOpen}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
          {createOpen && (
            <div className="absolute right-0 top-11 w-52 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-slide-up" role="menu">
              {CREATE_ACTIONS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setCreateOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-harbor-800 hover:bg-gray-50"
                  role="menuitem"
                >
                  <Icon className="h-4 w-4 text-teal-600" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mi */}
        <Link
          href="/mi"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
            pathname.startsWith('/mi') ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-100'
          )}
          aria-label="Mi assistant"
        >
          <Bot className="h-5 w-5" aria-hidden="true" />
        </Link>

        {/* Notifications */}
        <NotificationBell />

        {/* Avatar */}
        <Link
          href="/profile"
          className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-700"
          aria-label="Your profile"
        >
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            initials
          )}
        </Link>
      </div>
    </header>
  );
}

function prettify(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
