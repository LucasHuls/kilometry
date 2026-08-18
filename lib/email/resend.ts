import { Resend } from 'resend'

let client: Resend | null = null
let warnedMissingConfig = false

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

// No-ops if unconfigured instead of throwing, so a missing Resend key doesn't
// take down the rest of the daily scheduler run.
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const resend = getClient()
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    if (!warnedMissingConfig) {
      console.warn('kilometry: RESEND_API_KEY/RESEND_FROM_EMAIL not set, skipping email send.')
      warnedMissingConfig = true
    }
    return
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  })
}
