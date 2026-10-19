import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { isMapsEnabled } from '@/lib/maps'
import LocationForm from '../LocationForm'

export default async function NewLocationPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const { t } = await getT()

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.location.newLocation}</h1>
      <LocationForm
        mapsEnabled={isMapsEnabled()}
      />
    </div>
  )
}
