import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { parseLocationBody } from '@/lib/locationInput'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const location = await prisma.location.findFirst({ where: { id, userId: user.id } })
  if (!location) {
    return NextResponse.json({ error: t.errors.locationNotFound }, { status: 404 })
  }

  const body = await req.json()
  const parsed = parseLocationBody(body, t)
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const isDefault = Boolean(body.isDefault)

  const shouldBeDefault = location.isDefault || isDefault

  const updated = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.location.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
    }
    return tx.location.update({
      where: { id },
      data: { ...parsed.data, isDefault: shouldBeDefault },
    })
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  const { t } = await getT()
  if (!user) return NextResponse.json({ error: t.errors.notLoggedIn }, { status: 401 })

  const location = await prisma.location.findFirst({ where: { id, userId: user.id } })
  if (!location) {
    return NextResponse.json({ error: t.errors.locationNotFound }, { status: 404 })
  }

  const total = await prisma.location.count({ where: { userId: user.id } })
  if (total <= 1) {
    return NextResponse.json({ error: t.errors.mustKeepOneLocation }, { status: 400 })
  }

  try {
    await prisma.location.delete({ where: { id } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      return NextResponse.json({ error: t.errors.locationInUse }, { status: 409 })
    }
    throw err
  }

  if (location.isDefault) {
    const next = await prisma.location.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    })
    if (next) {
      await prisma.location.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  }

  return NextResponse.json({ ok: true })
}
