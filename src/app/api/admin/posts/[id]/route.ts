import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get single Post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        thumbnail: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)

  } catch (error) {
    console.error('Post API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update Post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const post = await prisma.post.update({
      where: { id: parseInt(params.id) },
      data: {
        title,
        slug,
        excerpt: excerpt !== undefined ? excerpt : undefined,
        content: content !== undefined ? content : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
        status: status !== undefined ? status : undefined,
        thumbnailId: thumbnailId !== undefined ? (thumbnailId ? parseInt(thumbnailId) : null) : undefined,
      }
    })

    return NextResponse.json(post)

  } catch (error) {
    console.error('Post update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete Post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if Post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Delete Post
    await prisma.post.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Post delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}