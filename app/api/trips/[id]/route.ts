import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { parseTripBody } from '@/lib/tripInput'
import { tripStopsInclude } from '@/lib/trips'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const trip = await prisma.trip.findUnique({ where: { id: params.id } })
  if (!trip || trip.userId !== user.id) {
    return NextResponse.json({ error: t.errors.tripNotFound }, { status: 404 })
  }

  const parsed = await parseTripBody(await req.json(), user.id, t)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { stops, ...data } = parsed.data

  const updated = await prisma.$transaction(async (tx) => {
    await tx.tripStop.deleteMany({ where: { tripId: params.id } })
    return tx.trip.update({
      where: { id: params.id },
      data: { ...data, stops: { create: stops } },
      include: tripStopsInclude,
    })
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
