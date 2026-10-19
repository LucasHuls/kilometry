import ExcelJS from 'exceljs'
import { Dictionary } from './i18n/dictionaries'
import { effectiveKm } from './tripKm'
import { destinationsLabel, routePostcodes, StopView } from './tripStops'

interface XlsxTrip {
  date: Date
  stops: StopView[]
  description: string | null
  km: number
  returnKm: number | null
  isReturnTrip: boolean
}

export interface ExportColumns {
  location: boolean
  retour: boolean
  km: boolean
  fee: boolean
  description: boolean
  postcodes: boolean
}

export async function tripsToXlsx(
  trips: XlsxTrip[],
  kmRate: number,
  homePostcode: string | null,
  t: Dictionary,
  columns: ExportColumns
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Kilometry')

  sheet.columns = [
    { header: t.dashboard.colDate, key: 'date', width: 12, style: { numFmt: 'yyyy-mm-dd' } },
    columns.location && { header: t.dashboard.colLocation, key: 'location', width: 28 },
    columns.postcodes && { header: t.dashboard.colPostcodeFrom, key: 'postcodeFrom', width: 14 },
    columns.postcodes && { header: t.dashboard.colPostcodeVia, key: 'postcodeVia', width: 18 },
    columns.postcodes && { header: t.dashboard.colPostcodeTo, key: 'postcodeTo', width: 14 },
    columns.retour && { header: t.dashboard.colRetour, key: 'retour', width: 10 },
    columns.km && { header: t.dashboard.colKm, key: 'km', width: 10, style: { numFmt: '0.0' } },
    columns.fee && { header: t.dashboard.colFee, key: 'fee', width: 12, style: { numFmt: '"€"0.00' } },
    columns.description && { header: t.dashboard.colDescription, key: 'description', width: 30 },
  ].filter(Boolean) as ExcelJS.Column[]

  sheet.getRow(1).font = { bold: true }

  for (const trip of trips) {
    const km = effectiveKm(trip)
    const postcodes = routePostcodes(trip.stops, homePostcode)
    sheet.addRow({
      date: trip.date,
      location: destinationsLabel(trip.stops, t.trip.homeOption),
      postcodeFrom: postcodes.from ?? '',
      postcodeVia: postcodes.via.join(', '),
      postcodeTo: postcodes.to ?? '',
      retour: trip.isReturnTrip ? t.common.yes : t.common.no,
      km,
      fee: km * kmRate,
      description: trip.description ?? '',
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
