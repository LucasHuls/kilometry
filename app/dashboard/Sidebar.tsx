import Link from 'next/link'
import Logo from '@/components/Logo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SidebarNav from './SidebarNav'
import LogoutButton from './LogoutButton'

export default function Sidebar({ fuelTrackingEnabled }: { fuelTrackingEnabled: boolean }) {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-4">
        <Logo className="h-8 w-8 shrink-0" />
        <span className="text-lg font-semibold">Kilometry</span>
      </Link>
      <div className="flex-1 px-2">
        <SidebarNav fuelTrackingEnabled={fuelTrackingEnabled} />
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
        <LogoutButton />
        <LanguageSwitcher />
      </div>
    </aside>
  )
}
