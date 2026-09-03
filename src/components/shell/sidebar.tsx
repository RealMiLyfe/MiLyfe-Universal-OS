'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Wallet,
  Gift,
  Star,
  Landmark,
  Newspaper,
  MessageCircle,
  Heart,
  BookOpen,
  User,
  Grid3X3,
  Trophy,
  GraduationCap,
  Store,
  Shield,
  Scale,
  Sparkles,
  Music,
  Users2,
  ShoppingBag,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store';

// Grouped nav — keeps ~24 destinations navigable without a wall of items.
const NAV_GROUPS: { title: string | null; items: { href: string; label: string; icon: typeof Home }[] }[] = [
  { title: null, items: [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/mi', label: 'Mi', icon: Bot },
  ]},
  { title: 'Money', items: [
    { href: '/wallet', label: 'Pocket', icon: Wallet },
    { href: '/rewards', label: 'Rewards', icon: Gift },
    { href: '/contributions', label: 'Impact', icon: Sparkles },
    { href: '/treasury', label: 'Treasury', icon: Landmark },
  ]},
  { title: 'Create & Learn', items: [
    { href: '/learn', label: 'Learn', icon: GraduationCap },
    { href: '/media', label: 'Media', icon: Music },
  ]},
  { title: 'Commerce', items: [
    { href: '/street', label: 'Street', icon: Store },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
  ]},
  { title: 'Community', items: [
    { href: '/community', label: 'Community', icon: Users2 },
    { href: '/connect', label: 'Connect', icon: Users },
    { href: '/forum', label: 'Forum', icon: MessageCircle },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/governance', label: 'Voice', icon: Landmark },
  ]},
  { title: 'Care & Justice', items: [
    { href: '/health', label: 'Health', icon: Heart },
    { href: '/safety', label: 'Safety', icon: Shield },
    { href: '/justice/app/home', label: 'Justice', icon: Scale },
  ]},
  { title: 'You', items: [
    { href: '/standing', label: 'Standing', icon: Star },
    { href: '/profile', label: 'Profile', icon: User },
  ]},
  { title: 'More', items: [
    { href: '/transparency', label: 'Transparency', icon: BookOpen },
    { href: '/wiki', label: 'Wiki', icon: BookOpen },
    { href: '/bounties', label: 'Bounties', icon: Trophy },
    { href: '/apps', label: 'Apps', icon: Grid3X3 },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppStore();

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 lg:w-60 flex-col border-r border-gray-100 bg-white z-30"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-100">
        <Link href="/home" className="flex items-center gap-2 min-h-0 min-w-0">
          <Image src="/logo.png" alt="MiLyfe" width={88} height={32} priority className="h-8 w-auto max-w-[110px] object-contain" />
        </Link>
      </div>

      {/* Nav items (grouped) */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-3' : ''}>
            {group.title && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{group.title}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[40px]',
                      isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-harbor-800'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-3 border-t border-gray-100">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
              {user.display_name?.slice(0, 2).toUpperCase() || 'MI'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-harbor-800">
                {user.display_name || user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
