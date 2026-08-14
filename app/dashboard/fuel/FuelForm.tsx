'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { litersFor } from '@/lib/fuel'

interface Props {
  entryId?: string
  initial?: {
    date: string
    odometer: number
    pricePerLiter: number
    totalPrice: number
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function FuelForm({ entryId, initial }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [date, setDate] = useState(initial?.date ?? today())
  const [odometer, setOdometer] = useState(initial ? String(initial.odometer) : '')
  const [pricePerLiter, setPricePerLiter] = useState(initial ? String(initial.pricePerLiter) : '')
  const [totalPrice, setTotalPrice] = useState(initial ? String(initial.totalPrice) : '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const liters = litersFor({ totalPrice: Number(totalPrice) || 0, pricePerLiter: Number(pricePerLiter) || 0 })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(entryId ? `/api/fuel/${entryId}` : '/api/fuel', {
      method: entryId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        odometer: Number(odometer),
        pricePerLiter: Number(pricePerLiter),
        totalPrice: Number(totalPrice),
      }),
    })

    if (res.ok) {
      router.push('/dashboard/fuel')
      router.refresh()
    } else {
      setError(await readErrorMessage(res, t.fuel.saveFailed))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium">{t.fuel.date}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.fuel.odometer}</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.fuel.pricePerLiter}</label>
        <input
          type="number"
          step="0.001"
          min="0.001"
          value={pricePerLiter}
          onChange={(e) => setPricePerLiter(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.fuel.totalPrice}</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      {liters > 0 && <p className="text-sm text-slate-500">{t.fuel.litersComputed(liters)}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-brand-navy py-2.5 text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {t.common.save}
      </button>
    </form>
  )
}
