import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// GET - Lấy setting theo key
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { key } = params

    const setting = await DatabaseHelper.executeWithRetry(async () => {
      const result = await prisma.$queryRaw<any[]>`
        SELECT * FROM "Setting" WHERE "key" = ${key} LIMIT 1
      `
      return result[0] || null
    })

    if (!setting) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Setting không tồn tại' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: setting
    })

  } catch (error) {
    console.error('Setting GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi lấy setting',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật setting theo key
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { key } = params
    const body = await request.json()
    const { value } = body

    if (value === undefined || value === null) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Giá trị value là bắt buộc' 
        },
        { status: 400 }
      )
    }

    // Kiểm tra setting có tồn tại không
    const existingSetting = await DatabaseHelper.executeWithRetry(async () => {
      const result = await prisma.$queryRaw<any[]>`
        SELECT * FROM "Setting" WHERE "key" = ${key} LIMIT 1
      `
      return result[0] || null
    })

    if (!existingSetting) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Setting không tồn tại' 
        },
        { status: 404 }
      )
    }

    // Cập nhật setting
    await DatabaseHelper.executeWithRetry(async () => {
      return await prisma.$executeRaw`
        UPDATE "Setting" 
        SET "value" = ${String(value)}, "updatedAt" = NOW()
        WHERE "key" = ${key}
      `
    })

    console.log(`✅ Updated setting ${key} = ${value}`)

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật setting ${key} thành công`,
      data: {
        key,
        value: String(value),
        updatedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Setting PUT error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi cập nhật setting',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}