import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

export async function GET(request: NextRequest) {
  try {
    // Get counts for sidebar badges với safeQuery
    const [imagesCount, categoriesCount, productsCount, ordersCount] = await Promise.all([
      safeQuery.count(prisma.image),
      safeQuery.count(prisma.category),
      safeQuery.count(prisma.product),
      safeQuery.count(prisma.order)
    ])

    return NextResponse.json({
      images: imagesCount,
      categories: categoriesCount,
      products: productsCount,
      orders: ordersCount
    })
  } catch (error) {
    console.error('Sidebar counts API error:', error)
    
    // Nếu là lỗi connection, thử reconnect
    if (error instanceof Error && error.message.includes('prepared statement')) {
      console.log('Attempting database reconnection...')
      await DatabaseHelper.reconnect()
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch sidebar counts' },
      { status: 500 }
    )
  }
}
