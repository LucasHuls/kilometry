'use client'

import { useLocale } from '@/lib/i18n/LocaleProvider'
import { Locale } from '@/lib/i18n/dictionaries'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  const options: { value: Locale; label: string }[] = [
    { value: 'nl', label: 'NL' },
    { value: 'en', label: 'EN' },
  ]

  return (
    <div className="inline-flex rounded border border-slate-300 bg-white p-0.5 text-xs">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          aria-pressed={locale === opt.value}
          className={`rounded px-2 py-1 font-medium ${
            locale === opt.value ? 'bg-brand-navy text-white' : 'text-slate-500 hover:text-brand-navy'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
