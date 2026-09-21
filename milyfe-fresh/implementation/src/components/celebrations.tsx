'use client';
import { useEffect, useState } from 'react';

// Any screen can burst into brief, non-blocking celebration when good things happen.
export function Celebration({ show, message }: { show: boolean; message: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [show]);
  if (!visible) return null;
  return (
    <div role="status" className="celebrate fixed inset-x-0 top-16 z-50 mx-auto w-fit rounded-2xl bg-emerald-600 px-6 py-3 text-white shadow-xl">
      {message}
    </div>
  );
}
