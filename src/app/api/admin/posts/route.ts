import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

// GET - List all Posts
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
        { excerpt: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    // Sử dụng safeQuery với retry logic
    const [posts, total] = await Promise.all([
      safeQuery.findMany(prisma.post, {
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          thumbnail: true
        }
      }),
      safeQuery.count(prisma.post, { where })
    ])

    const pages = Math.ceil((total as number) / limit)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })

  } catch (error) {
    console.error('Posts API error:', error)
    
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

// POST - Create new Post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, excerpt, content, sortOrder, isVisible, status, thumbnailId } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Tạo Post mới với safeQuery
    const post = await safeQuery.create(prisma.post, {
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
        status: status || 'published',
        thumbnailId: thumbnailId ? parseInt(thumbnailId) : null
      }
    })

    return NextResponse.json(post, { status: 201 })

  } catch (error) {
    console.error('Post creation error:', error)
    
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