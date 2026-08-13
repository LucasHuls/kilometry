import { Dictionary } from './i18n/dictionaries'
import { effectiveKm } from './tripKm'

interface CsvTrip {
  date: Date
  location: { name: string } | null
  customLocation: string | null
  km: number
  isReturnTrip: boolean
}

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function tripsToCsv(trips: CsvTrip[], kmRate: number, t: Dictionary) {
  const header = [
    t.dashboard.colDate,
    t.dashboard.colLocation,
    t.dashboard.colRetour,
    t.dashboard.colKm,
    t.dashboard.colFee,
  ].join(',')
  const rows = trips.map((trip) => {
    const km = effectiveKm(trip)
    return [
      trip.date.toISOString().slice(0, 10),
      escapeCsv(trip.location?.name ?? trip.customLocation ?? ''),
      trip.isReturnTrip ? t.common.yes : t.common.no,
      km.toFixed(1),
      (km * kmRate).toFixed(2),
    ].join(',')
  })
  return [header, ...rows].join('\n')
}
