'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { NotificationBell } from './notification-bell';

export function TopBar() {
 const { toggleSearch, user } = useAppStore();

 const initials = user?.display_name
 ?.split(' ')
 .map((n: string) => n[0])
 .join('')
 .slice(0, 2)
 .toUpperCase() || 'MI';

 return (
 <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-100 ">
 <div className="flex items-center justify-between h-full px-4">
 <Link href="/home" className="flex items-center min-h-0 min-w-0">
 <Image
 src="/logo.png"
 alt="MiLyfe"
 width={88}
 height={32}
 priority
 className="h-8 w-auto max-w-[110px] object-contain"
 />
 </Link>

 <div className="flex items-center gap-1">
 <button
 onClick={toggleSearch}
 className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors"
 aria-label="Search"
 >
 <Search className="h-5 w-5 text-gray-600 " aria-hidden="true" />
 </button>
 <NotificationBell />
 <Link
 href="/profile"
 className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold ml-0.5"
 aria-label="Your profile"
 >
 {user?.avatar_url ? (
 <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
 ) : (
 initials
 )}
 </Link>
 </div>
 </div>
 </header>
 );
}
