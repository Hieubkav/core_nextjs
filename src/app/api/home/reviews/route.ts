import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    // Sử dụng safeQuery với retry logic
    const reviews: any[] = await safeQuery.findMany(prisma.review, {
      where: {
        isVisible: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Map reviews to include customer name and product name
    const mappedReviews = reviews.map((review: any) => ({
      id: review.id,
      customerId: review.customerId,
      productId: review.productId,
      rating: review.rating,
      title: review.title,
      content: review.content,
      isVisible: review.isVisible,
      sortOrder: review.sortOrder,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      customerName: review.customer ? review.customer.name : 'Ẩn danh',
      productName: review.product ? review.product.name : '',
      productSlug: review.product ? review.product.slug : ''
    }))

    return NextResponse.json(mappedReviews)
  } catch (error) {
    console.error('Home reviews API error:', error)
    
    // Nếu là lỗi connection, thử reconnect
    if (error instanceof Error && error.message.includes('prepared statement')) {
      console.log('Attempting database reconnection...')
      await DatabaseHelper.reconnect()
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}