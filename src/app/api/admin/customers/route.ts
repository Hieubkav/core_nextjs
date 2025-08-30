import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// GET - Lấy danh sách khách hàng với phân trang và tìm kiếm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    // Xây dựng điều kiện tìm kiếm
    const whereConditions: any = {
      role: 'customer' // Chỉ lấy khách hàng
    }

    // Tìm kiếm theo tên hoặc email
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Lấy danh sách khách hàng với phân trang
    const [customers, totalCount] = await Promise.all([
      DatabaseHelper.executeWithRetry(async () => {
        return await prisma.user.findMany({
          where: whereConditions,
          orderBy: {
            createdAt: 'desc'
          },
          skip: offset,
          take: limit
        })
      }),
      DatabaseHelper.executeWithRetry(async () => {
        return await prisma.user.count({
          where: whereConditions
        })
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      customers: customers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages
      }
    })

  } catch (error) {
    console.error('Customers API GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi lấy danh sách khách hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}