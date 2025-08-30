import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// POST - Bulk delete customers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerIds } = body

    // Validate required fields
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Danh sách ID khách hàng không hợp lệ'
        },
        { status: 400 }
      )
    }

    // Delete customers
    const deletedCustomers = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.customer.deleteMany({
        where: {
          id: {
            in: customerIds
          }
        }
      })
    })

    console.log(`✅ Deleted ${deletedCustomers.count} customers`)

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công ${deletedCustomers.count} khách hàng`,
      deletedCount: deletedCustomers.count
    })

  } catch (error) {
    console.error('Customer bulk delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi xóa khách hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}