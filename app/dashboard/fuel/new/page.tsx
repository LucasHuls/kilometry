import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import FuelForm from '../FuelForm'

export default async function NewFuelEntryPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const { t } = await getT()

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.fuel.newEntryTitle}</h1>
      <FuelForm />
    </div>
  )
}
