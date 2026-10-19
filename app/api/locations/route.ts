import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { parseLocationBody } from '@/lib/locationInput'

export async function GET() {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const locations = await prisma.location.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })
  return NextResponse.json(locations)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const body = await req.json()
  const parsed = parseLocationBody(body, t)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const isDefault = Boolean(body.isDefault)

  const existingCount = await prisma.location.count({ where: { userId: user.id } })
  const shouldBeDefault = existingCount === 0 || isDefault

  const location = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.location.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
    }
    return tx.location.create({
      data: { userId: user.id, ...parsed.data, isDefault: shouldBeDefault },
    })
  })

  return NextResponse.json(location)
}
