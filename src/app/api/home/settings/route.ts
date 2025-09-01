import { NextRequest, NextResponse } from 'next/server'
import { DatabaseHelper } from '@/lib/database-helper'
import { prisma } from '@/lib/prisma'

// Tránh gọi chéo nội bộ trên Vercel (gây chậm/timeout)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Truy vấn trực tiếp DB thay vì gọi nội bộ /api/admin/settings
    // Lưu ý: bảng nguồn là "Setting" (model prisma: public_Setting)
    const rows = await DatabaseHelper.executeWithRetry(() =>
      prisma.public_Setting.findMany({
        where: { group: { in: ['general', 'social'] } },
        select: { key: true, value: true, group: true },
        orderBy: [{ group: 'asc' }, { key: 'asc' }],
      })
    )

    const generalSettings = rows.filter(r => r.group === 'general')
    const socialSettings = rows.filter(r => r.group === 'social')
    const contactSettings = generalSettings // contact info nằm trong group general

    // Map settings to key-value
    const settingsMap: Record<string, string> = {}

    generalSettings.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value
    })

    socialSettings.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value
    })

    contactSettings.forEach((setting: any) => {
      if (['contact_email', 'contact_phone', 'address'].includes(setting.key)) {
        settingsMap[setting.key] = setting.value
      }
    })

    return NextResponse.json(settingsMap, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Home settings API error:', error)

    // If connection error, try reconnect
    if (error instanceof Error && error.message.includes('prepared statement')) {
      console.log('Attempting database reconnection...')
      await DatabaseHelper.reconnect()
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
