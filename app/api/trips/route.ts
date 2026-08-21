import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const month = req.nextUrl.searchParams.get('month')
  const where: { userId: string; date?: { gte: Date; lt: Date } } = { userId: user.id }

  if (month) {
    const [year, m] = month.split('-').map(Number)
    where.date = {
      gte: new Date(year, m - 1, 1),
      lt: new Date(year, m, 1),
    }
  }

  const trips = await prisma.trip.findMany({ where, include: { location: true }, orderBy: { date: 'desc' } })
  return NextResponse.json(trips)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const { date, locationId, customLocation, description, km, isReturnTrip } = await req.json()
  if (!date || km === undefined || km === null) {
    return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })
  }

  const trimmedCustomLocation = typeof customLocation === 'string' ? customLocation.trim() : ''
  if (!locationId && !trimmedCustomLocation) {
    return NextResponse.json({ error: t.errors.locationRequired }, { status: 400 })
  }

  if (locationId) {
    const location = await prisma.location.findFirst({ where: { id: locationId, userId: user.id } })
    if (!location) {
      return NextResponse.json({ error: t.errors.invalidLocation }, { status: 400 })
    }
  }

  const trimmedDescription = typeof description === 'string' ? description.trim() : ''

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      date: new Date(date),
      locationId: locationId || null,
      customLocation: locationId ? null : trimmedCustomLocation,
      description: trimmedDescription || null,
      km: Number(km),
      isReturnTrip: isReturnTrip !== false,
    },
  })

  return NextResponse.json(trip)
}
