import { Dictionary } from './i18n/dictionaries'
import { isMapsEnabled } from './maps'
import { normalizePostcode, normalizeText } from './normalize'

export interface ParsedLocation {
  name: string
  address: string
  postcode: string
  placeId: string | null
  kmFromRoute: boolean
  fixedKm: number
}

// Validates the JSON body of POST /api/locations and PUT /api/locations/[id].
export function parseLocationBody(
  body: Record<string, unknown>,
  t: Dictionary
): { data: ParsedLocation } | { error: string } {
  const name = normalizeText(body.name)
  const address = normalizeText(body.address)
  const placeId = normalizeText(body.placeId)
  if (name === 'invalid' || address === 'invalid' || placeId === 'invalid') return { error: t.errors.textTooLong }
  if (!name) return { error: t.errors.allFieldsRequired }
  if (!address) return { error: t.errors.addressRequired }

  const postcode = normalizePostcode(body.postcode)
  if (postcode === 'invalid') return { error: t.errors.invalidPostcode }
  if (!postcode) return { error: t.errors.postcodeRequired }

  // Route-based km needs Google Maps; without it a location always has fixed km.
  const kmFromRoute = body.kmFromRoute === true && isMapsEnabled()
  const fixedKm = Number(body.fixedKm ?? 0)
  if (!kmFromRoute && (body.fixedKm === undefined || body.fixedKm === null || body.fixedKm === '')) {
    return { error: t.errors.allFieldsRequired }
  }
  if (!Number.isFinite(fixedKm) || fixedKm < 0) return { error: t.errors.kmMustBePositive }

  return { data: { name, address, postcode, placeId, kmFromRoute, fixedKm } }
}
