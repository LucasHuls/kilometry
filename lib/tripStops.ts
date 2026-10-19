// Client-safe helpers for a trip's ordered stops, see TripStop in schema.prisma.

export interface StopView {
  position: number
  name: string | null
  address: string | null
  postcode: string | null
  location: { name: string; postcode: string | null } | null
}

function sortStops<T extends { position: number }>(stops: T[]): T[] {
  return [...stops].sort((a, b) => a.position - b.position)
}

export function stopLabel(stop: StopView): string {
  return stop.location?.name ?? stop.name ?? stop.address ?? ''
}

export function stopPostcode(stop: StopView): string | null {
  return stop.location ? stop.location.postcode : stop.postcode
}

function destinations<T extends { position: number }>(stops: T[]): T[] {
  const sorted = sortStops(stops)
  return sorted.length > 1 ? sorted.slice(1) : sorted
}

export function destinationsLabel(stops: StopView[]): string {
  return destinations(stops).map(stopLabel).join(' → ')
}

export function routePostcodes(stops: StopView[], homePostcode: string | null) {
  const sorted = sortStops(stops)
  if (sorted.length <= 1) {
    return { from: homePostcode, via: [] as string[], to: sorted[0] ? stopPostcode(sorted[0]) : null }
  }
  return {
    from: stopPostcode(sorted[0]),
    via: sorted
      .slice(1, -1)
      .map(stopPostcode)
      .filter((p): p is string => Boolean(p)),
    to: stopPostcode(sorted[sorted.length - 1]),
  }
}
