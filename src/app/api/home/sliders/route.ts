import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    // Sử dụng safeQuery với retry logic
    const sliders: any[] = await safeQuery.findMany(prisma.slider, {
      where: {
        isVisible: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      include: {
        image: true
      }
    })

    // Map sliders to include image URL
    const mappedSliders = sliders.map((slider: any) => ({
      id: slider.id,
      title: slider.title,
      subtitle: slider.subtitle,
      content: slider.content,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink,
      sortOrder: slider.sortOrder,
      isVisible: slider.isVisible,
      createdAt: slider.createdAt,
      updatedAt: slider.updatedAt,
      imageUrl: slider.image ? slider.image.url : null
    }))

    return NextResponse.json(mappedSliders)
  } catch (error) {
    console.error('Home sliders API error:', error)
    
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