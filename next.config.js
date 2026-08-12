// register: false. next-pwa's auto-register only hooks into the Pages Router
// "main.js" webpack entry, which doesn't exist in the App Router, so it silently
// never registers the service worker. Registration is done manually instead,
// see components/ServiceWorkerRegister.tsx.
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = withPWA(nextConfig)
