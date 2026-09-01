'use client';

import { useState, useTransition } from 'react';
import { Languages, Check } from 'lucide-react';
import { LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/i18n/languages';
import { updateLanguage } from '@/lib/actions/profile';

interface Props {
 current?: string | null;
}

export function LanguageSelector({ current }: Props) {
 const [selected, setSelected] = useState(current || DEFAULT_LANGUAGE);
 const [isPending, startTransition] = useTransition();
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState<string | null>(null);

 function choose(code: string) {
 if (code === selected) return;
 const prev = selected;
 setSelected(code);
 setError(null);
 setSaved(false);
 startTransition(async () => {
 const res = await updateLanguage(code);
 if (res.error) {
 setSelected(prev); // revert on failure
 setError(res.error);
 } else {
 setSaved(true);
 // reflect immediately for direction-sensitive scripts
 const lang = LANGUAGES.find((l) => l.code === code);
 if (typeof document !== 'undefined') {
 document.documentElement.lang = code;
 document.documentElement.dir = lang?.rtl ? 'rtl' : 'ltr';
 }
 setTimeout(() => setSaved(false), 2000);
 }
 });
 }

 return (
 <div className="rounded-lg border border-border bg-card p-4">
 <div className="mb-3 flex items-center gap-2">
 <Languages className="h-4 w-4 text-muted-foreground" />
 <span className="text-sm font-medium text-card-foreground">Language</span>
 {isPending && <span className="text-xs text-muted-foreground">saving…</span>}
 {saved && <span className="text-xs text-teal-600">saved ✓</span>}
 </div>

 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
 {LANGUAGES.map((lang) => {
 const active = lang.code === selected;
 return (
 <button
 key={lang.code}
 type="button"
 onClick={() => choose(lang.code)}
 disabled={isPending}
 aria-pressed={active}
 className={
 'flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:opacity-60 ' +
 (active
 ? 'border-teal-500 bg-teal-50 text-teal-900 '
 : 'border-border bg-background text-foreground hover:bg-muted')
 }
 >
 <span className="truncate" dir={lang.rtl ? 'rtl' : 'ltr'}>{lang.nativeName}</span>
 {active && <Check className="h-4 w-4 shrink-0 text-teal-600" />}
 </button>
 );
 })}
 </div>

 {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
 <p className="mt-3 text-xs text-muted-foreground">
 MiLyfe belongs to everyone. Choose the language you want to use — more are added over time.
 </p>
 </div>
 );
}
