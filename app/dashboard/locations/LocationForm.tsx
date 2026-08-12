'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'

interface Props {
  locationId?: string
  initial?: {
    name: string
    fixedKm: number
    isDefault: boolean
  }
}

export default function LocationForm({ locationId, initial }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [name, setName] = useState(initial?.name ?? '')
  const [fixedKm, setFixedKm] = useState(String(initial?.fixedKm ?? 0))
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(locationId ? `/api/locations/${locationId}` : '/api/locations', {
      method: locationId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, fixedKm: Number(fixedKm), isDefault }),
    })

    if (res.ok) {
      router.push('/dashboard/locations')
      router.refresh()
    } else {
      setError(await readErrorMessage(res, t.trip.saveFailed))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium">{t.location.name}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.location.fixedKm}</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={fixedKm}
          onChange={(e) => setFixedKm(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        {t.location.isDefault}
      </label>
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
