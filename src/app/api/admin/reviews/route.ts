import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

// GET - List all reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
        { product: { name: { contains: search, mode: 'insensitive' as const } } },
        { customer: { name: { contains: search, mode: 'insensitive' as const } } },
      ]
    } : {}

    // Sử dụng safeQuery với retry logic
    const [reviews, total] = await Promise.all([
      safeQuery.findMany(prisma.review, {
        where,
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
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
      }),
      safeQuery.count(prisma.review, { where })
    ])

    const pages = Math.ceil((total as number) / limit)

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })

  } catch (error) {
    console.error('Reviews API error:', error)
    
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

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, productId, rating, title, content, sortOrder, isVisible } = body

    // Validate required fields
    if (!customerId || !productId || !rating) {
      return NextResponse.json(
        { error: 'Customer ID, Product ID và Rating là bắt buộc' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const customer = await safeQuery.findUnique(prisma.customer, {
      where: { id: parseInt(customerId) }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if product exists
    const product = await safeQuery.findUnique(prisma.product, {
      where: { id: parseInt(productId) }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if review already exists for this customer and product
    const existingReview = await safeQuery.findUnique(prisma.review, {
      where: {
        customerId_productId: {
          customerId: parseInt(customerId),
          productId: parseInt(productId)
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Khách hàng này đã đánh giá sản phẩm này' },
        { status: 400 }
      )
    }

    // Tạo review mới với safeQuery
    const review = await safeQuery.create(prisma.review, {
      data: {
        customerId: parseInt(customerId),
        productId: parseInt(productId),
        rating: parseInt(rating),
        title: title || null,
        content: content || null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true
      }
    })

    return NextResponse.json(review, { status: 201 })

  } catch (error) {
    console.error('Review creation error:', error)
    
    // Nếu là lỗi connection, thử reconnect
    if (error instanceof Error && error.message.includes('prepared statement')) {
      console.log('Attempting database reconnection...')
      await DatabaseHelper.reconnect()
    }
    
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}