import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { normalizePostcode, normalizeText } from '@/lib/normalize'

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

  const { name, fixedKm, address, postcode, placeId, isDefault } = await req.json()
  const normalizedName = normalizeText(name)
  if (!normalizedName || fixedKm === undefined || fixedKm === null) {
    return NextResponse.json({ error: t.errors.allFieldsRequired }, { status: 400 })
  }
  if (Number(fixedKm) < 0) {
    return NextResponse.json({ error: t.errors.kmMustBePositive }, { status: 400 })
  }
  const normalizedAddress = normalizeText(address)
  const normalizedPlaceId = normalizeText(placeId)
  if (normalizedName === 'invalid' || normalizedAddress === 'invalid' || normalizedPlaceId === 'invalid') {
    return NextResponse.json({ error: t.errors.textTooLong }, { status: 400 })
  }
  const normalizedPostcode = normalizePostcode(postcode)
  if (normalizedPostcode === 'invalid') {
    return NextResponse.json({ error: t.errors.invalidPostcode }, { status: 400 })
  }

  const existingCount = await prisma.location.count({ where: { userId: user.id } })
  const shouldBeDefault = existingCount === 0 || Boolean(isDefault)

  const location = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.location.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
    }
    return tx.location.create({
      data: {
        userId: user.id,
        name: normalizedName,
        fixedKm: Number(fixedKm),
        address: normalizedAddress,
        postcode: normalizedPostcode,
        placeId: normalizedAddress ? normalizedPlaceId : null,
        isDefault: shouldBeDefault,
      },
    })
  })

  return NextResponse.json(location)
}
