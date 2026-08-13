import { NextRequest } from 'next/server'

// In-memory: fine as long as the app runs as a single Node process (it does, see
// Dockerfile's `CMD ["node", "server.js"]`, no clustering). Resets on restart, which
// is an acceptable tradeoff for a single-admin self-hosted app.
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

interface Bucket {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

function cleanup(now: number) {
  if (buckets.size < 1000) return
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS) buckets.delete(key)
  }
}

export function getClientIp(req: NextRequest): string {
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return 'unknown'
}

export function checkRateLimit(key: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (bucket && now - bucket.windowStart < WINDOW_MS && bucket.count >= MAX_ATTEMPTS) {
    return { limited: true, retryAfterSeconds: Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000) }
  }
  return { limited: false, retryAfterSeconds: 0 }
}

export function recordFailedAttempt(key: string) {
  const now = Date.now()
  cleanup(now)
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now })
    return
  }
  bucket.count += 1
}

export function resetAttempts(key: string) {
  buckets.delete(key)
}
