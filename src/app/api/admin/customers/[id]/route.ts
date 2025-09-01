import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// GET - Get single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.customer.findUnique({
        where: { id: parseInt((await params).id) }
      })
    })

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không tìm thấy khách hàng'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      customer: customer
    })

  } catch (error) {
    console.error('Customer API GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi lấy thông tin khách hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { name, email, password, sdt, diaChi, ghiChu, isActive } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tên và email là bắt buộc'
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email không hợp lệ'
        },
        { status: 400 }
      )
    }

    // Check if email already exists (excluding current customer)
    const existingCustomer = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.customer.findFirst({
        where: {
          email: email,
          id: { not: parseInt((await params).id) }
        }
      })
    })

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email đã được sử dụng'
        },
        { status: 400 }
      )
    }

    // Update customer
    const customer = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.customer.update({
        where: { id: parseInt((await params).id) },
        data: {
          name,
          email,
          password: password || undefined, // Không hash password
          sdt: sdt || null,
          diaChi: diaChi || null,
          ghiChu: ghiChu || null,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined
        }
      })
    })

    console.log(`✅ Updated customer: ${customer.email}`)

    return NextResponse.json({
      success: true,
      message: 'Cập nhật khách hàng thành công',
      customer: customer
    })

  } catch (error) {
    console.error('Customer update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi cập nhật khách hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if customer exists
    const customer = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.customer.findUnique({
        where: { id: parseInt((await params).id) }
      })
    })

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không tìm thấy khách hàng'
        },
        { status: 404 }
      )
    }

    // Delete customer
    await DatabaseHelper.executeWithRetry(async () => {
      await prisma.customer.delete({
        where: { id: parseInt((await params).id) }
      })
    })

    console.log(`✅ Deleted customer: ${customer.email}`)

    return NextResponse.json({
      success: true,
      message: 'Xóa khách hàng thành công'
    })

  } catch (error) {
    console.error('Customer delete error:', error)
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
