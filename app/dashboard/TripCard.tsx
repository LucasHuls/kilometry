'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { toIntlLocale } from '@/lib/i18n/cookie'

interface Trip {
  id: string
  date: Date
  location: { name: string }
  km: number
}

export default function TripCard({ trip, kmRate }: { trip: Trip; kmRate: number }) {
  const router = useRouter()
  const { t, locale } = useLocale()

  async function handleDelete() {
    if (!confirm(t.dashboard.confirmDeleteTrip)) return
    await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium">{trip.location.name}</p>
        <p className="text-sm text-slate-500">
          {new Date(trip.date).toLocaleDateString(toIntlLocale(locale))} &middot; {trip.km.toFixed(1)} km &middot; &euro;{' '}
          {(trip.km * kmRate).toFixed(2)}
        </p>
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
