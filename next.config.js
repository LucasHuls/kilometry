// register: false. next-pwa's auto-register only hooks into the Pages Router
// "main.js" webpack entry, which doesn't exist in the App Router, so it silently
// never registers the service worker. Registration is done manually instead,
// see components/ServiceWorkerRegister.tsx.
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  skipWaiting: true,
  buildExcludes: [/app-build-manifest\.json$/],
})

const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Next 14.x still needs this flag for instrumentation.ts to run.
    instrumentationHook: true,
    serverComponentsExternalPackages: ['node-cron', 'resend'],
  },
  webpack: (config, { nextRuntime }) => {
    // instrumentation.ts also compiles for the edge runtime, which can't bundle
    // node-cron/resend's node: built-ins. Keep the scheduler out of that build.
    if (nextRuntime === 'edge') {
      config.resolve.alias['./lib/scheduler'] = false
      config.resolve.alias[path.resolve(__dirname, 'lib/scheduler.ts')] = false
    }
    return config
  },
}

module.exports = withPWA(nextConfig)
