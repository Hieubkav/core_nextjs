'use client'

// Temporarily disabled auth check for development
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily disabled for development
  // const { data: session, status } = useSession()
  // const router = useRouter()

  // useEffect(() => {
  //   if (status === 'loading') return // Still loading

  //   if (!session) {
  //     router.push('/auth/signin')
  //     return
  //   }

  //   if (session.user.role !== 'admin') {
  //     router.push('/')
  //     return
  //   }
  // }, [session, status, router])

  // if (status === 'loading') {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  //     </div>
  //   )
  // }

  // if (!session || session.user.role !== 'admin') {
  //   return null
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
