import { headers } from 'next/headers'

export function getBaseUrl(): string {
  // Client-side
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Prefer explicit env when available
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.VERCEL_URL
  if (envUrl) {
    // Ensure protocol
    if (/^https?:\/\//i.test(envUrl)) return envUrl
    return `https://${envUrl}`
  }

  // Server-side: try reading request headers. Some Next setups type headers() as a Promise;
  // use a safe cast and optional chaining to keep this function synchronous.
  try {
    const h: any = headers() as any
    const protocol = h?.get?.('x-forwarded-proto') ?? 'http'
    const host = h?.get?.('x-forwarded-host') ?? h?.get?.('host') ?? 'localhost:3000'
    return `${protocol}://${host}`
  } catch {
    // Fallback
    return 'http://localhost:3000'
  }
}
