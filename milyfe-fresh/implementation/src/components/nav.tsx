'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/pocket', label: 'Pocket' },
  { href: '/learn', label: 'Learn' },
  { href: '/street', label: 'Street' },
  { href: '/voice', label: 'Voice' },
  { href: '/you', label: 'You' },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav aria-label="MiLyfe tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto grid max-w-2xl grid-cols-5">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={path === t.href ? 'page' : undefined}
            className={`py-3 text-center text-sm font-semibold ${path === t.href ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
