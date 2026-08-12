'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { toIntlLocale } from '@/lib/i18n/cookie'

interface MonthlyTotal {
  month: string
  km: number
  fee: number
}

function monthLabel(month: string, intlLocale: string) {
  const [year, m] = month.split('-').map(Number)
  return new Date(year, m - 1, 1).toLocaleDateString(intlLocale, { month: 'short' })
}

function CustomTooltip({
  active,
  payload,
  intlLocale,
}: {
  active?: boolean
  payload?: { payload: MonthlyTotal }[]
  intlLocale: string
}) {
  if (!active || !payload?.length) return null
  const { month, km, fee } = payload[0].payload
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-medium capitalize">{monthLabel(month, intlLocale)}</p>
      <p className="text-slate-600">{km.toFixed(1)} km</p>
      <p className="text-slate-600">&euro; {fee.toFixed(2)}</p>
    </div>
  )
}

export default function MonthlyChart({ data }: { data: MonthlyTotal[] }) {
  const { t, locale } = useLocale()
  const intlLocale = toIntlLocale(locale)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm text-slate-500">{t.dashboard.monthlyChartTitle}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: -20 }}>
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => monthLabel(value, intlLocale)}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip intlLocale={intlLocale} />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="km" fill="#22D3EE" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
