import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const trip = await prisma.trip.findUnique({ where: { id: params.id } })
  if (!trip || trip.userId !== user.id) {
    return NextResponse.json({ error: t.errors.tripNotFound }, { status: 404 })
  }

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

  const updated = await prisma.trip.update({
    where: { id: params.id },
    data: {
      date: new Date(date),
      locationId: locationId || null,
      customLocation: locationId ? null : trimmedCustomLocation,
      description: trimmedDescription || null,
      km: Number(km),
      isReturnTrip: isReturnTrip !== false,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const trip = await prisma.trip.findUnique({ where: { id: params.id } })
  if (!trip || trip.userId !== user.id) {
    return NextResponse.json({ error: t.errors.tripNotFound }, { status: 404 })
  }

  await prisma.trip.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
