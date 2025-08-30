import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// GET - Lấy danh sách đơn hàng với phân trang, tìm kiếm và lọc
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    // Xây dựng điều kiện tìm kiếm
    const whereConditions: any = {}

    // Tìm kiếm theo mã đơn hàng, tên khách hàng, email khách hàng
    if (search) {
      whereConditions.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Lọc theo trạng thái
    if (status) {
      whereConditions.status = status
    }

    // Lấy danh sách đơn hàng với phân trang
    const [orders, totalCount] = await Promise.all([
      DatabaseHelper.executeWithRetry(async () => {
        return await prisma.order.findMany({
          where: whereConditions,
          orderBy: {
            createdAt: 'desc'
          },
          skip: offset,
          take: limit
        })
      }),
      DatabaseHelper.executeWithRetry(async () => {
        return await prisma.order.count({
          where: whereConditions
        })
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      orders: orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Orders API GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi lấy danh sách đơn hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}