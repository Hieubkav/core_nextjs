import { NextRequest, NextResponse } from 'next/server'

// Edge-safe middleware: do not import Node-only libraries here.
export async function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*']
}

