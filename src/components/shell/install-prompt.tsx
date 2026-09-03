'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

/**
 * PWA install prompt. Captures beforeinstallprompt and offers a light,
 * dismissible banner. Non-intrusive; respects a session dismissal.
 */
interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('mi-install-dismissed')) return;
    function onBIP(e: Event) {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    }
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  function dismiss() {
    setShow(false);
    try { sessionStorage.setItem('mi-install-dismissed', '1'); } catch { /* ignore */ }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setShow(false);
    setDeferred(null);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-gray-100 bg-white/95 p-3 shadow-lg backdrop-blur-xl md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50">
          <Download className="h-5 w-5 text-teal-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-harbor-800">Install MiLyfe</p>
          <p className="text-xs text-gray-500">Add to your home screen. Works offline.</p>
        </div>
        <button onClick={install} className="rounded-lg bg-harbor-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-harbor-900">Install</button>
        <button onClick={dismiss} aria-label="Dismiss" className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
