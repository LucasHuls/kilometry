import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { tripsToXlsx } from '@/lib/xlsx'
import { getT } from '@/lib/i18n/server'
import { monthRange } from '@/lib/trips'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const month = req.nextUrl.searchParams.get('month')
  const where: { userId: string; date?: { gte: Date; lt: Date } } = { userId: user.id }

  if (month) {
    where.date = monthRange(month)
  }

  const trips = await prisma.trip.findMany({ where, include: { location: true }, orderBy: { date: 'desc' } })
  const xlsx = await tripsToXlsx(trips, user.kmRate, t, {
    location: user.exportIncludeLocation,
    retour: user.exportIncludeRetour,
    km: user.exportIncludeKm,
    fee: user.exportIncludeFee,
    description: user.exportIncludeDescription,
  })

  return new NextResponse(new Uint8Array(xlsx), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="kilometry-${month || 'alle'}.xlsx"`,
    },
  })
}
