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
  exportIncludeDescription: boolean
  fuelTrackingEnabled: boolean
  email: string | null
  emailLocale: string
  weeklyStatsEnabled: boolean
  weeklyStatsDay: number
  reminderEnabled: boolean
  reminderDay: number
}

export default function SettingsForm({
  kmRate,
  defaultReturnTrip,
  exportIncludeLocation,
  exportIncludeRetour,
  exportIncludeKm,
  exportIncludeFee,
  exportIncludeDescription,
  fuelTrackingEnabled,
  email,
  emailLocale,
  weeklyStatsEnabled,
  weeklyStatsDay,
  reminderEnabled,
  reminderDay,
}: Props) {
  const router = useRouter()
  const { t } = useLocale()
  const [rate, setRate] = useState(String(kmRate))
  const [returnTripDefault, setReturnTripDefault] = useState(defaultReturnTrip)
  const [includeLocation, setIncludeLocation] = useState(exportIncludeLocation)
  const [includeRetour, setIncludeRetour] = useState(exportIncludeRetour)
  const [includeKm, setIncludeKm] = useState(exportIncludeKm)
  const [includeFee, setIncludeFee] = useState(exportIncludeFee)
  const [includeDescription, setIncludeDescription] = useState(exportIncludeDescription)
  const [fuelEnabled, setFuelEnabled] = useState(fuelTrackingEnabled)
  const [notifyEmail, setNotifyEmail] = useState(email ?? '')
  const [notifyLocale, setNotifyLocale] = useState(emailLocale)
  const [weeklyEnabled, setWeeklyEnabled] = useState(weeklyStatsEnabled)
  const [weeklyDay, setWeeklyDay] = useState(weeklyStatsDay)
  const [reminderOn, setReminderOn] = useState(reminderEnabled)
  const [reminderDayOfMonth, setReminderDayOfMonth] = useState(reminderDay)
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
        exportIncludeDescription: includeDescription,
        fuelTrackingEnabled: fuelEnabled,
        email: notifyEmail,
        emailLocale: notifyLocale,
        weeklyStatsEnabled: weeklyEnabled,
        weeklyStatsDay: weeklyDay,
        reminderEnabled: reminderOn,
        reminderDay: reminderDayOfMonth,
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
          id="fuelTrackingEnabled"
          type="checkbox"
          checked={fuelEnabled}
          onChange={(e) => setFuelEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="fuelTrackingEnabled" className="text-sm font-medium">
          {t.settings.fuelTrackingEnabled}
        </label>
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
          <div className="flex items-center gap-2">
            <input
              id="exportIncludeDescription"
              type="checkbox"
              checked={includeDescription}
              onChange={(e) => setIncludeDescription(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="exportIncludeDescription" className="text-sm">
              {t.settings.exportIncludeDescription}
            </label>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t.settings.notificationsTitle}</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">{t.settings.emailAddress}</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2.5"
              />
              <div className="inline-flex shrink-0 rounded border border-slate-300 bg-white p-0.5 text-xs">
                {(['nl', 'en'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNotifyLocale(value)}
                    aria-pressed={notifyLocale === value}
                    className={`rounded px-2 py-1 font-medium ${
                      notifyLocale === value ? 'bg-brand-navy text-white' : 'text-slate-500 hover:text-brand-navy'
                    }`}
                  >
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                id="weeklyStatsEnabled"
                type="checkbox"
                checked={weeklyEnabled}
                onChange={(e) => setWeeklyEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="weeklyStatsEnabled" className="text-sm">
                {t.settings.weeklyStatsEnabled}
              </label>
            </div>
            {weeklyEnabled && (
              <div className="mt-2 pl-6">
                <label className="mb-1 block text-xs text-slate-500">{t.settings.weeklyStatsDay}</label>
                <select
                  value={weeklyDay}
                  onChange={(e) => setWeeklyDay(Number(e.target.value))}
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {t.common.weekdays.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                id="reminderEnabled"
                type="checkbox"
                checked={reminderOn}
                onChange={(e) => setReminderOn(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="reminderEnabled" className="text-sm">
                {t.settings.reminderEnabled}
              </label>
            </div>
            {reminderOn && (
              <div className="mt-2 pl-6">
                <label className="mb-1 block text-xs text-slate-500">{t.settings.reminderDay}</label>
                <select
                  value={reminderDayOfMonth}
                  onChange={(e) => setReminderDayOfMonth(Number(e.target.value))}
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
