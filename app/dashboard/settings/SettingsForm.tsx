'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'

interface Props {
  kmRate: number
  defaultReturnTrip: boolean
  exportIncludeLocation: boolean
  exportIncludeRetour: boolean
  exportIncludeKm: boolean
  exportIncludeFee: boolean
}

export default function SettingsForm({
  kmRate,
  defaultReturnTrip,
  exportIncludeLocation,
  exportIncludeRetour,
  exportIncludeKm,
  exportIncludeFee,
}: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [rate, setRate] = useState(String(kmRate))
  const [returnTripDefault, setReturnTripDefault] = useState(defaultReturnTrip)
  const [includeLocation, setIncludeLocation] = useState(exportIncludeLocation)
  const [includeRetour, setIncludeRetour] = useState(exportIncludeRetour)
  const [includeKm, setIncludeKm] = useState(exportIncludeKm)
  const [includeFee, setIncludeFee] = useState(exportIncludeFee)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kmRate: Number(rate),
        defaultReturnTrip: returnTripDefault,
        exportIncludeLocation: includeLocation,
        exportIncludeRetour: includeRetour,
        exportIncludeKm: includeKm,
        exportIncludeFee: includeFee,
      }),
    })

    if (res.ok) {
      setSaved(true)
      router.refresh()
    } else {
      setError(await readErrorMessage(res, t.trip.saveFailed))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium">{t.settings.kmRate}</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          required
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="defaultReturnTrip"
          type="checkbox"
          checked={returnTripDefault}
          onChange={(e) => setReturnTripDefault(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="defaultReturnTrip" className="text-sm font-medium">
          {t.settings.defaultReturnTrip}
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t.settings.exportColumnsTitle}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="exportIncludeLocation"
              type="checkbox"
              checked={includeLocation}
              onChange={(e) => setIncludeLocation(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="exportIncludeLocation" className="text-sm">
              {t.settings.exportIncludeLocation}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="exportIncludeRetour"
              type="checkbox"
              checked={includeRetour}
              onChange={(e) => setIncludeRetour(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="exportIncludeRetour" className="text-sm">
              {t.settings.exportIncludeRetour}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="exportIncludeKm"
              type="checkbox"
              checked={includeKm}
              onChange={(e) => setIncludeKm(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="exportIncludeKm" className="text-sm">
              {t.settings.exportIncludeKm}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="exportIncludeFee"
              type="checkbox"
              checked={includeFee}
              onChange={(e) => setIncludeFee(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="exportIncludeFee" className="text-sm">
              {t.settings.exportIncludeFee}
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">{t.settings.saved}</p>}
      <button type="submit" className="w-full rounded bg-brand-navy py-2.5 text-white hover:bg-slate-700">
        {t.common.save}
      </button>
    </form>
  )
}
