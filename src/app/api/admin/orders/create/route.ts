import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'
import { Prisma } from '@/generated/prisma'

// POST - Tạo đơn hàng mới
async function POST(request: NextRequest) {
  try {
    console.log('=== Order creation request received ===');
    
    // Log raw request headers và method để debug
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers));
    
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Lỗi khi phân tích dữ liệu yêu cầu',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }
    
    const { customerData, items, totalAmount } = body;

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
      let customerId = null

      // Log dữ liệu đầu vào để debug
      console.log('Order creation input:', { customerData, items, totalAmount });

      // Nếu có existingCustomerId thì sử dụng, ngược lại tạo mới customer
      if (customerData.existingCustomerId) {
        customerId = parseInt(customerData.existingCustomerId)
        console.log(`Using existing customer ID: ${customerId}`);
      } else {
        // Kiểm tra xem email đã tồn tại trong bảng customers chưa
        const existingCustomer = await tx.customer.findUnique({
          where: { email: customerData.email }
        })

        if (existingCustomer) {
          // Nếu email đã tồn tại, sử dụng customer đó
          customerId = existingCustomer.id
          console.log(`Using existing customer with email ${customerData.email}, ID: ${customerId}`);
        } else {
          // Tạo customer mới
          console.log('Creating new customer with data:', {
            email: customerData.email,
            name: customerData.name,
            sdt: customerData.phone || null
          });
          try {
            const newCustomer = await tx.customer.create({
              data: {
                email: customerData.email,
                name: customerData.name,
                sdt: customerData.phone || null
              }
            })
            customerId = newCustomer.id
            console.log(`Created new customer with ID: ${customerId}`);
          } catch (customerCreateError) {
            console.error('Error creating new customer:', customerCreateError);
            throw new Error(`Không thể tạo khách hàng mới: ${customerCreateError instanceof Error ? customerCreateError.message : 'Unknown error'}`);
          }
        }
      }

      // Kiểm tra customerId
      if (!customerId) {
        const error = new Error('Không thể xác định customerId cho đơn hàng');
        console.error('Customer ID is null. Customer data:', customerData);
        throw error;
      }

      console.log(`Final customerId to be used for order: ${customerId}`);

      // Tạo order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
          customerId: customerId,
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone || null,
          totalAmount: new Prisma.Decimal(totalAmount),
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
            price: new Prisma.Decimal(item.price),
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
    // Log thêm thông tin để debug
    console.error('Order creation error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type',
      timestamp: new Date().toISOString()
    })
    
    // Trả về thông tin lỗi chi tiết hơn
    const errorResponse: any = {
      success: false,
      error: 'Lỗi khi tạo đơn hàng',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
    
    // Luôn thêm stack trace để dễ debug
    if (error instanceof Error) {
      errorResponse.stack = error.stack
    }
    
    // Log response để debug
    console.log('Error response to be sent:', {
      ...errorResponse,
      timestamp: new Date().toISOString()
    });
    
    const response = NextResponse.json(errorResponse, { status: 500 });
    console.log('Error response created:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      timestamp: new Date().toISOString()
    });
    return response;
  }
}

// Wrapper function để đảm bảo luôn trả về response hợp lệ
const handler = async (request: NextRequest) => {
  console.log('=== Order creation handler called ===');
  try {
    console.log('Calling POST function');
    const result = await POST(request);
    console.log('POST function completed successfully');
    return result;
  } catch (error) {
    console.error('Unhandled error in order creation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi không xác định khi tạo đơn hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};

export { handler as POST };