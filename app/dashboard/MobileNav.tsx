'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, MapPin, Settings } from 'lucide-react'
import { useLocale } from '@/lib/i18n/LocaleProvider'

export default function MobileNav() {
  const pathname = usePathname()
  const { t } = useLocale()

  const items = [
    { href: '/dashboard', label: t.nav.overview, icon: LayoutDashboard, exact: true },
    { href: '/dashboard/new', label: t.nav.newTrip, icon: Plus, exact: false },
    { href: '/dashboard/locations', label: t.nav.locations, icon: MapPin, exact: false },
    { href: '/dashboard/settings', label: t.nav.settings, icon: Settings, exact: false },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
              active ? 'text-brand-navy' : 'text-slate-500'
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? 'text-brand-cyan' : ''}`} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
