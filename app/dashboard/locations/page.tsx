import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import LocationRow from './LocationRow'
import LocationCard from './LocationCard'

export default async function LocationsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const { t } = await getT()
  const locations = await prisma.location.findMany({
    where: { userId: user.id },
    include: { _count: { select: { trips: true } } },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t.location.title}</h1>
        <Link
          href="/dashboard/locations/new"
          className="rounded bg-brand-navy px-3 py-2.5 text-sm text-white hover:bg-slate-700"
        >
          {t.location.newLocation}
        </Link>
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">{t.location.colName}</th>
              <th className="px-4 py-2">{t.location.colFixedKm}</th>
              <th className="px-4 py-2">{t.location.colUsed}</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <LocationRow key={location.id} location={location} />
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  {t.location.noLocations}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white md:hidden">
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
        {locations.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-400">{t.location.noLocations}</p>
        )}
      </div>
    </div>
  )
}
