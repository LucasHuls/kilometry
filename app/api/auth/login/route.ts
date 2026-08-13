import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { getClientIp, checkRateLimit, recordFailedAttempt, resetAttempts } from '@/lib/rateLimit'

// A real hash so bcrypt.compare always runs, whether or not the username exists, so
// response timing can't be used to guess valid usernames. Computed once per process.
const DUMMY_HASH = bcrypt.hashSync('no-such-user-timing-safety', 10)

export async function POST(req: NextRequest) {
  const { t } = await getT()
  const ip = getClientIp(req)

  const { limited, retryAfterSeconds } = checkRateLimit(ip)
  if (limited) {
    return NextResponse.json(
      { error: t.errors.tooManyAttempts },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  const { username, password } = await req.json()
  if (!username || !password) {
    return NextResponse.json({ error: t.errors.usernamePasswordRequired }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { username } })
  const passwordValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)

  if (!user || !passwordValid) {
    recordFailedAttempt(ip)
    console.warn(`kilometry: failed login attempt for username "${username}" from ${ip}`)
    return NextResponse.json({ error: t.errors.invalidCredentials }, { status: 401 })
  }

  resetAttempts(ip)
  const session = await getSession()
  session.userId = user.id
  await session.save()

  return NextResponse.json({ ok: true })
}
