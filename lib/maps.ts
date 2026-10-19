// Server-only Google Maps client (Places API (New) + Routes API). The key never
// reaches the browser: client components go through app/api/maps/*. Everything here
// is optional: without GOOGLE_MAPS_API_KEY, addresses and km are simply typed by hand.

const PLACES_URL = 'https://places.googleapis.com/v1'
const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes'

export const MAX_ROUTE_POINTS = 12

function apiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || ''
}

export function isMapsEnabled() {
  return Boolean(apiKey())
}

export interface AddressSuggestion {
  placeId: string
  text: string
  mainText: string
  secondaryText: string
  isEstablishment: boolean
}

export interface PlaceDetails {
  placeId: string
  address: string
  postcode: string | null
}

export interface RoutePoint {
  placeId?: string | null
  address?: string | null
}

export async function autocompleteAddress(
  input: string,
  sessionToken: string,
  languageCode: string
): Promise<AddressSuggestion[]> {
  const res = await fetch(`${PLACES_URL}/places:autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey() },
    body: JSON.stringify({ input, sessionToken, languageCode }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Places autocomplete failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const suggestions: AddressSuggestion[] = []
  for (const s of data.suggestions ?? []) {
    const p = s.placePrediction
    if (!p?.placeId) continue
    suggestions.push({
      placeId: p.placeId,
      text: p.text?.text ?? '',
      mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
      secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
      isEstablishment: Array.isArray(p.types) && p.types.includes('establishment'),
    })
  }
  return suggestions
}

export async function getPlaceDetails(
  placeId: string,
  sessionToken: string,
  languageCode: string
): Promise<PlaceDetails> {
  const params = new URLSearchParams({ languageCode })
  if (sessionToken) params.set('sessionToken', sessionToken)
  const res = await fetch(`${PLACES_URL}/places/${encodeURIComponent(placeId)}?${params}`, {
    headers: {
      'X-Goog-Api-Key': apiKey(),
      'X-Goog-FieldMask': 'id,formattedAddress,addressComponents',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Place details failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const postcodeComponent = (data.addressComponents ?? []).find(
    (c: { types?: string[] }) => Array.isArray(c.types) && c.types.includes('postal_code')
  )
  return {
    placeId: data.id ?? placeId,
    address: data.formattedAddress ?? '',
    postcode: postcodeComponent?.longText ?? null,
  }
}

// Driving distance (km) of every leg between consecutive points, in order.
export async function routeLegsKm(points: RoutePoint[]): Promise<number[]> {
  const waypoints = points.map((p) => (p.placeId ? { placeId: p.placeId } : { address: p.address }))
  const res = await fetch(ROUTES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey(),
      'X-Goog-FieldMask': 'routes.legs.distanceMeters',
    },
    body: JSON.stringify({
      origin: waypoints[0],
      destination: waypoints[waypoints.length - 1],
      intermediates: waypoints.slice(1, -1),
      travelMode: 'DRIVE',
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Routes request failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const legs = data.routes?.[0]?.legs
  if (!Array.isArray(legs) || legs.length !== points.length - 1) {
    throw new Error('Routes response did not contain the expected legs')
  }
  // A zero-length leg (same place twice) omits distanceMeters entirely.
  return legs.map((leg: { distanceMeters?: number }) => (leg.distanceMeters ?? 0) / 1000)
}
