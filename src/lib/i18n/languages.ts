/**
 * Supported languages for MiLyfe.
 * MiLyfe is universal — anyone, anywhere, from day one. This list is the
 * starting set; more can be added over time. Codes are BCP-47.
 *
 * `nativeName` is shown in the language's own script so a speaker recognizes
 * it regardless of their current UI language.
 */
export interface Language {
  code: string;
  label: string;      // English name
  nativeName: string; // endonym
  rtl?: boolean;      // right-to-left script
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'es', label: 'Spanish', nativeName: 'Español' },
  { code: 'fr', label: 'French', nativeName: 'Français' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português' },
  { code: 'ht', label: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'zh', label: 'Chinese (Simplified)', nativeName: '中文' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'sw', label: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ru', label: 'Russian', nativeName: 'Русский' },
  { code: 'de', label: 'German', nativeName: 'Deutsch' },
  { code: 'vi', label: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'tl', label: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
];

export const DEFAULT_LANGUAGE = 'en';

export function isSupportedLanguage(code: string | null | undefined): boolean {
  return !!code && LANGUAGES.some((l) => l.code === code);
}

export function getLanguage(code: string | null | undefined): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
