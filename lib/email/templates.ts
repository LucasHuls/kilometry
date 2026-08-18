import { Dictionary, Locale } from '@/lib/i18n/dictionaries'
import { toIntlLocale } from '@/lib/i18n/cookie'
import { WeeklyStats } from './stats'

function formatDate(date: Date, locale: Locale) {
  return date.toLocaleDateString(toIntlLocale(locale), { day: 'numeric', month: 'long' })
}

function formatEuro(value: number, locale: Locale) {
  return value.toLocaleString(toIntlLocale(locale), { style: 'currency', currency: 'EUR' })
}

function shell(heading: string, bodyHtml: string, footer: string) {
  return `
<div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
  <div style="background-color: #111827; padding: 24px; border-radius: 8px 8px 0 0;">
    <span style="color: #22D3EE; font-size: 18px; font-weight: 600;">Kilometry</span>
  </div>
  <div style="border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
    <h1 style="font-size: 18px; margin: 0 0 16px;">${heading}</h1>
    ${bodyHtml}
  </div>
  <p style="color: #6B7280; font-size: 12px; margin-top: 16px;">${footer}</p>
</div>`.trim()
}

function statRow(label: string, value: string) {
  return `
  <tr>
    <td style="padding: 6px 0; color: #6B7280; font-size: 14px;">${label}</td>
    <td style="padding: 6px 0; text-align: right; font-weight: 600; font-size: 14px;">${value}</td>
  </tr>`
}

export function weeklyStatsEmail(dict: Dictionary, locale: Locale, stats: WeeklyStats) {
  const e = dict.email.weeklyStats
  const since = formatDate(stats.since, locale)
  const until = formatDate(stats.until, locale)

  let rows = `
    ${statRow(e.tripCount, String(stats.tripCount))}
    ${statRow(e.totalKm, `${stats.totalKm.toFixed(1)} km`)}
    ${statRow(e.totalFee, formatEuro(stats.totalFee, locale))}`

  let fuelSection = ''
  if (stats.fuel) {
    const fuelRows = `
    ${statRow(e.fuelLiters, `${stats.fuel.totalLiters.toFixed(1)} L`)}
    ${statRow(e.fuelCost, formatEuro(stats.fuel.totalCost, locale))}
    ${
      stats.fuel.avgConsumption !== null
        ? statRow(e.fuelAvgConsumption, dict.fuel.consumptionLabel(stats.fuel.avgConsumption))
        : ''
    }
    ${
      stats.fuel.avgPricePerLiter !== null
        ? statRow(e.fuelAvgPrice, formatEuro(stats.fuel.avgPricePerLiter, locale))
        : ''
    }`
    fuelSection = `
    <h2 style="font-size: 14px; margin: 20px 0 8px; color: #111827;">${e.fuelHeading}</h2>
    <table style="width: 100%; border-collapse: collapse;">${fuelRows}</table>`
  }

  const html = shell(
    e.heading,
    `<p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">${e.intro(since, until)}</p>
     <table style="width: 100%; border-collapse: collapse;">${rows}</table>
     ${fuelSection}`,
    e.footer
  )

  return { subject: e.subject, html }
}

export function reminderEmail(dict: Dictionary) {
  const e = dict.email.reminder
  const html = shell(e.heading, `<p style="font-size: 14px; line-height: 1.5;">${e.body}</p>`, e.footer)
  return { subject: e.subject, html }
}
