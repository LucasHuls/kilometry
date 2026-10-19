'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { formatAddress } from '@/lib/normalize'
import { fetchRouteLegsKm, roundKm } from '@/lib/routeClient'
import AddressInput, { AddressValue } from '@/components/AddressInput'

interface LocationOption {
  id: string
  name: string
  fixedKm: number
  kmFromRoute: boolean
  address: string | null
  postcode: string | null
  placeId: string | null
  isDefault: boolean
}

interface HomeAddress {
  address: string
  postcode: string | null
  placeId: string | null
}

interface InitialStop {
  position: number
  isHome: boolean
  locationId: string | null
  name: string | null
  address: string | null
  postcode: string | null
  placeId: string | null
}

interface Props {
  locations: LocationOption[]
  home: HomeAddress | null
  mapsEnabled: boolean
  tripId?: string
  defaultReturnTrip?: boolean
  initial?: {
    date: string
    stops: InitialStop[]
    description: string | null
    km: number
    returnKm: number | null
    isReturnTrip: boolean
  }
}

const HOME = '__home__'
const OTHER = '__other__'
const MAX_STOPS = 10

// `choice` is HOME, OTHER or a location id; name/address only matter for OTHER.
interface StopDraft {
  key: number
  choice: string
  name: string
  address: AddressValue
}

const emptyAddress: AddressValue = { address: '', postcode: '', placeId: '' }

