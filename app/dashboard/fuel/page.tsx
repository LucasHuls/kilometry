import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { currentMonthKey, monthRange } from '@/lib/trips'
import { litersFor, consumptionSeries, averageConsumption, averagePricePerLiter } from '@/lib/fuel'
import FuelRow from './FuelRow'
import FuelCard from './FuelCard'
import FuelChart from './FuelChart'

export default async function FuelPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const { t } = await getT()
  const entries = await prisma.fuelEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: 'asc' },
  })

  const { gte, lt } = monthRange(currentMonthKey())
  const monthEntries = entries.filter((entry) => entry.date >= gte && entry.date < lt)

  const monthLiters = monthEntries.reduce((sum, entry) => sum + litersFor(entry), 0)
  const monthCost = monthEntries.reduce((sum, entry) => sum + entry.totalPrice, 0)
  const allTimeLiters = entries.reduce((sum, entry) => sum + litersFor(entry), 0)
  const allTimeCost = entries.reduce((sum, entry) => sum + entry.totalPrice, 0)

  const avgConsumption = averageConsumption(entries)
  const avgPrice = averagePricePerLiter(entries)
  const chartData = consumptionSeries(entries)
  const displayEntries = [...entries].reverse()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t.fuel.title}</h1>
        <Link
          href="/dashboard/fuel/new"
          className="rounded bg-brand-navy px-3 py-2.5 text-sm text-white hover:bg-slate-700"
        >
          {t.fuel.addEntry}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">{t.fuel.thisMonth}</p>
          <p className="text-xl font-semibold">{monthLiters.toFixed(2)} L</p>
          <p className="text-slate-600">&euro; {monthCost.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">{t.fuel.allTime}</p>
          <p className="text-xl font-semibold">{allTimeLiters.toFixed(2)} L</p>
          <p className="text-slate-600">&euro; {allTimeCost.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">{t.fuel.avgConsumption}</p>
          <p className="text-xl font-semibold">
            {avgConsumption !== null ? t.fuel.consumptionLabel(avgConsumption) : t.fuel.notEnoughData}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">{t.fuel.avgPricePerLiter}</p>
          <p className="text-xl font-semibold">
            {avgPrice !== null ? `€ ${avgPrice.toFixed(3)}` : t.fuel.notEnoughData}
          </p>
        </div>
      </div>

      <FuelChart data={chartData} />

      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">{t.fuel.colDate}</th>
              <th className="px-4 py-2">{t.fuel.colOdometer}</th>
              <th className="px-4 py-2">{t.fuel.colLiters}</th>
              <th className="px-4 py-2">{t.fuel.colPricePerLiter}</th>
              <th className="px-4 py-2">{t.fuel.colTotalPrice}</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.map((entry) => (
              <FuelRow key={entry.id} entry={entry} />
            ))}
            {displayEntries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  {t.fuel.noEntries}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white md:hidden">
        {displayEntries.map((entry) => (
          <FuelCard key={entry.id} entry={entry} />
        ))}
        {displayEntries.length === 0 && <p className="px-4 py-6 text-center text-slate-400">{t.fuel.noEntries}</p>}
      </div>
    </div>
  )
}
