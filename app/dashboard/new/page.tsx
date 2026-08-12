import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import TripForm from '../TripForm'

export default async function NewTripPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const { t } = await getT()
  const locations = await prisma.location.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.trip.newTripTitle}</h1>
      <TripForm locations={locations} />
    </div>
  )
}
