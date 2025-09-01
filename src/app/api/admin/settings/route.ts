import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

// Ensure Node runtime for Prisma and avoid caching
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Setting {
  id: number
  key: string
  value: string | null
  group: string
  label?: string | null
  description?: string | null
  type: string
  createdAt: Date | string
  updatedAt: Date | string
}

// GET - Lấy tất cả settings hoặc theo group (đọc từ bảng writable `settings`)
export async function GET(request: NextRequest) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group') || undefined

    const settings = await DatabaseHelper.executeWithRetry(async () => {
      if (group) {
        return await prisma.setting.findMany({
          where: { group },
          orderBy: { key: 'asc' }
        }) as unknown as Setting[]
      }
      return await prisma.setting.findMany({
        orderBy: [{ group: 'asc' }, { key: 'asc' }]
      }) as unknown as Setting[]
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

// PUT - Batch update settings (ghi vào bảng `settings`)
export async function PUT(request: NextRequest) {
  try {
    // Tạm thời disable auth check cho development
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { settings } = body || {}

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Dữ liệu settings không hợp lệ'
        },
        { status: 400 }
      )
    }

    // Batch update với transaction -> dùng model `setting` (writable)
    const entries = Object.entries(settings).map(([key, value]) => ({ key, value: String(value ?? '') }))

    const results = await DatabaseHelper.transaction(async (tx) => {
      const updatePromises = entries.map(({ key, value }) =>
        tx.setting.updateMany({ where: { key }, data: { value, updatedAt: new Date() } })
      )
      return await Promise.all(updatePromises)
    })

    const updated = results.reduce((sum: number, r: any) => sum + (r?.count ?? 0), 0)
    console.log(`✅ Updated ${updated} settings successfully`)

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${updated} settings thành công`,
      updated
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

// HEAD - tránh fallback HEAD->GET làm chậm
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

