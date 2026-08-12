'use client'

import { useRouter } from 'next/navigation'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'

interface Location {
  id: string
  name: string
  fixedKm: number
  isDefault: boolean
  _count: { trips: number }
}

export default function LocationCard({ location }: { location: Location }) {
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
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium">
          {location.name}
          {location.isDefault && (
            <span className="ml-2 rounded bg-brand-cyan/20 px-1.5 py-0.5 text-xs text-brand-navy">
              {t.location.defaultBadge}
            </span>
          )}
        </p>
        <p className="text-sm text-slate-500">
          {location.fixedKm.toFixed(1)} km &middot; {t.location.usedCount(location._count.trips)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <a href={`/dashboard/locations/edit/${location.id}`} className="text-slate-500 hover:underline">
          {t.common.edit}
        </a>
        <button onClick={handleDelete} className="text-red-500 hover:underline">
          {t.common.delete}
        </button>
      </div>
    </div>
  )
}
