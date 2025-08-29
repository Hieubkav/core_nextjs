import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

interface Setting {
  id: number
  key: string
  value: string
  group: string
  label: string
  description?: string
  type: string
  createdAt: Date
  updatedAt: Date
}

// GET - Lấy tất cả settings hoặc theo group
export async function GET(request: NextRequest) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group')

    const settings = await DatabaseHelper.executeWithRetry(async () => {
      if (group) {
        return await prisma.$queryRaw<Setting[]>`
          SELECT * FROM "Setting" 
          WHERE "group" = ${group}
          ORDER BY "key" ASC
        `
      } else {
        return await prisma.$queryRaw<Setting[]>`
          SELECT * FROM "Setting" 
          ORDER BY "group" ASC, "key" ASC
        `
      }
    })

    // Chuyển đổi data thành object grouped by group
    const groupedSettings: Record<string, Setting[]> = {}
    settings.forEach(setting => {
      if (!groupedSettings[setting.group]) {
        groupedSettings[setting.group] = []
      }
      groupedSettings[setting.group].push(setting)
    })

    return NextResponse.json({ 
      success: true,
      data: groupedSettings,
      total: settings.length
    })

  } catch (error) {
    console.error('Settings API GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi lấy dữ liệu settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PUT - Batch update settings
export async function PUT(request: NextRequest) {
  try {
    // Tạm thời disable auth check cho development  
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Dữ liệu settings không hợp lệ' 
        },
        { status: 400 }
      )
    }

    // Batch update với transaction
    const results = await DatabaseHelper.transaction(async (tx) => {
      const updatePromises = Object.entries(settings).map(([key, value]) => {
        return tx.$executeRaw`
          UPDATE "Setting" 
          SET "value" = ${String(value)}, "updatedAt" = NOW()
          WHERE "key" = ${key}
        `
      })

      return await Promise.all(updatePromises)
    })

    console.log(`✅ Updated ${results.length} settings successfully`)

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${results.length} settings thành công`,
      updated: results.length
    })

  } catch (error) {
    console.error('Settings API PUT error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Lỗi khi cập nhật settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}