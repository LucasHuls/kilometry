'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/lib/i18n/LocaleProvider'

export interface AddressValue {
  address: string
  postcode: string
  placeId: string
}

interface Suggestion {
  placeId: string
  text: string
  mainText: string
  secondaryText: string
  isEstablishment: boolean
}

interface Props {
  value: AddressValue
  onChange: (value: AddressValue) => void
  // Called after picking a Google suggestion that is a business, with its name.
  onPickEstablishment?: (name: string) => void
  mapsEnabled: boolean
  postcodeRequired?: boolean
  addressRequired?: boolean
}

// Places autocomplete bills a "session" (typing + one details lookup) as one request
// when both calls share a token. crypto.randomUUID only exists in secure contexts, and
// a self-hosted instance may be served over plain http, hence the fallback.
function newSessionToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export default function AddressInput({
  value,
  onChange,
  onPickEstablishment,
  mapsEnabled,
  postcodeRequired,
  addressRequired,
}: Props) {
  const { t } = useLocale()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [searched, setSearched] = useState(false)
  // Only search after the user typed, not when a value is set programmatically.
  const [query, setQuery] = useState<string | null>(null)
  const sessionRef = useRef(newSessionToken())

  useEffect(() => {
    if (!mapsEnabled || query === null) return
    const q = query.trim()
    if (q.length < 3) {
      setSuggestions([])
      setSearched(false)
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q, session: sessionRef.current })
        const res = await fetch(`/api/maps/autocomplete?${params}`, { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        setHighlighted(-1)
        setSearched(true)
        setOpen(true)
      } catch {
        // Aborted or offline: the user can still type the address by hand.
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, mapsEnabled])

  async function pick(suggestion: Suggestion) {
    setOpen(false)
    setQuery(null)
    setSuggestions([])
    const params = new URLSearchParams({ id: suggestion.placeId, session: sessionRef.current })
    sessionRef.current = newSessionToken()
    try {
      const res = await fetch(`/api/maps/place?${params}`)
      if (!res.ok) throw new Error()
      const details = await res.json()
      onChange({
        address: details.address || suggestion.text,
        postcode: details.postcode ?? '',
        placeId: details.placeId || suggestion.placeId,
      })
    } catch {
      onChange({ address: suggestion.text, postcode: value.postcode, placeId: suggestion.placeId })
    }
    if (suggestion.isEstablishment) onPickEstablishment?.(suggestion.mainText)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => (h + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => (h <= 0 ? suggestions.length - 1 : h - 1))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      pick(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_7rem]">
      <div className="relative">
        <label className="mb-1 block text-xs text-slate-500">{t.address.address}</label>
        <input
          type="text"
          value={value.address}
          onChange={(e) => {
            // Typing invalidates a previously picked place.
            onChange({ ...value, address: e.target.value, placeId: '' })
            setQuery(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder={mapsEnabled ? t.address.searchPlaceholder : undefined}
          required={addressRequired}
          maxLength={191}
          autoComplete={mapsEnabled ? 'off' : 'street-address'}
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
        {open && searched && (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded border border-slate-200 bg-white text-sm shadow-lg">
            {suggestions.length === 0 && <li className="px-3 py-2 text-slate-400">{t.address.noResults}</li>}
            {suggestions.map((s, i) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  // mousedown fires before the input's blur closes the list.
                  onMouseDown={(e) => {
                    e.preventDefault()
                    pick(s)
                  }}
                  className={`block w-full px-3 py-2 text-left ${i === highlighted ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                  <span className="block font-medium">{s.mainText}</span>
                  {s.secondaryText && <span className="block text-xs text-slate-500">{s.secondaryText}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-500">{t.address.postcode}</label>
        <input
          type="text"
          value={value.postcode}
          onChange={(e) => onChange({ ...value, postcode: e.target.value })}
          required={postcodeRequired}
          maxLength={16}
          autoComplete="postal-code"
          className="w-full rounded border border-slate-300 px-3 py-2.5"
        />
      </div>
    </div>
  )
}
