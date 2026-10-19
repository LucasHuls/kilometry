// Client-safe helpers for a trip's ordered stops, see TripStop in schema.prisma.

export interface StopView {
  position: number
  isHome: boolean
  name: string | null
  address: string | null
  postcode: string | null
  location: { name: string; postcode: string | null } | null
}

function sortStops<T extends { position: number }>(stops: T[]): T[] {
  return [...stops].sort((a, b) => a.position - b.position)
}

function stopLabel(stop: StopView, homeLabel: string): string {
  if (stop.isHome) return homeLabel
  return stop.location?.name ?? stop.name ?? stop.address ?? ''
}

function stopPostcode(stop: StopView, homePostcode: string | null): string | null {
  if (stop.isHome) return homePostcode
  return stop.location ? stop.location.postcode : stop.postcode
}

export function destinationsLabel(stops: StopView[], homeLabel: string): string {
  return sortStops(stops)
    .slice(1)
    .map((stop) => stopLabel(stop, homeLabel))
    .join(' → ')
}

export function routePostcodes(stops: StopView[], homePostcode: string | null) {
  const postcodes = sortStops(stops).map((stop) => stopPostcode(stop, homePostcode))
  return {
    from: postcodes[0] ?? null,
    via: postcodes.slice(1, -1).filter((p): p is string => Boolean(p)),
    to: postcodes.length > 1 ? postcodes[postcodes.length - 1] : null,
  }
}
