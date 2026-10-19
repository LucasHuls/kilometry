// Client-side helper for app/api/maps/route. Returns the km of each leg, or null if
// the distance could not be calculated (no key configured, unknown address, offline).
export async function fetchRouteLegsKm(
  points: { placeId?: string | null; address?: string | null }[]
): Promise<number[] | null> {
  try {
    const res = await fetch('/api/maps/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data.legsKm) ? data.legsKm : null
  } catch {
    return null
  }
}

export function roundKm(km: number) {
  return Math.round(km * 10) / 10
}
