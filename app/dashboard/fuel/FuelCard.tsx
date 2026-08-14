'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { toIntlLocale } from '@/lib/i18n/cookie'
import { litersFor } from '@/lib/fuel'

interface FuelEntry {
  id: string
  date: Date
  odometer: number
  pricePerLiter: number
  totalPrice: number
}

export default function FuelCard({ entry }: { entry: FuelEntry }) {
  const router = useRouter()
  const { t, locale } = useLocale()
  const liters = litersFor(entry)

  async function handleDelete() {
    if (!confirm(t.fuel.confirmDelete)) return
    await fetch(`/api/fuel/${entry.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium">{entry.odometer.toFixed(1)} km</p>
        <p className="text-sm text-slate-500">
          {new Date(entry.date).toLocaleDateString(toIntlLocale(locale))} &middot; {liters.toFixed(2)} L &middot;
          &euro; {entry.totalPrice.toFixed(2)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <a href={`/dashboard/fuel/edit/${entry.id}`} className="text-slate-500 hover:underline">
          {t.common.edit}
        </a>
        <button onClick={handleDelete} className="text-red-500 hover:underline">
          {t.common.delete}
        </button>
      </div>
    </div>
  )
}
