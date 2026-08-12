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

export default function TripRow({ trip, kmRate }: { trip: Trip; kmRate: number }) {
  const router = useRouter()
  const { t, locale } = useLocale()

  async function handleDelete() {
    if (!confirm(t.dashboard.confirmDeleteTrip)) return
    await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-2">{new Date(trip.date).toLocaleDateString(toIntlLocale(locale))}</td>
      <td className="px-4 py-2">{trip.location.name}</td>
      <td className="px-4 py-2">{trip.km.toFixed(1)}</td>
      <td className="px-4 py-2">&euro; {(trip.km * kmRate).toFixed(2)}</td>
      <td className="px-4 py-2 text-right">
        <a href={`/dashboard/edit/${trip.id}`} className="mr-3 text-slate-500 hover:underline">
          {t.common.edit}
        </a>
        <button onClick={handleDelete} className="text-red-500 hover:underline">
          {t.common.delete}
        </button>
      </td>
    </tr>
  )
}
