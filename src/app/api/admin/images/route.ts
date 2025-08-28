import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { filename: { contains: search, mode: 'insensitive' as const } },
        { originalName: { contains: search, mode: 'insensitive' as const } },
        { alt: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.image.count({ where })
    ])

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Images API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Save image metadata after client-side upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, originalName, alt, title, size, mimeType, url } = body

    // Validate required fields
    if (!filename || !url) {
      return NextResponse.json(
        { error: 'Filename and URL are required' },
        { status: 400 }
      )
    }

    // Save metadata to database
    const image = await prisma.image.create({
      data: {
        filename,
        originalName: originalName || filename,
        alt: alt || originalName || filename,
        title: title || originalName || filename,
        size: size || 0,
        mimeType: mimeType || 'image/jpeg',
        url,
        sortOrder: 0,
        isVisible: true
      }
    })

    return NextResponse.json(image, { status: 201 })

  } catch (error) {
    console.error('Image metadata save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
