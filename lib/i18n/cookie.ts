import { Locale, defaultLocale, locales } from './dictionaries'

export const LOCALE_COOKIE = 'kilometry_locale'

export function parseLocale(value: string | undefined | null): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale
}

export function toIntlLocale(locale: Locale): string {
  return locale === 'nl' ? 'nl-NL' : 'en-US'
}
