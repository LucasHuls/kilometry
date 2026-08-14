// Pure module (no lib/prisma.ts import), importable from both server and client
// components, same reasoning as lib/tripKm.ts. Liters are never stored, only derived.

interface FuelEntryLike {
  date: Date
  odometer: number
  pricePerLiter: number
  totalPrice: number
}

export function litersFor(entry: { totalPrice: number; pricePerLiter: number }) {
  return entry.pricePerLiter > 0 ? entry.totalPrice / entry.pricePerLiter : 0
}

export interface ConsumptionPoint {
  date: Date
  kmPerLiter: number
  pricePerLiter: number
}

// entries must be sorted by date ascending. Skips intervals where the odometer didn't
// increase or no liters were recorded, instead of producing a negative or infinite
// km/liter figure (handles data-entry corrections gracefully).
export function consumptionSeries(entries: FuelEntryLike[]): ConsumptionPoint[] {
  const points: ConsumptionPoint[] = []
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1]
    const curr = entries[i]
    const distance = curr.odometer - prev.odometer
    const liters = litersFor(curr)
    if (distance > 0 && liters > 0) {
      points.push({ date: curr.date, kmPerLiter: distance / liters, pricePerLiter: curr.pricePerLiter })
    }
  }
  return points
}

// Liters-weighted: total distance covered by valid intervals / total liters burned
// over those same intervals, so one small top-up doesn't skew the result.
export function averageConsumption(entries: FuelEntryLike[]): number | null {
  const series = consumptionSeries(entries)
  if (series.length === 0) return null

  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime())
  let totalDistance = 0
  let totalLiters = 0
  for (let i = 1; i < sorted.length; i++) {
    const distance = sorted[i].odometer - sorted[i - 1].odometer
    const liters = litersFor(sorted[i])
    if (distance > 0 && liters > 0) {
      totalDistance += distance
      totalLiters += liters
    }
  }
  return totalLiters > 0 ? totalDistance / totalLiters : null
}

// Liters-weighted average price: sum(totalPrice) / sum(liters), not a plain mean of
// the per-entry unit prices, so a 5-liter and a 50-liter fill-up aren't weighted equally.
export function averagePricePerLiter(entries: FuelEntryLike[]): number | null {
  if (entries.length === 0) return null
  let totalPrice = 0
  let totalLiters = 0
  for (const entry of entries) {
    totalPrice += entry.totalPrice
    totalLiters += litersFor(entry)
  }
  return totalLiters > 0 ? totalPrice / totalLiters : null
}
