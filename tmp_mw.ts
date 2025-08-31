import { NextRequest, NextResponse } from 'next/server'

// Enhanced middleware với database connection check
export async function middleware(request: NextRequest) {
  // Nếu là API route liên quan database, đảm bảo connection
  if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    try {
      // Dynamic import chỉ khi cần thiết và chạy trên server
      if (typeof window === 'undefined') {
        const { PrismaHelper } = await import('@/lib/prisma')
        
        // Async connection check - không block request
        PrismaHelper.ensureConnection().catch(error => {
          console.error('⚠️ Middleware: Database connection check failed:', error)
        })
      }
    } catch (error) {
      // Không block request ngầu khi connection check fails
      console.warn('⚠️ Middleware: Connection check skipped due to error:', error)
    }
  }
  
  // Allow all requests to pass through during development
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*']
}

// Original auth middleware (commented out for development)
// import { withAuth } from 'next-auth/middleware'
// import { NextResponse } from 'next/server'

// export default withAuth(
//   function middleware(req) {
//     // Check if user is trying to access admin routes
//     if (req.nextUrl.pathname.startsWith('/admin')) {
//       // Check if user has admin role
//       if (req.nextauth.token?.role !== 'admin') {
//         return NextResponse.redirect(new URL('/auth/signin', req.url))
//       }
//     }
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         // Allow access to admin routes only for admin users
//         if (req.nextUrl.pathname.startsWith('/admin')) {
//           return token?.role === 'admin'
//         }
//         // Allow access to other protected routes for any authenticated user
//         return !!token
//       },
//     },
//   }
// )

