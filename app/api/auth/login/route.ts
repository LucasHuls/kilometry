import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'

export async function POST(req: NextRequest) {
  const { t } = await getT()
  const { username, password } = await req.json()
  if (!username || !password) {
    return NextResponse.json({ error: t.errors.usernamePasswordRequired }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: t.errors.invalidCredentials }, { status: 401 })
  }

  const session = await getSession()
  session.userId = user.id
  await session.save()

  return NextResponse.json({ ok: true })
}
