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

/** Read the active language: cookie first, else default. */
export async function getActiveLanguage(): Promise<string> {
  const fromCookie = cookies().get(LANG_COOKIE)?.value;
  return isSupportedLanguage(fromCookie) ? (fromCookie as string) : DEFAULT_LANGUAGE;
}
