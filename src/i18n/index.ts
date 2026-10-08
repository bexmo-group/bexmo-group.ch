import de from './de';
import en from './en';

export type Dict = typeof de;
export type Locale = 'de' | 'en';

export const locales: Locale[] = ['de', 'en'];
export const defaultLocale: Locale = 'de';

/** BCP 47 tag used for <html lang> and hreflang. */
export const htmlLang: Record<Locale, string> = { de: 'de-CH', en: 'en' };

const dicts: Record<Locale, Dict> = { de, en };

export function getT(locale: Locale): Dict {
  return dicts[locale];
}

/** Path of the home page for a locale (default locale is unprefixed). */
export function homePath(locale: Locale): string {
  return locale === defaultLocale ? '/' : `/${locale}/`;
}

export const EMAIL = 'info@bexmo-group.ch';

export function mailto(subject?: string): string {
  return subject ? `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}` : `mailto:${EMAIL}`;
}
