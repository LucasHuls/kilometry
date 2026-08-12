'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { toIntlLocale } from '@/lib/i18n/cookie'

function lastMonths(count: number, intlLocale: string) {
  const months: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString(intlLocale, { month: 'long', year: 'numeric' })
    months.push({ value, label })
  }
  return months
}

export default function MonthFilter({ month }: { month: string }) {
  const router = useRouter()
  const { locale } = useLocale()
  const months = lastMonths(24, toIntlLocale(locale))

  return (
    <select
      value={month}
      onChange={(e) => router.push(`/dashboard?month=${e.target.value}`)}
      className="rounded border border-slate-300 bg-white px-3 py-2.5 text-sm"
    >
      {months.map((m) => (
        <option key={m.value} value={m.value}>
          {m.label}
        </option>
      ))}
    </select>
  )
}
