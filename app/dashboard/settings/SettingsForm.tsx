'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { readErrorMessage } from '@/lib/api'
import { useLocale } from '@/lib/i18n/LocaleProvider'

export default function SettingsForm({ kmRate }: { kmRate: number }) {
  const router = useRouter()
  const { t } = useLocale()
  const [rate, setRate] = useState(String(kmRate))
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kmRate: Number(rate) }),
    })

    if (res.ok) {
      setSaved(true)
      router.refresh()
    } else {
      setError(await readErrorMessage(res, t.trip.saveFailed))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6">
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">{t.settings.saved}</p>}
      <button type="submit" className="w-full rounded bg-brand-navy py-2.5 text-white hover:bg-slate-700">
        {t.common.save}
      </button>
    </form>
  )
}
