import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import TripForm from '../../TripForm'

export default async function EditTripPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return null

  const trip = await prisma.trip.findUnique({ where: { id: params.id } })
  if (!trip || trip.userId !== user.id) notFound()

  const { t } = await getT()
  const locations = await prisma.location.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.trip.editTripTitle}</h1>
      <TripForm
        locations={locations}
        tripId={trip.id}
        initial={{
          date: trip.date.toISOString().slice(0, 10),
          locationId: trip.locationId,
          km: trip.km,
        }}
      />
    </div>
  )
}
