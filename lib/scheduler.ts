import cron from 'node-cron'
import { runDailyEmailChecks } from './email/jobs'

export function startScheduler() {
  cron.schedule('0 7 * * *', runDailyEmailChecks, {
    name: 'kilometry-daily-email-check',
    timezone: process.env.TZ || 'UTC',
    noOverlap: true,
  })
  console.log('kilometry: email scheduler started (daily check at 07:00, TZ=' + (process.env.TZ || 'UTC') + ')')
}
