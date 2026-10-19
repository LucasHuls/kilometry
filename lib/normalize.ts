// Input normalizers return null for empty input, or 'invalid' when too long.

// Postcodes are free-form (not only Dutch), so only spacing and case are normalized.
const MAX_POSTCODE_LENGTH = 16

export function normalizePostcode(value: unknown): string | null | 'invalid' {
  if (typeof value !== 'string') return null
  const normalized = value.trim().replace(/\s+/g, ' ').toUpperCase()
  if (!normalized) return null
  if (normalized.length > MAX_POSTCODE_LENGTH) return 'invalid'
  return normalized
}

// 191 matches the VARCHAR(191) columns.
export function normalizeText(value: unknown, max = 191): string | null | 'invalid' {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > max) return 'invalid'
  return trimmed
}

// Google's formatted addresses already contain the postcode, so don't repeat it.
export function formatAddress(address: string | null | undefined, postcode: string | null | undefined): string {
  const compact = (s: string) => s.replace(/\s+/g, '').toUpperCase()
  if (address && postcode && compact(address).includes(compact(postcode))) return address
  return [address, postcode].filter(Boolean).join(', ')
}
