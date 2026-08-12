import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getT } from '@/lib/i18n/server'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT()
  return {
    title: 'Kilometry',
    description: t.common.appDescription,
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Kilometry',
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#111827',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getT()

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <ServiceWorkerRegister />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  )
}
