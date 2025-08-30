import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

export async function GET(request: NextRequest) {
  try {
    // Kiểm tra kết nối
    await DatabaseHelper.executeWithRetry(async () => {
      await prisma.$queryRaw`SELECT 1`
    })
    
    // Lấy tất cả khách hàng
    const customers = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.customer.findMany()
    })
    
    // Đếm số lượng khách hàng
    const count = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.customer.count()
    })
    
    return NextResponse.json({
      success: true,
      message: `Found ${count} customers`,
      customers: customers,
      count: count
    })
  } catch (error) {
    console.error('Test customer API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error when testing customer data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}