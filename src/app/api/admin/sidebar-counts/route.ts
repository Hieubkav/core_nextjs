import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get counts for sidebar badges
    const [imagesCount, categoriesCount] = await Promise.all([
      prisma.image.count(),
      prisma.category.count()
    ])

    return NextResponse.json({
      images: imagesCount,
      categories: categoriesCount
    })
  } catch (error) {
    console.error('Sidebar counts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sidebar counts' },
      { status: 500 }
    )
  }
}
