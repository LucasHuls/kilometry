import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('seed-admin: ADMIN_USERNAME and ADMIN_PASSWORD env vars are required.')
    process.exit(1)
  }
  if (ADMIN_PASSWORD.length < 8) {
    console.error('seed-admin: ADMIN_PASSWORD must be at least 8 characters.')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const existing = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })

  if (!existing) {
    const user = await prisma.user.create({ data: { username: ADMIN_USERNAME, passwordHash } })
    await prisma.location.create({
      data: { userId: user.id, name: 'Kantoor', fixedKm: 0, isDefault: true },
    })
    console.log(`seed-admin: created admin user "${ADMIN_USERNAME}".`)
  } else {
    await prisma.user.update({
      where: { id: existing.id },
      data: { username: ADMIN_USERNAME, passwordHash },
    })
    console.log(`seed-admin: updated admin user "${ADMIN_USERNAME}".`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
