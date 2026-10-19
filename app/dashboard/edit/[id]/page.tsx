import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { isMapsEnabled } from '@/lib/maps'
import { homeAddressOf } from '@/lib/trips'
import TripForm from '../../TripForm'

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const trip = await prisma.trip.findUnique({ where: { id }, include: { stops: true } })
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
        home={homeAddressOf(user)}
        mapsEnabled={isMapsEnabled()}
        tripId={trip.id}
        initial={{
          date: trip.date.toISOString().slice(0, 10),
          stops: trip.stops,
          description: trip.description,
          km: trip.km,
          returnKm: trip.returnKm,
          isReturnTrip: trip.isReturnTrip,
        }}
      />
    </div>
  )
}
