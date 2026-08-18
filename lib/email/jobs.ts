import { prisma } from '@/lib/prisma'
import { dictionaries, Locale, locales, defaultLocale } from '@/lib/i18n/dictionaries'
import { sendEmail } from './resend'
import { getWeeklyStats } from './stats'
import { weeklyStatsEmail, reminderEmail } from './templates'

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function alreadySentToday(lastSentAt: Date | null, today: Date) {
  return lastSentAt !== null && isSameDay(lastSentAt, today)
}

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale
}

export async function runDailyEmailChecks() {
  const today = new Date()
  const weekday = today.getDay()
  const dayOfMonth = today.getDate()

  const users = await prisma.user.findMany()

  for (const user of users) {
    if (!user.email) continue
    const dict = dictionaries[resolveLocale(user.emailLocale)]

    if (
      user.weeklyStatsEnabled &&
      user.weeklyStatsDay === weekday &&
      !alreadySentToday(user.lastWeeklyStatsSentAt, today)
    ) {
      try {
        const stats = await getWeeklyStats(user.id, user.kmRate, user.fuelTrackingEnabled)
        const { subject, html } = weeklyStatsEmail(dict, resolveLocale(user.emailLocale), stats)
        await sendEmail({ to: user.email, subject, html })
        await prisma.user.update({ where: { id: user.id }, data: { lastWeeklyStatsSentAt: today } })
      } catch (err) {
        console.error(`kilometry: failed to send weekly stats email to ${user.username}`, err)
      }
    }

    if (user.reminderEnabled && user.reminderDay === dayOfMonth && !alreadySentToday(user.lastReminderSentAt, today)) {
      try {
        const { subject, html } = reminderEmail(dict)
        await sendEmail({ to: user.email, subject, html })
        await prisma.user.update({ where: { id: user.id }, data: { lastReminderSentAt: today } })
      } catch (err) {
        console.error(`kilometry: failed to send reminder email to ${user.username}`, err)
      }
    }
  }
}
