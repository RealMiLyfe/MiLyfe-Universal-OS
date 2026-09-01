import en, { type Messages } from './messages/en';
import es from './messages/es';
import ht from './messages/ht';
import { DEFAULT_LANGUAGE } from './languages';

/**
 * Locale catalogs. English is the complete source of truth; other locales
 * may be partial and are deep-merged over English so any missing key falls
 * back to English automatically. Add a new locale by importing its file here.
 */
const CATALOGS: Record<string, Partial<Messages>> = {
  en,
  es,
  ht,
  // fr, pt, zh, ar, hi, sw, ru, de, vi, tl, bn — fall back to English until translated
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const o = (override as any)[key];
    const b = (base as any)[key];
    out[key] = o && typeof o === 'object' && !Array.isArray(o) ? deepMerge(b, o) : o;
  }
  return out as T;
}

/** Get the full, English-fallback-merged message catalog for a language code. */
export function getDictionary(lang: string): Messages {
  const chosen = CATALOGS[lang] ?? CATALOGS[DEFAULT_LANGUAGE];
  return deepMerge(en, chosen as DeepPartial<Messages>);
}

/** Interpolate {placeholders} in a translated string. */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
