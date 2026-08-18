import { prisma } from '@/lib/prisma'
import { effectiveKm } from '@/lib/tripKm'
import { litersFor, averageConsumption, averagePricePerLiter } from '@/lib/fuel'

export interface WeeklyStats {
  since: Date
  until: Date
  tripCount: number
  totalKm: number
  totalFee: number
  fuel: {
    entryCount: number
    totalLiters: number
    totalCost: number
    avgConsumption: number | null
    avgPricePerLiter: number | null
  } | null
}

// Trailing 7 days, unlike lib/trips.ts's calendar-month buckets.
export async function getWeeklyStats(
  userId: string,
  kmRate: number,
  fuelTrackingEnabled: boolean
): Promise<WeeklyStats> {
  const until = new Date()
  const since = new Date(until.getTime() - 7 * 24 * 60 * 60 * 1000)

  const trips = await prisma.trip.findMany({
    where: { userId, date: { gte: since, lt: until } },
    select: { km: true, isReturnTrip: true },
  })

  const totalKm = trips.reduce((sum, trip) => sum + effectiveKm(trip), 0)

  let fuel: WeeklyStats['fuel'] = null
  if (fuelTrackingEnabled) {
    const entries = await prisma.fuelEntry.findMany({
      where: { userId, date: { gte: since, lt: until } },
      select: { date: true, odometer: true, pricePerLiter: true, totalPrice: true },
    })

    // Averages need surrounding entries for valid odometer deltas, so use all-time data.
    const allEntries = await prisma.fuelEntry.findMany({
      where: { userId },
      select: { date: true, odometer: true, pricePerLiter: true, totalPrice: true },
      orderBy: { date: 'asc' },
    })

    fuel = {
      entryCount: entries.length,
      totalLiters: entries.reduce((sum, entry) => sum + litersFor(entry), 0),
      totalCost: entries.reduce((sum, entry) => sum + entry.totalPrice, 0),
      avgConsumption: averageConsumption(allEntries),
      avgPricePerLiter: averagePricePerLiter(allEntries),
    }
  }

  return {
    since,
    until,
    tripCount: trips.length,
    totalKm,
    totalFee: totalKm * kmRate,
    fuel,
  }
}
