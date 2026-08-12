'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, MapPin, Settings } from 'lucide-react'
import { useLocale } from '@/lib/i18n/LocaleProvider'

export default function SidebarNav() {
  const pathname = usePathname()
  const { t } = useLocale()

  const items = [
    { href: '/dashboard', label: t.nav.overview, icon: LayoutDashboard, exact: true },
    { href: '/dashboard/new', label: t.nav.newTrip, icon: Plus, exact: false },
    { href: '/dashboard/locations', label: t.nav.locations, icon: MapPin, exact: false },
    { href: '/dashboard/settings', label: t.nav.settings, icon: Settings, exact: false },
  ]

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium ${
              active ? 'bg-brand-navy text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? 'text-brand-cyan' : ''}`} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
