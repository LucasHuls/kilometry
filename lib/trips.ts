import { prisma } from './prisma'

export function monthRange(month: string) {
  const [year, m] = month.split('-').map(Number)
  return { gte: new Date(year, m - 1, 1), lt: new Date(year, m, 1) }
}

export function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export async function getMonthlyTotals(userId: string, kmRate: number, months = 12) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  const trips = await prisma.trip.findMany({
    where: { userId, date: { gte: start } },
    select: { date: true, km: true },
  })

  const buckets = new Map<string, number>()
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.set(monthKey(d), 0)
  }

  for (const trip of trips) {
    const key = monthKey(new Date(trip.date))
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + trip.km)
    }
  }

  return Array.from(buckets.entries()).map(([month, km]) => ({
    month,
    km,
    fee: km * kmRate,
  }))
}
