'use client'

import { useRouter } from 'next/navigation'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'
import { formatAddress } from '@/lib/normalize'

interface Location {
  id: string
  name: string
  fixedKm: number
  address: string | null
  postcode: string | null
  isDefault: boolean
  _count: { stops: number }
}

export default function LocationRow({ location }: { location: Location }) {
  const router = useRouter()
  const { t } = useLocale()

  async function handleDelete() {
    if (!confirm(t.location.confirmDelete)) return
    const res = await fetch(`/api/locations/${location.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert(await readErrorMessage(res, t.location.deleteFailed))
    }
  }

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-2">
        {location.name}
        {location.isDefault && (
          <span className="ml-2 rounded bg-brand-cyan/20 px-1.5 py-0.5 text-xs text-brand-navy">
            {t.location.defaultBadge}
          </span>
        )}
      </td>
      <td className="px-4 py-2">{location.fixedKm.toFixed(1)} km</td>
      <td className="px-4 py-2 text-slate-600">
        {formatAddress(location.address, location.postcode) || '-'}
      </td>
      <td className="px-4 py-2 text-slate-500">{t.location.usedCount(location._count.stops)}</td>
      <td className="px-4 py-2 text-right">
        <a href={`/dashboard/locations/edit/${location.id}`} className="mr-3 text-slate-500 hover:underline">
          {t.common.edit}
        </a>
        <button onClick={handleDelete} className="text-red-500 hover:underline">
          {t.common.delete}
        </button>
      </td>
    </tr>
  )
}
