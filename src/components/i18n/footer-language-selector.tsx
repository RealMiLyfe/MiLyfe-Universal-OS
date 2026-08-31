'use client';

import { useState, useEffect, useTransition } from 'react';
import { Languages } from 'lucide-react';
import { LANGUAGES } from '@/lib/i18n/languages';
import { setLanguage } from '@/lib/i18n/set-language';
import { LANG_COOKIE } from '@/lib/i18n/constants';

/**
 * Public, login-free language selector for the landing-page footer.
 * Writes the shared cookie (via setLanguage), which also syncs to the
 * user's profile if they happen to be signed in — keeping the footer and
 * the in-app profile selector in sync as one setting.
 */
export function FooterLanguageSelector() {
  const [value, setValue] = useState('en');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const m = document.cookie.match(new RegExp('(?:^|; )' + LANG_COOKIE + '=([^;]+)'));
    if (m) setValue(decodeURIComponent(m[1]));
  }, []);

  function onChange(code: string) {
    setValue(code);
    const lang = LANGUAGES.find((l) => l.code === code);
    document.documentElement.lang = code;
    document.documentElement.dir = lang?.rtl ? 'rtl' : 'ltr';
    startTransition(async () => {
      await setLanguage(code);
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Choose language</span>
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-200 dark:border-harbor-700 bg-white dark:bg-harbor-900 px-2 py-1 text-sm text-harbor-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
