'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Messages } from './messages/en';
import { interpolate } from './dictionary';

type Ctx = { lang: string; messages: Messages };
const I18nContext = createContext<Ctx | null>(null);

/**
 * Wraps the app with the active language's message catalog (provided by a
 * server component that called getDictionary). Client components read it via
 * useT(). Falls back gracefully if used outside a provider.
 */
export function I18nProvider({
  lang,
  messages,
  children,
}: {
  lang: string;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ lang, messages }), [lang, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Translation hook. Usage: const t = useT(); t('landing.heroTitle')
 * Dotted key path into the Messages catalog; supports {var} interpolation.
 */
export function useT() {
  const ctx = useContext(I18nContext);
  return function t(key: string, vars?: Record<string, string | number>): string {
    if (!ctx) return key;
    const parts = key.split('.');
    let cur: any = ctx.messages;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur == null) return key; // missing key → show the key (visible in dev)
    }
    return typeof cur === 'string' ? interpolate(cur, vars) : key;
  };
}

export function useLang() {
  return useContext(I18nContext)?.lang ?? 'en';
}
