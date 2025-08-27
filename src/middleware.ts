import { NextRequest, NextResponse } from 'next/server'

// Temporarily disabled auth middleware for development
export function middleware(request: NextRequest) {
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
