'use client'

import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dictionary, Locale, dictionaries } from './dictionaries'
import { LOCALE_COOKIE } from './cookie'

interface LocaleContextValue {
  locale: Locale
  t: Dictionary
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const [current, setCurrent] = useState(locale)

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    setCurrent(next)
    router.refresh()
  }

  return (
    <LocaleContext.Provider value={{ locale: current, t: dictionaries[current], setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider')
  return ctx
}
