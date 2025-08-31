import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RouteCtx } from '@/lib/route-types'

// GET - Get single slider
export async function GET(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
  try {
    const { id } = await params;
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(id) },
      include: {
        image: true
      }
    })

    if (!slider) {
      return NextResponse.json(
        { error: 'Slider not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(slider)

  } catch (error) {
    console.error('Slider API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update slider
export async function PUT(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { title, subtitle, content, buttonText, buttonLink, imageId, sortOrder, isVisible } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const slider = await prisma.slider.update({
      where: { id: parseInt(id) },
      data: {
        title,
        subtitle: subtitle || null,
        content: content || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        imageId: imageId ? parseInt(imageId) : null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      },
      include: {
        image: true
      }
    })

    return NextResponse.json(slider)

  } catch (error) {
    console.error('Slider update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete slider
export async function DELETE(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
  try {
    const { id } = await params;
    // Check if slider exists
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    })

    if (!slider) {
      return NextResponse.json(
        { error: 'Slider not found' },
        { status: 404 }
      )
    }

    // Delete slider
    await prisma.slider.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Slider delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}