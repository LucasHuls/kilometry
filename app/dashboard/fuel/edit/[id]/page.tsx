import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import FuelForm from '../../FuelForm'

export default async function EditFuelEntryPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return null

  const entry = await prisma.fuelEntry.findUnique({ where: { id: params.id } })
  if (!entry || entry.userId !== user.id) notFound()

  const { t } = await getT()

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.fuel.editEntryTitle}</h1>
      <FuelForm
        entryId={entry.id}
        initial={{
          date: entry.date.toISOString().slice(0, 10),
          odometer: entry.odometer,
          pricePerLiter: entry.pricePerLiter,
          totalPrice: entry.totalPrice,
        }}
      />
    </div>
  )
}
