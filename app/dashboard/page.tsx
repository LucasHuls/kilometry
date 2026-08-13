import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { monthRange, currentMonthKey, getMonthlyTotals } from '@/lib/trips'
import { effectiveKm } from '@/lib/tripKm'
import MonthFilter from './MonthFilter'
import TripRow from './TripRow'
import TripCard from './TripCard'
import MonthlyChart from './MonthlyChart'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const user = await getCurrentUser()
  if (!user) return null

  const { t } = await getT()
  const month = searchParams.month || currentMonthKey()

  const [filteredTrips, allTrips, monthlyTotals] = await Promise.all([
    prisma.trip.findMany({
      where: { userId: user.id, date: monthRange(month) },
      include: { location: true },
      orderBy: { date: 'desc' },
    }),
    prisma.trip.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    }),
    getMonthlyTotals(user.id, user.kmRate),
  ])

  const monthKm = filteredTrips.reduce((sum, trip) => sum + effectiveKm(trip), 0)
  const monthFee = monthKm * user.kmRate
  const allTimeKm = allTrips.reduce((sum, trip) => sum + effectiveKm(trip), 0)
  const allTimeFee = allTimeKm * user.kmRate

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <MonthFilter month={month} />
        <a
          href={`/api/export?month=${month}`}
          className="rounded border border-slate-300 bg-white px-3 py-2.5 text-sm hover:bg-slate-50"
        >
          {t.dashboard.exportCsv}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">{t.dashboard.thisMonth}</p>
          <p className="text-xl font-semibold">{monthKm.toFixed(1)} km</p>
          <p className="text-slate-600">&euro; {monthFee.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">{t.dashboard.allTime}</p>
          <p className="text-xl font-semibold">{allTimeKm.toFixed(1)} km</p>
          <p className="text-slate-600">&euro; {allTimeFee.toFixed(2)}</p>
        </div>
      </div>

      <MonthlyChart data={monthlyTotals} />

      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">{t.dashboard.colDate}</th>
              <th className="px-4 py-2">{t.dashboard.colLocation}</th>
              <th className="px-4 py-2">{t.dashboard.colRetour}</th>
              <th className="px-4 py-2">{t.dashboard.colKm}</th>
              <th className="px-4 py-2">{t.dashboard.colFee}</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map((trip) => (
              <TripRow key={trip.id} trip={trip} kmRate={user.kmRate} />
            ))}
            {filteredTrips.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  {t.dashboard.noTripsThisMonth}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white md:hidden">
        {filteredTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} kmRate={user.kmRate} />
        ))}
        {filteredTrips.length === 0 && (
          <p className="px-4 py-6 text-center text-slate-400">{t.dashboard.noTripsThisMonth}</p>
        )}
      </div>
    </div>
  )
}
