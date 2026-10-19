import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { isMapsEnabled, MAX_ROUTE_POINTS, routeLegsKm, RoutePoint } from '@/lib/maps'

// POST { points: [{ placeId?, address? }, ...] } -> { legsKm: number[] }
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })
  if (!isMapsEnabled()) return NextResponse.json({ error: t.errors.mapsUnavailable }, { status: 503 })

  const { points } = await req.json()
  if (!Array.isArray(points) || points.length < 2 || points.length > MAX_ROUTE_POINTS) {
    return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })
  }
  const cleaned: RoutePoint[] = []
  for (const p of points) {
    const placeId = typeof p?.placeId === 'string' ? p.placeId.trim().slice(0, 300) : ''
    const address = typeof p?.address === 'string' ? p.address.trim().slice(0, 300) : ''
    if (!placeId && !address) {
      return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })
    }
    cleaned.push({ placeId: placeId || null, address: address || null })
  }

  try {
    return NextResponse.json({ legsKm: await routeLegsKm(cleaned) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: t.errors.mapsRequestFailed }, { status: 502 })
  }
}
