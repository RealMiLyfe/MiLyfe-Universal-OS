'use server';

import { cookies } from 'next/headers';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupportedLanguage, DEFAULT_LANGUAGE } from '@/lib/i18n/languages';
import { LANG_COOKIE } from '@/lib/i18n/constants';

/**
 * Set the UI language for the whole experience.
 * - Always writes a cookie (works logged-out, on the public landing page).
 * - If the visitor is signed in, also persists it to their profile so the
 *   choice follows them across devices and drives the in-app experience.
 * This is the single source that both the footer selector (public) and the
 * profile selector (in-app) call, so they stay in sync.
 */
export async function setLanguage(code: string) {
  if (!isSupportedLanguage(code)) {
    return { error: 'Unsupported language' };
  }

  cookies().set(LANG_COOKIE, code, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_language: code, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }
  } catch {
    // ignore — cookie is the fallback that always works
  }

  return { success: true };
}

/**
 * Read the active language. Precedence:
 *   1. cookie (immediate choice, works logged-out)
 *   2. signed-in user's saved profile.preferred_language (follows across devices)
 *   3. default
 */
export async function getActiveLanguage(): Promise<string> {
  const fromCookie = cookies().get(LANG_COOKIE)?.value;
  if (isSupportedLanguage(fromCookie)) return fromCookie as string;

  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single();
      const pref = (data as { preferred_language?: string } | null)?.preferred_language;
      if (isSupportedLanguage(pref)) return pref as string;
    }
  } catch {
    // ignore — fall through to default
  }

  return DEFAULT_LANGUAGE;
}
