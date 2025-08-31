import { NextRequest, NextResponse } from 'next/server'
import { DatabaseHelper } from '@/lib/database-helper'

export async function GET(request: NextRequest) {
  try {
    // Gọi API admin settings để lấy tất cả settings
    const adminSettingsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/settings`)
    const adminSettingsData = await adminSettingsRes.json()
    
    if (!adminSettingsData.success) {
      return NextResponse.json(
        { error: 'Failed to fetch admin settings' },
        { status: 500 }
      )
    }
    
    // Lấy các nhóm settings cần thiết
    const generalSettings = adminSettingsData.data.general || []
    const socialSettings = adminSettingsData.data.social || []
    const contactSettings = adminSettingsData.data.general || [] // Contact info is in general group
    
    // Map settings to key-value pairs for easier access
    const settingsMap: Record<string, string> = {}
    
    // Process general settings
    generalSettings.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value
    })
    
    // Process social settings
    socialSettings.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value
    })
    
    // Process contact settings (from general group)
    contactSettings.forEach((setting: any) => {
      if (['contact_email', 'contact_phone', 'address'].includes(setting.key)) {
        settingsMap[setting.key] = setting.value
      }
    })
    
    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Home settings API error:', error)
    
    // Nếu là lỗi connection, thử reconnect
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