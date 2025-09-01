import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get single FAQ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const faq = await prisma.fAQ.findUnique({
      where: { id: parseInt((await params).id) }
    })

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(faq)

  } catch (error) {
    console.error('FAQ API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { question, answer, sortOrder, isVisible } = body

    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      )
    }

    const faq = await prisma.fAQ.update({
      where: { id: parseInt((await params).id) },
      data: {
        question,
        answer,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      }
    })

    return NextResponse.json(faq)

  } catch (error) {
    console.error('FAQ update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if FAQ exists
    const faq = await prisma.fAQ.findUnique({
      where: { id: parseInt((await params).id) }
    })

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    // Delete FAQ
    await prisma.fAQ.delete({
      where: { id: parseInt((await params).id) }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('FAQ delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
