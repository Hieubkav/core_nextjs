import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getBaseUrl } from '@/lib/url'
import { PrismaHelper } from '@/lib/prisma'

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'
// Disable static caching for clear, live diagnostics
export const dynamic = 'force-dynamic'

type ProbeSummary = {
  url: string
  method?: string
  status?: number
  ok?: boolean
  durationMs: number
  contentType?: string | null
  allow?: string | null
  size?: number
  items?: number
  keys?: string[]
  error?: string
}

async function probeEndpoint(url: string, init?: RequestInit, timeoutMs = 10000): Promise<ProbeSummary> {
  const started = Date.now()
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const method = (init?.method || 'GET').toString().toUpperCase()
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { accept: 'application/json', ...(init?.headers as any) },
      method,
      signal: controller.signal
    })
    clearTimeout(timer)
    const durationMs = Date.now() - started
    const contentType = res.headers.get('content-type')
    const allow = res.headers.get('allow')

    let items: number | undefined
    let keys: string[] | undefined
    let size: number | undefined

    // Try to summarize JSON body without returning bulky data
    try {
      const text = await res.text()
      size = text.length
      try {
        const body = JSON.parse(text)
        if (Array.isArray(body)) {
          items = body.length
          if (body.length > 0 && typeof body[0] === 'object' && body[0] !== null) {
            keys = Object.keys(body[0]).slice(0, 10)
          }
        } else if (body && typeof body === 'object') {
          keys = Object.keys(body).slice(0, 20)
          // Common patterns: include count-like hints if present
          if ('count' in body && typeof (body as any).count === 'number') items = (body as any).count
        }
      } catch {
        // Non-JSON or invalid JSON; keep size only
      }
    } catch {
      // Ignore body read errors in diagnostics
    }

    return {
      url,
      method,
      status: res.status,
      ok: res.ok,
      durationMs,
      contentType,
      allow,
      size,
      items,
      keys
    }
  } catch (err: any) {
    return {
      url,
      method: (init?.method || 'GET').toString().toUpperCase(),
      durationMs: Date.now() - started,
      error: err?.message || 'Unknown fetch error'
    }
  }
}

export async function GET(request: NextRequest) {
  // headers() có thể được typing là Promise trên một số setup; dùng any + optional chaining cho an toàn
  const h: any = headers() as any
  const requestUrl = request.url
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const originFromRequest = (request as any)?.nextUrl?.origin ?? `${proto}://${host}`

  // Base URL as used by the app
  const baseUrl = getBaseUrl()

  // Selected env presence (no secrets exposed)
  const envPresence = {
    NODE_ENV: !!process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    VERCEL_URL: !!process.env.VERCEL_URL,
    VERCEL_REGION: !!process.env.VERCEL_REGION,
    NEXT_RUNTIME: !!process.env.NEXT_RUNTIME,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    SITE_URL: !!process.env.SITE_URL,
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    SUPABASE_URL: !!(process.env as any).SUPABASE_URL,
    SUPABASE_ANON_KEY: !!(process.env as any).SUPABASE_ANON_KEY
  }

  // Prepare probes for key endpoints used on homepage and a control admin endpoint
  const endpoints = [
    '/api/home/sliders?limit=5',
    '/api/home/categories?limit=8',
    '/api/home/products?limit=8&sortBy=sortOrder&sortOrder=asc',
    '/api/home/latest-products?limit=8',
    '/api/home/reviews?limit=6',
    '/api/home/posts?limit=3&sortBy=createdAt&sortOrder=desc',
    '/api/home/faqs?limit=10',
    '/api/home/settings',
    // Control sample from admin space
    '/api/admin/sidebar-counts'
  ]

  // Probe bổ sung cho admin/settings để phát hiện lỗi cập nhật (không gây side-effect)
  const methodProbes = [
    { path: '/api/admin/settings', method: 'OPTIONS' },
    { path: '/api/admin/settings', method: 'HEAD' },
    { path: '/api/admin/settings', method: 'GET' },
  ]

  const absolute = (p: string) => `${originFromRequest}${p}`
  const getProbes = await Promise.all(endpoints.map(p => probeEndpoint(absolute(p))))
  const extraProbes = await Promise.all(methodProbes.map(({ path, method }) => probeEndpoint(absolute(path), { method })))
  const probes = [...getProbes, ...extraProbes]

  // Prisma health
  const db = await PrismaHelper.healthCheck().catch((e: any) => ({ healthy: false, error: e?.message || 'Prisma health check failed' }))

  const result = {
    meta: {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      runtime: process.env.NEXT_RUNTIME || 'nodejs',
      vercel: !!process.env.VERCEL,
      vercelRegion: process.env.VERCEL_REGION || null
    },
    request: {
      requestUrl,
      derivedProto: proto,
      derivedHost: host,
      baseUrlUsedByApp: baseUrl,
      baseUrlFromRequest: originFromRequest,
      hint: 'Probes use originFromRequest; admin/settings checked via OPTIONS/HEAD/GET'
    },
    envPresence,
    database: db,
    probes
  }

  return NextResponse.json(result, { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } })
}
