import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// GET - Lấy danh sách variants của một sản phẩm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'productId là bắt buộc' 
        },
        { status: 400 }
      )
    }

    // Lấy danh sách variants của sản phẩm
    const variants = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.productVariant.findMany({
        where: {
          productId: parseInt(productId)
        },
        orderBy: {
          sortOrder: 'asc'
        }
      })
    })

    return NextResponse.json({
      success: true,
      variants: variants
    })

  } catch (error) {
    console.error('Product variants API GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi lấy danh sách variants',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}