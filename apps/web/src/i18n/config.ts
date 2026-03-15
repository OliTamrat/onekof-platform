export const locales = ['en', 'am', 'om', 'ti'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  am: 'አማርኛ',
  om: 'Afaan Oromoo',
  ti: 'ትግርኛ',
};

/**
 * Locales that use Ge'ez (Ethiopic) script and should render with AbyssinicaSIL font.
 * Latin-script locales (en, om) use system fonts.
 */
export const geezScriptLocales: Locale[] = ['am', 'ti'];

export function isGeezScript(locale: Locale): boolean {
  return geezScriptLocales.includes(locale);
}

/**
 * RTL is not needed for any of the Ethiopian languages.
 * Amharic, Tigrinya (Ge'ez script) and Oromo (Latin script) are all LTR.
 */
export const localeDirection: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  am: 'ltr',
  om: 'ltr',
  ti: 'ltr',
};
