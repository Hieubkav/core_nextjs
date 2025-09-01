import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// GET - Lấy chi tiết đơn hàng theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Lấy chi tiết đơn hàng cùng với các sản phẩm trong đơn hàng
    const order = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              },
              variant: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })
    })

    if (!order) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Không tìm thấy đơn hàng' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      order: order
    })

  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi lấy thông tin đơn hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật đơn hàng (chủ yếu là cập nhật trạng thái)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    // Kiểm tra đơn hàng có tồn tại không
    const existingOrder = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.order.findUnique({
        where: { id: parseInt(id) }
      })
    })

    if (!existingOrder) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Không tìm thấy đơn hàng' 
        },
        { status: 404 }
      )
    }

    // Cập nhật đơn hàng
    const updatedOrder = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.order.update({
        where: { id: parseInt(id) },
        data: {
          status: status || undefined,
          adminNotes: adminNotes || undefined,
          updatedAt: new Date()
        }
      })
    })

    console.log(`✅ Updated order ID: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Cập nhật đơn hàng thành công',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Order PUT error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi cập nhật đơn hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Xóa đơn hàng (chỉ nên cho admin với quyền cao)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Kiểm tra đơn hàng có tồn tại không
    const existingOrder = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.order.findUnique({
        where: { id: parseInt(id) }
      })
    })

    if (!existingOrder) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Không tìm thấy đơn hàng' 
        },
        { status: 404 }
      )
    }

    // Xóa đơn hàng (sẽ xóa cả các sản phẩm trong đơn hàng nhờ CASCADE)
    await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.order.delete({
        where: { id: parseInt(id) }
      })
    })

    console.log(`✅ Deleted order ID: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    })

  } catch (error) {
    console.error('Order DELETE error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi xóa đơn hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
