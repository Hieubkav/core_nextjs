import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// POST - Tạo đơn hàng mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, items, totalAmount } = body

    // Validate required fields
    if (!customerData || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Thông tin khách hàng và sản phẩm là bắt buộc' 
        },
        { status: 400 }
      )
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.variantId || !item.quantity || !item.price) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Thông tin sản phẩm không hợp lệ' 
          },
          { status: 400 }
        )
      }
    }

    // Tạo đơn hàng trong transaction
    const order = await DatabaseHelper.transaction(async (tx) => {
      let userId = null

      // Nếu có existingCustomerId thì sử dụng, ngược lại tạo mới user
      if (customerData.existingCustomerId) {
        userId = parseInt(customerData.existingCustomerId)
      } else {
        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await tx.user.findUnique({
          where: { email: customerData.email }
        })

        if (existingUser) {
          // Nếu email đã tồn tại, sử dụng user đó
          userId = existingUser.id
        } else {
          // Tạo user mới
          const newUser = await tx.user.create({
            data: {
              email: customerData.email,
              name: customerData.name,
              phone: customerData.phone || null,
              role: 'customer'
            }
          })
          userId = newUser.id
        }
      }

      // Tạo order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
          userId: userId,
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone || null,
          totalAmount: totalAmount,
          status: 'pending'
        }
      })

      // Tạo order items
      const orderItemPromises = items.map((item: any) => {
        return tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            price: item.price,
            quantity: item.quantity
          }
        })
      })

      await Promise.all(orderItemPromises)

      // Trả về order với các items
      return await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: true
        }
      })
    })

    console.log(`✅ Created order: ${order?.orderNumber}`)

    return NextResponse.json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      order: order
    }, { status: 201 })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi tạo đơn hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}