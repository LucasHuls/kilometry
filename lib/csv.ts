import { Dictionary } from './i18n/dictionaries'

interface CsvTrip {
  date: Date
  location: { name: string }
  km: number
}

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function tripsToCsv(trips: CsvTrip[], kmRate: number, t: Dictionary) {
  const header = [t.dashboard.colDate, t.dashboard.colLocation, t.dashboard.colKm, t.dashboard.colFee].join(',')
  const rows = trips.map((t) =>
    [
      t.date.toISOString().slice(0, 10),
      escapeCsv(t.location.name),
      t.km.toFixed(1),
      (t.km * kmRate).toFixed(2),
    ].join(',')
  )
  return [header, ...rows].join('\n')
}
