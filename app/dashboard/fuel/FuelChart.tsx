'use client'

import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { toIntlLocale } from '@/lib/i18n/cookie'
import { ConsumptionPoint } from '@/lib/fuel'

function dateLabel(iso: string, intlLocale: string) {
  return new Date(iso).toLocaleDateString(intlLocale, { day: 'numeric', month: 'short' })
}

function CustomTooltip({
  active,
  payload,
  intlLocale,
  consumptionLabel,
}: {
  active?: boolean
  payload?: { payload: { date: string; kmPerLiter: number; pricePerLiter: number } }[]
  intlLocale: string
  consumptionLabel: (x: number) => string
}) {
  if (!active || !payload?.length) return null
  const { date, kmPerLiter, pricePerLiter } = payload[0].payload
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{dateLabel(date, intlLocale)}</p>
      <p className="text-brand-cyan">{consumptionLabel(kmPerLiter)}</p>
      <p className="text-brand-navy">&euro; {pricePerLiter.toFixed(3)} /L</p>
    </div>
  )
}

export default function FuelChart({ data }: { data: ConsumptionPoint[] }) {
  const { t, locale } = useLocale()
  const intlLocale = toIntlLocale(locale)

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm text-slate-500">{t.fuel.chartTitle}</p>
        <p className="py-8 text-center text-sm text-slate-400">{t.fuel.notEnoughData}</p>
      </div>
    )
  }

  const chartData = data.map((point) => ({ ...point, date: point.date.toISOString() }))

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm text-slate-500">{t.fuel.chartTitle}</p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ left: -10, right: -10 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => dateLabel(value, intlLocale)}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="consumption"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <YAxis
            yAxisId="price"
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip intlLocale={intlLocale} consumptionLabel={t.fuel.consumptionLabel} />} />
          <Line
            yAxisId="consumption"
            type="monotone"
            dataKey="kmPerLiter"
            stroke="#22D3EE"
            strokeWidth={2}
            dot={{ r: 3, fill: '#22D3EE' }}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="pricePerLiter"
            stroke="#111827"
            strokeWidth={2}
            dot={{ r: 3, fill: '#111827' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-brand-cyan" /> {t.fuel.avgConsumption}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-brand-navy" /> {t.fuel.avgPricePerLiter}
        </span>
      </div>
    </div>
  )
}
