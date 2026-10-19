import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { getPlaceDetails, isMapsEnabled } from '@/lib/maps'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  const { t, locale } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })
  if (!isMapsEnabled()) return NextResponse.json({ error: t.errors.mapsUnavailable }, { status: 503 })

  const id = (req.nextUrl.searchParams.get('id') ?? '').trim()
  const session = (req.nextUrl.searchParams.get('session') ?? '').slice(0, 100)
  if (!id || id.length > 300) return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })

  try {
    return NextResponse.json(await getPlaceDetails(id, session, locale))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: t.errors.mapsRequestFailed }, { status: 502 })
  }
}
