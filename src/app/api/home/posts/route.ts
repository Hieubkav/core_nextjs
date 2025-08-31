import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeQuery, DatabaseHelper } from '@/lib/database-helper'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Sử dụng safeQuery với retry logic
    const posts: any[] = await safeQuery.findMany(prisma.post, {
      where: {
        isVisible: true,
        status: 'published'
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      },
      take: limit,
      include: {
        thumbnail: true
      }
    })

    // Map posts to include thumbnail URL
    const mappedPosts = posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
      sortOrder: post.sortOrder,
      isVisible: post.isVisible,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      thumbnailUrl: post.thumbnail ? post.thumbnail.url : null
    }))

    return NextResponse.json(mappedPosts)
  } catch (error) {
    console.error('Home posts API error:', error)
    
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