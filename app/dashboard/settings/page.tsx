import { getCurrentUser } from '@/lib/auth'
import { getT } from '@/lib/i18n/server'
import { isMapsEnabled } from '@/lib/maps'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const { t } = await getT()

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">{t.settings.title}</h1>
      <SettingsForm
        kmRate={user.kmRate}
        defaultReturnTrip={user.defaultReturnTrip}
        exportIncludeLocation={user.exportIncludeLocation}
        exportIncludeRetour={user.exportIncludeRetour}
        exportIncludeKm={user.exportIncludeKm}
        exportIncludeFee={user.exportIncludeFee}
        exportIncludeDescription={user.exportIncludeDescription}
        exportIncludePostcodes={user.exportIncludePostcodes}
        homeAddress={user.homeAddress}
        homePostcode={user.homePostcode}
        homePlaceId={user.homePlaceId}
        mapsEnabled={isMapsEnabled()}
        fuelTrackingEnabled={user.fuelTrackingEnabled}
        email={user.email}
        emailLocale={user.emailLocale}
        weeklyStatsEnabled={user.weeklyStatsEnabled}
        weeklyStatsDay={user.weeklyStatsDay}
        reminderEnabled={user.reminderEnabled}
        reminderDay={user.reminderDay}
      />
    </div>
  )
}
