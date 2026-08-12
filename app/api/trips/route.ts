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

  const { date, locationId, km } = await req.json()
  if (!date || !locationId || km === undefined || km === null) {
    return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })
  }

  const location = await prisma.location.findFirst({ where: { id: locationId, userId: user.id } })
  if (!location) {
    return NextResponse.json({ error: t.errors.invalidLocation }, { status: 400 })
  }

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      date: new Date(date),
      locationId,
      km: Number(km),
    },
  })

  return NextResponse.json(trip)
}
