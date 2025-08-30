import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'
import bcrypt from 'bcryptjs'

// Add bcryptjs to package.json dependencies
// "bcryptjs": "^2.4.3"

// POST - Tạo khách hàng mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tên, email và mật khẩu là bắt buộc' 
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

    // Check if email already exists
    const existingUser = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.user.findUnique({
        where: { email }
      })
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email đã được sử dụng' 
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create customer
    const customer = await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.user.create({
        data: {
          name,
          email,
          role: 'customer',
          isActive: true
        }
      })
    })

    console.log(`✅ Created customer: ${customer.email}`)

    return NextResponse.json({
      success: true,
      message: 'Tạo khách hàng thành công',
      customer: customer
    }, { status: 201 })

  } catch (error) {
    console.error('Customer creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi tạo khách hàng',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}