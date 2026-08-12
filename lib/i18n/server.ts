import { cookies } from 'next/headers'
import { dictionaries, Locale } from './dictionaries'
import { LOCALE_COOKIE, parseLocale } from './cookie'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  return parseLocale(store.get(LOCALE_COOKIE)?.value)
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale]
}

export async function getT() {
  const locale = await getLocale()
  return { locale, t: getDictionary(locale) }
}
