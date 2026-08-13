import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json(
    {
      name: 'Kilometry',
      short_name: 'Kilometry',
      description: 'Kilometervergoeding bijhouden',
      start_url: '/dashboard',
      display: 'standalone',
      background_color: '#111827',
      theme_color: '#111827',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } }
  )
}
