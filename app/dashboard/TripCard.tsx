'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { toIntlLocale } from '@/lib/i18n/cookie'
import { effectiveKm } from '@/lib/tripKm'
import { destinationsLabel, StopView } from '@/lib/tripStops'

interface Trip {
  id: string
  date: Date
  stops: StopView[]
  description: string | null
  km: number
  returnKm: number | null
  isReturnTrip: boolean
}

export default function TripCard({ trip, kmRate }: { trip: Trip; kmRate: number }) {
  const router = useRouter()
  const { t, locale } = useLocale()
  const km = effectiveKm(trip)

  async function handleDelete() {
    if (!confirm(t.dashboard.confirmDeleteTrip)) return
    await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium">{destinationsLabel(trip.stops)}</p>
        <p className="text-sm text-slate-500">
          {new Date(trip.date).toLocaleDateString(toIntlLocale(locale))} &middot; {km.toFixed(1)} km
          {trip.isReturnTrip && <> ({t.trip.returnTripShort})</>} &middot; &euro; {(km * kmRate).toFixed(2)}
        </p>
        {trip.description && <p className="text-xs text-slate-400">{trip.description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <a href={`/dashboard/edit/${trip.id}`} className="text-slate-500 hover:underline">
          {t.common.edit}
        </a>
        <button onClick={handleDelete} className="text-red-500 hover:underline">
          {t.common.delete}
        </button>
      </div>
    </div>
  )
}
