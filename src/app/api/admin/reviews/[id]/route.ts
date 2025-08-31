import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RouteCtx } from '@/lib/route-types'

// GET - Get single review
export async function GET(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
  try {
    const { id } = await params;
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
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

    if (!review) {
      return NextResponse.json(
        { error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      )
    }

    return NextResponse.json(review)

  } catch (error) {
    console.error('Review API error:', error)
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}

// PUT - Update review
export async function PUT(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
 try {
    const { id } = await params;
    const body = await request.json()
    const { customerId, productId, rating, title, content, sortOrder, isVisible } = body

    // Validate required fields
    if (!customerId || !productId || !rating) {
      return NextResponse.json(
        { error: 'Customer ID, Product ID và Rating là bắt buộc' },
        { status: 400 }
      )
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Không tìm thấy đánh giá' },
        { status: 404 }
      )
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if another review already exists for this customer and product (excluding current review)
    const duplicateReview = await prisma.review.findFirst({
      where: {
        customerId: parseInt(customerId),
        productId: parseInt(productId),
        id: { not: parseInt(id) }
      }
    })

    if (duplicateReview) {
      return NextResponse.json(
        { error: 'Khách hàng này đã có đánh giá cho sản phẩm này' },
        { status: 400 }
      )
    }

    const review = await prisma.review.update({
      where: { id: parseInt(id) },
      data: {
        customerId: parseInt(customerId),
        productId: parseInt(productId),
        rating: parseInt(rating),
        title: title || null,
        content: content || null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      }
    })

    return NextResponse.json(review)

  } catch (error) {
    console.error('Review update error:', error)
    return NextResponse.json(
      { error: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}

// DELETE - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
  try {
    const { id } = await params;
    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Delete review
    await prisma.review.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Review delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}