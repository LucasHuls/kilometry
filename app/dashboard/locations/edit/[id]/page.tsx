import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import LocationForm from '../../LocationForm'

export default async function EditLocationPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return null

  const location = await prisma.location.findUnique({ where: { id: params.id } })
  if (!location || location.userId !== user.id) notFound()

  const { t } = await getT()

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.location.editLocationTitle}</h1>
      <LocationForm
        locationId={location.id}
        initial={{ name: location.name, fixedKm: location.fixedKm, isDefault: location.isDefault }}
      />
    </div>
  )
}
