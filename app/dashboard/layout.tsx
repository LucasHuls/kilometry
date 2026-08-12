import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:pb-6">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
      <MobileNav />
    </div>
  )
}
