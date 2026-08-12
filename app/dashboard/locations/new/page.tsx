import { getT } from '@/lib/i18n/server'
import LocationForm from '../LocationForm'

export default async function NewLocationPage() {
  const { t } = await getT()

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.location.newLocation}</h1>
      <LocationForm />
    </div>
  )
}
