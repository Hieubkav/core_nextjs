import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'
import { RouteCtx } from '@/lib/route-types'

// GET - Get single image
export async function GET(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
  try {
    const { id } = await params;
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(image)

  } catch (error) {
    console.error('Image API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update image metadata
export async function PUT(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { alt, title, sortOrder, isVisible } = body

    const image = await prisma.image.update({
      where: { id: parseInt(id) },
      data: {
        alt,
        title,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      }
    })

    return NextResponse.json(image)

  } catch (error) {
    console.error('Image update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to extract file path from Supabase URL
function extractFilePathFromUrl(url: string): string {
  // URL format: https://xxx.supabase.co/storage/v1/object/public/banacc/images/filename.jpg
  const parts = url.split('/storage/v1/object/public/banacc/')
  return parts[1] || ''
}

// DELETE - Delete image
export async function DELETE(
  request: NextRequest,
  { params }: RouteCtx<{ id: string }>
) {
  try {
    const { id } = await params;
    // Get image info first
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Delete from Supabase Storage using admin client
    const filePath = extractFilePathFromUrl(image.url)
    if (filePath && supabaseAdmin) {
      const { error } = await supabaseAdmin.storage
        .from('banacc')
        .remove([filePath])

      if (error) {
        console.error('Supabase delete error:', error)
        // Continue with DB deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.image.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Image delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
