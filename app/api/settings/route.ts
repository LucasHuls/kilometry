import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { locales, defaultLocale } from '@/lib/i18n/dictionaries'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    exportIncludeDescription,
    fuelTrackingEnabled,
    email,
    emailLocale,
    weeklyStatsEnabled,
    weeklyStatsDay,
    reminderEnabled,
    reminderDay,
  } = await req.json()
  if (kmRate === undefined) {
    return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })
  }

  const trimmedEmail = typeof email === 'string' ? email.trim() : ''
  if ((weeklyStatsEnabled || reminderEnabled) && !trimmedEmail) {
    return NextResponse.json({ error: t.errors.emailRequiredForNotifications }, { status: 400 })
  }
  if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json({ error: t.errors.invalidEmail }, { status: 400 })
  }

  const weekDay = Number(weeklyStatsDay)
  if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
    return NextResponse.json({ error: t.errors.invalidDay }, { status: 400 })
  }
  const monthDay = Number(reminderDay)
  if (!Number.isInteger(monthDay) || monthDay < 1 || monthDay > 28) {
    return NextResponse.json({ error: t.errors.invalidDay }, { status: 400 })
  }

  const resolvedEmailLocale = locales.includes(emailLocale) ? emailLocale : defaultLocale

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      kmRate: Number(kmRate),
      defaultReturnTrip: Boolean(defaultReturnTrip),
      exportIncludeLocation: Boolean(exportIncludeLocation),
      exportIncludeRetour: Boolean(exportIncludeRetour),
      exportIncludeKm: Boolean(exportIncludeKm),
      exportIncludeFee: Boolean(exportIncludeFee),
      exportIncludeDescription: Boolean(exportIncludeDescription),
      fuelTrackingEnabled: Boolean(fuelTrackingEnabled),
      email: trimmedEmail || null,
      emailLocale: resolvedEmailLocale,
      weeklyStatsEnabled: Boolean(weeklyStatsEnabled),
      weeklyStatsDay: weekDay,
      reminderEnabled: Boolean(reminderEnabled),
      reminderDay: monthDay,
    },
  })

  return NextResponse.json(updated)
}
