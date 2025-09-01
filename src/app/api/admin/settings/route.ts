import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DatabaseHelper } from '@/lib/database-helper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

// GET - lấy tất cả settings hoặc theo group
export async function GET(request: NextRequest) {
  try {
    // Tạm thời bỏ qua auth khi dev
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

    // Group theo field group
    const groupedSettings: Record<string, Setting[]> = {}
    settings.forEach((setting) => {
      if (!groupedSettings[setting.group]) groupedSettings[setting.group] = []
      groupedSettings[setting.group].push(setting)
    })

    return NextResponse.json({ success: true, data: groupedSettings, total: settings.length })
  } catch (error) {
    console.error('Settings API GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi lấy dữ liệu settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// PUT - batch update settings (theo approach FAQ dùng Prisma client)
export async function PUT(request: NextRequest) {
  try {
    // Tạm thời bỏ qua auth khi dev
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { settings } = body as { settings: Record<string, unknown> }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, error: 'Dữ liệu settings không hợp lệ' }, { status: 400 })
    }

    // Chuẩn hóa payload
    const payload = Object.entries(settings).map(([key, value]) => ({
      key: String(key),
      value: String(value ?? ''),
    }))

    // Sử dụng batch transaction (mảng promises) để tránh interactive transaction trên pgbouncer
    const ops = payload.map(({ key, value }) =>
      prisma.public_Setting.updateMany({ where: { key }, data: { value, updatedAt: new Date() } })
    )

    const results = await DatabaseHelper.executeWithRetry(() =>
      prisma.$transaction(ops as any, { timeout: 8000, maxWait: 5000 })
    )

    const updatedCount = results.reduce((sum: number, r: any) => sum + (r?.count ?? 0), 0)

    return NextResponse.json({ success: true, message: `Đã cập nhật ${updatedCount} settings`, updated: updatedCount })
  } catch (error) {
    console.error('Settings API PUT error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Lỗi khi cập nhật settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
