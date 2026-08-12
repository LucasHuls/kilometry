'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/LocaleProvider'

export default function LogoutButton() {
  const router = useRouter()
  const { t } = useLocale()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="hover:underline">
      {t.nav.logout}
    </button>
  )
}
