import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { isMapsEnabled } from '@/lib/maps'
import LocationForm from '../../LocationForm'

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return null

  const location = await prisma.location.findUnique({ where: { id } })
  if (!location || location.userId !== user.id) notFound()

  const { t } = await getT()

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.location.editLocationTitle}</h1>
      <LocationForm
        locationId={location.id}
        mapsEnabled={isMapsEnabled()}
        initial={{
          name: location.name,
          fixedKm: location.fixedKm,
          kmFromRoute: location.kmFromRoute,
          address: location.address,
          postcode: location.postcode,
          placeId: location.placeId,
          isDefault: location.isDefault,
        }}
      />
    </div>
  )
}
