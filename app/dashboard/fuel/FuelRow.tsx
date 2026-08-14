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

export default function FuelRow({ entry }: { entry: FuelEntry }) {
  const router = useRouter()
  const { t, locale } = useLocale()
  const liters = litersFor(entry)

  async function handleDelete() {
    if (!confirm(t.fuel.confirmDelete)) return
    await fetch(`/api/fuel/${entry.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString(toIntlLocale(locale))}</td>
      <td className="px-4 py-2">{entry.odometer.toFixed(1)}</td>
      <td className="px-4 py-2">{liters.toFixed(2)}</td>
      <td className="px-4 py-2">&euro; {entry.pricePerLiter.toFixed(3)}</td>
      <td className="px-4 py-2">&euro; {entry.totalPrice.toFixed(2)}</td>
      <td className="px-4 py-2 text-right">
        <a href={`/dashboard/fuel/edit/${entry.id}`} className="mr-3 text-slate-500 hover:underline">
          {t.common.edit}
        </a>
        <button onClick={handleDelete} className="text-red-500 hover:underline">
          {t.common.delete}
        </button>
      </td>
    </tr>
  )
}
