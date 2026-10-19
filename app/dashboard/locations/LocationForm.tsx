'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import AddressInput, { AddressValue } from '@/components/AddressInput'

interface Props {
  locationId?: string
  mapsEnabled: boolean
  initial?: {
    name: string
    fixedKm: number
    kmFromRoute: boolean
    address: string | null
    postcode: string | null
    placeId: string | null
    isDefault: boolean
  }
}

export default function LocationForm({ locationId, mapsEnabled, initial }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [name, setName] = useState(initial?.name ?? '')
  const [address, setAddress] = useState<AddressValue>({
    address: initial?.address ?? '',
    postcode: initial?.postcode ?? '',
    placeId: initial?.placeId ?? '',
  })
  const [kmFromRoute, setKmFromRoute] = useState(mapsEnabled && (initial?.kmFromRoute ?? false))
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
      body: JSON.stringify({
        name,
        address: address.address,
        postcode: address.postcode,
        placeId: address.placeId,
        kmFromRoute,
        fixedKm: Number(fixedKm),
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
        onChange={setAddress}
        onPickEstablishment={(placeName) => setName((current) => current || placeName)}
        mapsEnabled={mapsEnabled}
        addressRequired
        postcodeRequired
      />
      <div>
        <p className="mb-2 text-sm font-medium">{t.location.kmSource}</p>
        {mapsEnabled && (
          <div className="mb-2 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="kmSource"
                checked={!kmFromRoute}
                onChange={() => setKmFromRoute(false)}
                className="h-4 w-4 border-slate-300"
              />
              {t.location.kmManual}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="kmSource"
                checked={kmFromRoute}
                onChange={() => setKmFromRoute(true)}
                className="h-4 w-4 border-slate-300"
              />
              {t.location.kmRoute}
            </label>
          </div>
        )}
        {!kmFromRoute && (
          <input
            type="number"
            step="0.1"
            min="0"
            value={fixedKm}
            onChange={(e) => setFixedKm(e.target.value)}
            required
            aria-label={t.location.fixedKm}
            className="w-full rounded border border-slate-300 px-3 py-2.5"
          />
        )}
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
