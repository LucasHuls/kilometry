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

  const entries = await prisma.fuelEntry.findMany({ where, orderBy: { date: 'desc' } })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

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

  const entry = await prisma.fuelEntry.create({
    data: {
      userId: user.id,
      date: new Date(date),
      odometer: Number(odometer),
      pricePerLiter: Number(pricePerLiter),
      totalPrice: Number(totalPrice),
    },
  })

  return NextResponse.json(entry)
}
