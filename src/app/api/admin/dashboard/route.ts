import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Temporarily disabled auth check for development
    // const session = await getServerSession(authOptions)

    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Get dashboard statistics with mock data for now
    const totalProducts = 1 // We have 1 product from seed
    const totalCustomers = 0 // No customers yet
    const totalOrders = 0 // No orders yet
    const totalRevenue = 0 // No revenue yet
    const recentOrders: any[] = [] // No orders yet

    return NextResponse.json({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue,
      recentOrders
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
