'use client';
import { useEffect, useState } from 'react';

export function OfflineChip() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return (
    <span
      role="status"
      className={`rounded-full px-3 py-1 text-xs font-semibold ${online ? 'bg-green-600 text-white' : 'bg-amber-500 text-black'}`}
    >
      {online ? '● Online' : '● Offline — changes will carry'}
    </span>
  );
}
