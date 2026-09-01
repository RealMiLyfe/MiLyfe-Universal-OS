'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet, GraduationCap, Store, Landmark, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';

const MOBILE_NAV = [
 { href: '/wallet', label: 'Pocket', icon: Wallet },
 { href: '/learn', label: 'Learn', icon: GraduationCap },
 { href: '/street', label: 'Street', icon: Store },
 { href: '/connect', label: 'Connect', icon: MessageCircle },
 { href: '/governance', label: 'Voice', icon: Landmark },
];

export function BottomNav() {
 const pathname = usePathname();
 const { user } = useAppStore();
 const [unreadCount, setUnreadCount] = useState(0);

 // Load and subscribe to unread message count
 useEffect(() => {
 if (!user) return;
 const supabase = createClient();

 async function loadUnread() {
 const { count } = await supabase
 .from('messages')
 .select('id', { count: 'exact', head: true })
 .eq('receiver_id', user!.id)
 .eq('read', false);
 setUnreadCount(count || 0);
 }

 loadUnread();

 const channel = supabase
 .channel('bottom-nav-unread')
 .on('postgres_changes', {
 event: 'INSERT',
 schema: 'public',
 table: 'messages',
 filter: `receiver_id=eq.${user.id}`,
 }, () => {
 setUnreadCount(c => c + 1);
 })
 .on('postgres_changes', {
 event: 'UPDATE',
 schema: 'public',
 table: 'messages',
 filter: `receiver_id=eq.${user.id}`,
 }, () => {
 // Re-fetch count when messages are marked read
 loadUnread();
 })
 .subscribe();

 return () => { supabase.removeChannel(channel); };
 }, [user]);

 // Reset unread count when user navigates to connect
 useEffect(() => {
 if (pathname.startsWith('/connect') && unreadCount > 0) {
 // Don't reset here — let the chat thread handle mark-as-read
 // Just visually reset when on connect pages
 if (pathname === '/connect') setUnreadCount(0);
 }
 }, [pathname, unreadCount]);

 return (
 <nav
 className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 safe-area-bottom backdrop-blur-xl bg-white/85 "
 aria-label="Mobile navigation"
 >
 <div className="flex items-center justify-around h-16 px-1">
 {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
 const isActive = pathname === href || pathname.startsWith(href + '/');
 const showBadge = href === '/connect' && unreadCount > 0 && !isActive;

 return (
 <Link
 key={href}
 href={href}
 className={cn(
 'relative flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-colors',
 isActive
 ? 'text-teal-600 '
 : 'text-gray-400 '
 )}
 aria-current={isActive ? 'page' : undefined}
 aria-label={`${label}${showBadge ? `, ${unreadCount} unread` : ''}`}
 >
 <div className="relative">
 <Icon className="h-5 w-5" aria-hidden="true" />
 {showBadge && (
 <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-teal-500 text-white text-[9px] font-bold leading-none">
 {unreadCount > 9 ? '9+' : unreadCount}
 </span>
 )}
 </div>
 <span className="text-[10px] font-medium">{label}</span>
 </Link>
 );
 })}
 </div>
 </nav>
 );
}
