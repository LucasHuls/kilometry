import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { parseTripBody } from '@/lib/tripInput'
import { tripStopsInclude } from '@/lib/trips'

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

  const trips = await prisma.trip.findMany({ where, include: tripStopsInclude, orderBy: { date: 'desc' } })
  return NextResponse.json(trips)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const parsed = await parseTripBody(await req.json(), user.id, t)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { stops, ...data } = parsed.data

  const trip = await prisma.trip.create({
    data: { ...data, userId: user.id, stops: { create: stops } },
    include: tripStopsInclude,
  })

  return NextResponse.json(trip)
}
