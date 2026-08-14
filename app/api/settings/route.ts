import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const {
    kmRate,
    defaultReturnTrip,
    exportIncludeLocation,
    exportIncludeRetour,
    exportIncludeKm,
    exportIncludeFee,
    fuelTrackingEnabled,
  } = await req.json()
  if (kmRate === undefined) {
    return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      kmRate: Number(kmRate),
      defaultReturnTrip: Boolean(defaultReturnTrip),
      exportIncludeLocation: Boolean(exportIncludeLocation),
      exportIncludeRetour: Boolean(exportIncludeRetour),
      exportIncludeKm: Boolean(exportIncludeKm),
      exportIncludeFee: Boolean(exportIncludeFee),
      fuelTrackingEnabled: Boolean(fuelTrackingEnabled),
    },
  })

  return NextResponse.json(updated)
}
