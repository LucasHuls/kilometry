'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { fetchRouteLegsKm, roundKm } from '@/lib/routeClient'
import AddressInput, { AddressValue } from '@/components/AddressInput'

interface Props {
  locationId?: string
  mapsEnabled: boolean
  home: { address: string; placeId: string | null } | null
  initial?: {
    name: string
    fixedKm: number
    address: string | null
    postcode: string | null
    placeId: string | null
    isDefault: boolean
  }
}

export default function LocationForm({ locationId, mapsEnabled, home, initial }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [name, setName] = useState(initial?.name ?? '')
  const [fixedKm, setFixedKm] = useState(String(initial?.fixedKm ?? 0))
  const [address, setAddress] = useState<AddressValue>({
    address: initial?.address ?? '',
    postcode: initial?.postcode ?? '',
    placeId: initial?.placeId ?? '',
  })
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false)
  const [distanceStatus, setDistanceStatus] = useState<'idle' | 'loading' | 'done' | 'failed'>('idle')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAddressChange(next: AddressValue) {
    setAddress(next)
    if (!mapsEnabled || !home || !next.placeId || next.placeId === address.placeId) return
    setDistanceStatus('loading')
    const legs = await fetchRouteLegsKm([
      { placeId: home.placeId, address: home.address },
      { placeId: next.placeId, address: next.address },
    ])
    if (legs) {
      setFixedKm(String(roundKm(legs[0])))
      setDistanceStatus('done')
    } else {
      setDistanceStatus('failed')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(locationId ? `/api/locations/${locationId}` : '/api/locations', {
      method: locationId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        fixedKm: Number(fixedKm),
        address: address.address,
        postcode: address.postcode,
        placeId: address.placeId,
        isDefault,
      }),
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
          maxLength={191}
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      <AddressInput
        value={address}
        onChange={handleAddressChange}
        onPickEstablishment={(placeName) => setName((current) => current || placeName)}
        mapsEnabled={mapsEnabled}
      />
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
        {distanceStatus === 'loading' && <p className="mt-1 text-xs text-slate-500">{t.trip.distanceCalculating}</p>}
        {distanceStatus === 'done' && (
          <p className="mt-1 text-xs text-slate-500">{t.trip.distanceCalculated(fixedKm)}</p>
        )}
        {distanceStatus === 'failed' && <p className="mt-1 text-xs text-amber-600">{t.trip.distanceFailed}</p>}
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
