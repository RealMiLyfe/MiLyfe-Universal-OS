'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car, Home, Search, Info, MessageSquare, CheckCircle2, XCircle,
  X, Bell, Camera, ArrowLeft, ShieldAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RIGHTS_GUIDES, type RightsGuide } from '@/lib/justice/content';

/**
 * Encounter Mode — the panic flow.
 * Designed for one-handed, low-light, offline use during a real encounter.
 * Content is read from the static content lib so it works with no signal.
 * Triple-tap the header area to instantly exit to a neutral screen (duress).
 */

const ICONS: Record<string, LucideIcon> = { car: Car, home: Home, search: Search };
const ENCOUNTER_SLUGS = ['traffic-stop', 'ice-at-your-door', 'being-arrested', 'searched-without-warrant'];
const GUIDES = RIGHTS_GUIDES.filter((g) => ENCOUNTER_SLUGS.includes(g.slug));

export default function EncounterModePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<RightsGuide | null>(null);

  // Duress: triple-tap the top bar to bail out fast.
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleDuressTap = useCallback(() => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      // Leave to a neutral surface immediately.
      router.replace('/home');
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 600);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Top bar (triple-tap = duress exit) */}
      <div
        onClick={handleDuressTap}
        className="flex items-center justify-between border-b border-gray-100 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-mly-600" aria-hidden="true" />
          <span className="font-bold text-harbor-800">Encounter Mode</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); router.push('/justice/app/home'); }}
          aria-label="Close Encounter Mode"
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!selected ? (
          <>
            <p className="mb-1 text-center text-sm text-gray-500">Tap what&rsquo;s happening now</p>
            <p className="mb-4 text-center text-[11px] text-gray-400">
              Works offline. Triple-tap the top bar to exit instantly.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {GUIDES.map((g) => {
                const Icon = ICONS[g.icon] ?? ShieldAlert;
                return (
                  <button
                    key={g.slug}
                    onClick={() => setSelected(g)}
                    className="flex min-h-[80px] items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all active:scale-[0.98]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50">
                      <Icon className="h-7 w-7 text-teal-600" aria-hidden="true" />
                    </div>
                    <span className="text-lg font-bold text-harbor-800">{g.situation}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelected(null)}
              className="mb-3 inline-flex items-center gap-1 text-sm text-teal-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-xl font-bold text-harbor-800">{selected.situation}</h1>
            <ol className="mt-4 space-y-3">
              {selected.steps.map((step, i) => (
                <li key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  {step.say && (
                    <p className="flex items-start gap-2">
                      <MessageSquare className="mt-1 h-6 w-6 shrink-0 text-teal-600" aria-hidden="true" />
                      <span className="text-xl font-bold leading-snug text-harbor-900">{step.say}</span>
                    </p>
                  )}
                  {step.doThis && (
                    <p className="flex items-start gap-2 text-harbor-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
                      <span className="text-base">{step.doThis}</span>
                    </p>
                  )}
                  {step.dont && (
                    <p className="flex items-start gap-2 text-harbor-800">
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
                      <span className="text-base">{step.dont}</span>
                    </p>
                  )}
                  {step.note && (
                    <p className="flex items-start gap-2 text-gray-600">
                      <Info className="mt-0.5 h-5 w-5 shrink-0 text-harbor-400" aria-hidden="true" />
                      <span className="text-sm">{step.note}</span>
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="space-y-2 border-t border-gray-100 bg-white p-3 safe-area-bottom">
        <Button variant="destructive" size="lg" className="w-full" disabled>
          <Camera className="mr-2 h-5 w-5" /> Record (setup required)
        </Button>
        <Button variant="mly" size="lg" className="w-full" disabled>
          <Bell className="mr-2 h-5 w-5" /> Alert My People (add contacts first)
        </Button>
        <p className="text-center text-[10px] text-gray-400">
          Recording &amp; alerts activate once you add rapid-response contacts in Settings.
        </p>
      </div>
    </div>
  );
}