let nextKey = 0
function draft(choice: string, name = '', address: AddressValue = emptyAddress): StopDraft {
  return { key: nextKey++, choice, name, address }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function TripForm({ locations, home, mapsEnabled, tripId, defaultReturnTrip, initial }: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const defaultLocationId = locations.find((l) => l.isDefault)?.id ?? locations[0]?.id ?? OTHER

  function freshStops(): StopDraft[] {
    return [draft(HOME), draft(defaultLocationId)]
  }

  function initialStops(): StopDraft[] {
    if (!initial) return freshStops()
    return [...initial.stops]
      .sort((a, b) => a.position - b.position)
      .map((s) => {
        if (s.isHome) return draft(HOME)
        if (s.locationId) return draft(s.locationId)
        return draft(OTHER, s.name ?? '', {
          address: s.address ?? '',
          postcode: s.postcode ?? '',
          placeId: s.placeId ?? '',
        })
      })
  }

  const [date, setDate] = useState(initial?.date ?? today())
  const [stops, setStops] = useState<StopDraft[]>(initialStops)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [km, setKm] = useState<string>(initial ? String(initial.km) : '')
  const [returnKm, setReturnKm] = useState<string>(initial?.returnKm != null ? String(initial.returnKm) : '')
  const [isReturnTrip, setIsReturnTrip] = useState(initial?.isReturnTrip ?? defaultReturnTrip ?? true)
  const [distanceStatus, setDistanceStatus] = useState<'idle' | 'loading' | 'done' | 'failed' | 'needsAddresses'>(
    'idle'
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedAddAnother, setSavedAddAnother] = useState(false)
  const requestId = useRef(0)

  const destinationCount = stops.length - 1
  const showReturnKm = isReturnTrip && destinationCount > 1

  function resolve(stop: StopDraft) {
    if (stop.choice === HOME) {
      return {
        isHome: true,
        locationId: null,
        name: null,
        address: home?.address ?? '',
        postcode: home?.postcode ?? '',
        placeId: home?.placeId ?? '',
      }
    }
    const location = locations.find((l) => l.id === stop.choice)
    if (location) {
      return {
        isHome: false,
        locationId: location.id,
        name: null,
        address: location.address ?? '',
        postcode: location.postcode ?? '',
        placeId: location.placeId ?? '',
      }
    }
    return { isHome: false, locationId: null, name: stop.name.trim() || null, ...stop.address }
  }

  // Hand-typed "other" addresses only count once a suggestion is picked, so typing
  // doesn't fire a route request per keystroke.
  function routePoint(stop: StopDraft) {
    const r = resolve(stop)
    if (r.placeId) return { placeId: r.placeId }
    if (stop.choice !== OTHER && r.address) return { address: r.address }
    return null
  }

  const routeKey = JSON.stringify(stops.map((s) => [s.choice, routePoint(s)]))

  async function calculateDistance(preferFixedKm: boolean) {
    const id = ++requestId.current

    // Home -> one saved location uses that location's own km, unless it's set to the route.
    const onlyDestination =
      stops.length === 2 && stops[0].choice === HOME ? locations.find((l) => l.id === stops[1].choice) : undefined
    if (preferFixedKm && onlyDestination && !(onlyDestination.kmFromRoute && mapsEnabled)) {
      setKm(String(onlyDestination.fixedKm))
      setReturnKm('')
      setDistanceStatus('idle')
      return
    }
    if (!mapsEnabled) return

    const points = stops.map(routePoint)
    if (points.some((p) => p === null)) {
      setDistanceStatus('needsAddresses')
      return
    }
    setDistanceStatus('loading')
    // Route back to the start as well, so the return leg comes from the same request.
    const legs = await fetchRouteLegsKm([...points, points[0]] as { placeId?: string; address?: string }[])
    if (id !== requestId.current) return
    if (!legs) {
      setDistanceStatus('failed')
      return
    }
    const outbound = legs.slice(0, -1).reduce((sum, leg) => sum + leg, 0)
    setKm(String(roundKm(outbound)))
    setReturnKm(String(roundKm(legs[legs.length - 1])))
    setDistanceStatus('done')
  }

  // Recalculate whenever the route changes, but keep a saved trip's km as-is on load.
  const skipNextCalculation = useRef(Boolean(initial))
  useEffect(() => {
    if (skipNextCalculation.current) {
      skipNextCalculation.current = false
      return
    }
    const timer = setTimeout(() => calculateDistance(true), 400)
    return () => clearTimeout(timer)
    // calculateDistance reads the current stops; routeKey captures every relevant change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])

  function updateStop(key: number, changes: Partial<StopDraft>) {
    setStops((current) => current.map((s) => (s.key === key ? { ...s, ...changes } : s)))
  }

  function addStop() {
    setStops((current) => (current.length >= MAX_STOPS ? current : [...current, draft(OTHER)]))
  }

  function removeStop(key: number) {
    setStops((current) => (current.length <= 2 ? current : current.filter((s) => s.key !== key)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSavedAddAnother(false)
    setLoading(true)

    const res = await fetch(tripId ? `/api/trips/${tripId}` : '/api/trips', {
      method: tripId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        stops: stops.map(resolve),
        description: description.trim(),
        km: Number(km),
        returnKm: showReturnKm && returnKm !== '' ? Number(returnKm) : null,
        isReturnTrip,
      }),
    })

    if (res.ok) {
      if (tripId) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Stay on the page after creating a new trip, ready for the next one.
        setStops(freshStops())
        setDescription('')
        setSavedAddAnother(true)
        setLoading(false)
        router.refresh()
      }
    } else {
      setError(await readErrorMessage(res, t.trip.saveFailed))
      setLoading(false)
    }
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
        <p className="mb-2 text-sm font-medium">{t.trip.route}</p>
        <div className="space-y-3">
          {stops.map((stop, index) => {
            const resolved = resolve(stop)
            return (
              <div key={stop.key} className="space-y-2 rounded border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {index === 0 ? t.trip.startPoint : t.trip.destination(index)}
                  </span>
                  {index > 0 && destinationCount > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStop(stop.key)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      {t.trip.removeStop}
                    </button>
                  )}
                </div>
                <select
                  value={stop.choice}
                  onChange={(e) => updateStop(stop.key, { choice: e.target.value })}
                  className="w-full rounded border border-slate-300 px-3 py-2.5"
                >
                  <option value={HOME}>{t.trip.homeOption}</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                  <option value={OTHER}>{t.trip.otherLocation}</option>
                </select>
                {stop.choice === OTHER ? (
                  <>
                    <AddressInput
                      value={stop.address}
                      onChange={(address) => updateStop(stop.key, { address })}
                      onPickEstablishment={(name) => updateStop(stop.key, { name })}
                      mapsEnabled={mapsEnabled}
                      addressRequired={!stop.name.trim()}
                      postcodeRequired
                    />
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">{t.trip.customName}</label>
                      <input
                        type="text"
                        value={stop.name}
                        onChange={(e) => updateStop(stop.key, { name: e.target.value })}
                        maxLength={191}
                        className="w-full rounded border border-slate-300 px-3 py-2.5"
                      />
                    </div>
                  </>
                ) : (
                  (resolved.address || resolved.postcode) && (
                    <p className="text-xs text-slate-500">{formatAddress(resolved.address, resolved.postcode)}</p>
                  )
                )}
              </div>
            )
          })}
        </div>
        {stops.length < MAX_STOPS && (
          <button type="button" onClick={addStop} className="mt-2 text-sm text-slate-600 hover:underline">
            {t.trip.addStop}
          </button>
        )}
        {!home && stops.some((s) => s.choice === HOME) && (
          <p className="mt-2 text-xs text-slate-500">
            {t.trip.noHomeAddressHint}{' '}
            <Link href="/dashboard/settings" className="underline">
              {t.nav.settings}
            </Link>
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {destinationCount > 1 ? t.trip.kmOutbound : t.trip.km}
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
        {mapsEnabled && (
          <div className="mt-1 flex items-start justify-between gap-2 text-xs">
            <span className={distanceStatus === 'failed' ? 'text-amber-600' : 'text-slate-500'}>
              {distanceStatus === 'loading' && t.trip.distanceCalculating}
              {distanceStatus === 'done' && t.trip.distanceCalculated(km)}
              {distanceStatus === 'failed' && t.trip.distanceFailed}
              {distanceStatus === 'needsAddresses' && t.trip.distanceNeedsAddresses}
            </span>
            <button
              type="button"
              onClick={() => calculateDistance(false)}
              className="shrink-0 text-slate-600 hover:underline"
            >
              {t.trip.recalculate}
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          id="isReturnTrip"
          type="checkbox"
          checked={isReturnTrip}
          onChange={(e) => setIsReturnTrip(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="isReturnTrip" className="text-sm font-medium">
          {t.trip.isReturnTrip}
        </label>
      </div>
      {showReturnKm && (
        <div>
          <label className="mb-1 block text-sm font-medium">{t.trip.returnKm}</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={returnKm}
            onChange={(e) => setReturnKm(e.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2.5"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">{t.trip.description}</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={191}
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {savedAddAnother && (
        <p className="text-sm text-green-600">
          {t.trip.savedAddAnother}{' '}
          <Link href="/dashboard" className="underline">
            {t.trip.backToOverview}
          </Link>
        </p>
      )}
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
