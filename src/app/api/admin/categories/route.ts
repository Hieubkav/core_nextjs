import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

// GET - List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    // Sử dụng safeQuery với retry logic
    const [categories, total] = await Promise.all([
      safeQuery.findMany(prisma.category, {
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      safeQuery.count(prisma.category, { where })
    ])

    const pages = Math.ceil((total as number) / limit)

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })

  } catch (error) {
    console.error('Categories API error:', error)
    
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

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, slug, sortOrder, isVisible } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const finalSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Check if slug already exists với safeQuery
    const existingCategory = await safeQuery.findUnique(prisma.category, {
      where: { slug: finalSlug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Tạo category mới với safeQuery
    const category = await safeQuery.create(prisma.category, {
      data: {
        name,
        description: description || null,
        slug: finalSlug,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true
      }
    })

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Category creation error:', error)
    
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
