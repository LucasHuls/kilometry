import { prisma } from './prisma'
import { Dictionary } from './i18n/dictionaries'
import { normalizePostcode, normalizeText } from './normalize'

export const MAX_TRIP_STOPS = 10

export interface ParsedStop {
  position: number
  isHome: boolean
  locationId: string | null
  name: string | null
  address: string | null
  postcode: string | null
  placeId: string | null
}

export interface ParsedTrip {
  date: Date
  description: string | null
  km: number
  returnKm: number | null
  isReturnTrip: boolean
  stops: ParsedStop[]
}

// Validates the JSON body of POST /api/trips and PUT /api/trips/[id]. Returns either
// the data to store or a translated error message (always a 400).
export async function parseTripBody(
  body: Record<string, unknown>,
  userId: string,
  t: Dictionary
): Promise<{ data: ParsedTrip } | { error: string }> {
  const { date, description, km, returnKm, isReturnTrip, stops } = body
  if (!date || km === undefined || km === null || km === '') return { error: t.errors.allFieldsRequired }
  const parsedDate = new Date(String(date))
  if (Number.isNaN(parsedDate.getTime())) return { error: t.errors.allFieldsRequired }

  const kmNumber = Number(km)
  if (!Number.isFinite(kmNumber) || kmNumber < 0) return { error: t.errors.kmMustBePositive }

  let returnKmNumber: number | null = null
  if (returnKm !== undefined && returnKm !== null && returnKm !== '') {
    returnKmNumber = Number(returnKm)
    if (!Number.isFinite(returnKmNumber) || returnKmNumber < 0) return { error: t.errors.kmMustBePositive }
  }

  if (!Array.isArray(stops) || stops.length < 2) return { error: t.errors.routeNeedsTwoStops }
  if (stops.length > MAX_TRIP_STOPS) return { error: t.errors.tooManyStops }

  const locationIds = stops
    .map((s) => (typeof s?.locationId === 'string' ? s.locationId : ''))
    .filter(Boolean)
  if (locationIds.length > 0) {
    const owned = await prisma.location.count({ where: { userId, id: { in: Array.from(new Set(locationIds)) } } })
    if (owned !== new Set(locationIds).size) return { error: t.errors.invalidLocation }
  }

  const parsedStops: ParsedStop[] = []
  for (const [position, stop] of stops.entries()) {
    const empty = { isHome: false, locationId: null, name: null, address: null, postcode: null, placeId: null }
    if (stop?.isHome === true) {
      parsedStops.push({ ...empty, position, isHome: true })
      continue
    }
    if (typeof stop?.locationId === 'string' && stop.locationId) {
      parsedStops.push({ ...empty, position, locationId: stop.locationId })
      continue
    }
    // The export needs a postcode for every stop.
    const name = normalizeText(stop?.name)
    const address = normalizeText(stop?.address)
    const placeId = normalizeText(stop?.placeId)
    if (name === 'invalid' || address === 'invalid' || placeId === 'invalid') return { error: t.errors.textTooLong }
    if (!name && !address) return { error: t.errors.stopNeedsAddress }
    const postcode = normalizePostcode(stop?.postcode)
    if (postcode === 'invalid') return { error: t.errors.invalidPostcode }
    if (!postcode) return { error: t.errors.postcodeRequired }
    parsedStops.push({ ...empty, position, name, address, postcode, placeId: address ? placeId : null })
  }

  const trimmedDescription = normalizeText(description)
  if (trimmedDescription === 'invalid') return { error: t.errors.textTooLong }

  const returning = isReturnTrip !== false
  return {
    data: {
      date: parsedDate,
      description: trimmedDescription,
      km: kmNumber,
      // Only kept for return trips with 2+ destinations, see lib/tripKm.ts.
      returnKm: returning && parsedStops.length > 2 ? returnKmNumber : null,
      isReturnTrip: returning,
      stops: parsedStops,
    },
  }
}
