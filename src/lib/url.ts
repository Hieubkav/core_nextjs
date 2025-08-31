import { headers } from 'next/headers'

export function getBaseUrl(): string {
  // Client-side
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side: derive from request headers via Next.js helpers
  const h = headers()
  const protocol = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  return `${protocol}://${host}`
}

