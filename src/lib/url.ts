import { headers } from 'next/headers'

function withProtocol(u: string): string {
  return /^https?:\/\//i.test(u) ? u : `https://${u}`
}

export function getBaseUrl(): string {
  // Client-side
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side: prefer current request headers (correct for aliases and proxies)
  try {
    const h: any = headers() as any
    const protocol = h?.get?.('x-forwarded-proto') ?? 'http'
    const host = h?.get?.('x-forwarded-host') ?? h?.get?.('host')
    if (host) return `${protocol}://${host}`
  } catch {
    // ignore and fallback to envs
  }

  // Then use explicit site URL envs if provided
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (explicit) return withProtocol(explicit)

  // Last fallback: Vercel deployment URL or localhost
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) return withProtocol(vercelUrl)
  return 'http://localhost:3000'
}
