'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'

interface LocationOption {
  id: string
  name: string
  fixedKm: number
  isDefault: boolean
}

interface Props {
  locations: LocationOption[]
  tripId?: string
  initial?: {
    date: string
    locationId: string
    km: number
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function TripForm({ locations, tripId, initial }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const defaultLocationId =
    initial?.locationId ?? locations.find((l) => l.isDefault)?.id ?? locations[0]?.id ?? ''
  const [date, setDate] = useState(initial?.date ?? today())
  const [locationId, setLocationId] = useState(defaultLocationId)
  const [km, setKm] = useState<string>(
    initial ? String(initial.km) : String(locations.find((l) => l.id === defaultLocationId)?.fixedKm ?? '')
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLocationChange(id: string) {
    setLocationId(id)
    const found = locations.find((l) => l.id === id)
    if (found) setKm(String(found.fixedKm))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(tripId ? `/api/trips/${tripId}` : '/api/trips', {
      method: tripId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, locationId, km: Number(km) }),
    })

    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(await readErrorMessage(res, t.trip.saveFailed))
      setLoading(false)
    }
  }

  if (locations.length === 0) {
    return (
      <div className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">{t.trip.noLocations}</p>
        <Link href="/dashboard/locations/new" className="text-sm underline">
          {t.trip.addLocation}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium">{t.trip.date}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.trip.location}</label>
        <select
          value={locationId}
          onChange={(e) => handleLocationChange(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.trip.km}</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
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
