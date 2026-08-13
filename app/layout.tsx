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
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Kilometry',
    },
    other: {
      'mobile-web-app-capable': 'yes',
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
      {/* Rendered manually instead of via generateMetadata's `manifest` field: Next.js
          always adds crossOrigin="use-credentials" to that link, which makes Android
          Chrome's WebAPK install step fail and silently fall back to a home-screen
          shortcut instead of a real standalone install. */}
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <ServiceWorkerRegister />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  )
}
