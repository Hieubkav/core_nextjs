import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

// GET - List all sliders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { subtitle: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    // Sử dụng safeQuery với retry logic
    const [sliders, total] = await Promise.all([
      safeQuery.findMany(prisma.slider, {
        where,
        include: {
          image: true
        },
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      safeQuery.count(prisma.slider, { where })
    ])

    const pages = Math.ceil((total as number) / limit)

    return NextResponse.json({
      sliders,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })

  } catch (error) {
    console.error('Sliders API error:', error)
    
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

// POST - Create new slider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, subtitle, content, buttonText, buttonLink, imageId, sortOrder, isVisible } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Tạo slider mới với safeQuery
    const slider = await safeQuery.create(prisma.slider, {
      data: {
        title,
        subtitle: subtitle || null,
        content: content || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        imageId: imageId ? parseInt(imageId) : null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true
      },
      include: {
        image: true
      }
    })

    return NextResponse.json(slider, { status: 201 })

  } catch (error) {
    console.error('Slider creation error:', error)
    
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