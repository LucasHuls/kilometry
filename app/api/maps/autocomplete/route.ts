import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { autocompleteAddress, isMapsEnabled } from '@/lib/maps'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  const { t, locale } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })
  if (!isMapsEnabled()) return NextResponse.json({ error: t.errors.mapsUnavailable }, { status: 503 })

  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 200)
  const session = (req.nextUrl.searchParams.get('session') ?? '').slice(0, 100)
  if (q.length < 3) return NextResponse.json({ suggestions: [] })

  try {
    return NextResponse.json({ suggestions: await autocompleteAddress(q, session, locale) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: t.errors.mapsRequestFailed }, { status: 502 })
  }
}
