import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const entry = await prisma.fuelEntry.findUnique({ where: { id: params.id } })
  if (!entry || entry.userId !== user.id) {
    return NextResponse.json({ error: t.errors.fuelEntryNotFound }, { status: 404 })
  }

  const { date, odometer, pricePerLiter, totalPrice } = await req.json()
  if (!date || odometer === undefined || odometer === null || !pricePerLiter || !totalPrice) {
    return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })
  }
  if (Number(odometer) < 0) {
    return NextResponse.json({ error: t.errors.kmMustBePositive }, { status: 400 })
  }
  if (Number(pricePerLiter) <= 0 || Number(totalPrice) <= 0) {
    return NextResponse.json({ error: t.errors.priceMustBePositive }, { status: 400 })
  }

  const updated = await prisma.fuelEntry.update({
    where: { id: params.id },
    data: {
      date: new Date(date),
      odometer: Number(odometer),
      pricePerLiter: Number(pricePerLiter),
      totalPrice: Number(totalPrice),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const entry = await prisma.fuelEntry.findUnique({ where: { id: params.id } })
  if (!entry || entry.userId !== user.id) {
    return NextResponse.json({ error: t.errors.fuelEntryNotFound }, { status: 404 })
  }

  await prisma.fuelEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
